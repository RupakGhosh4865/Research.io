from app.agents.state import ResearchState
import redis.asyncio as aioredis
from app.config import get_settings
from app.utils.streaming import publish_agent_event
from langchain_groq import ChatGroq
from pydantic import BaseModel
from typing import Literal

settings = get_settings()

class CriticOutput(BaseModel):
    quality_score: float
    strengths: list[str]
    weaknesses: list[str]
    specific_improvements: list[str]
    verdict: Literal["approve", "revise"]

SYSTEM_PROMPT = """You are an expert review editor. 
Evaluate the following research report on factual accuracy, citation quality, depth, and structure.

Return your evaluation as a JSON object with:
- quality_score: A float from 0.0 to 10.0.
- strengths: A list of strings.
- weaknesses: A list of strings.
- specific_improvements: A list of strings.
- verdict: Either "approve" or "revise".

Be extremely critical. If the score is below 7.0, issue a 'revise' verdict.
Return ONLY the JSON object."""

async def critic_node(state: ResearchState) -> dict:
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    session_id = state.get("session_id")
    
    await publish_agent_event(
        session_id=session_id,
        agent_name="critic",
        status="thinking",
        content="Reviewing report quality...",
        redis_client=redis_client
    )
    
    llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY)
    structured_llm = llm.with_structured_output(CriticOutput, method="json_mode")
    
    draft = state.get("draft_report", "")
    # Truncate draft for critic if it's very long (concentrate on quality over full volume)
    critic_prompt_draft = draft[:8000] if len(draft) > 8000 else draft

    # Simple retry logic for 429s
    attempts = 0
    max_attempts = 3
    evaluation = None

    while attempts < max_attempts:
        try:
            evaluation = await structured_llm.ainvoke([
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Topic: {state.get('topic')}\n\nReport Draft (Excerpt):\n{critic_prompt_draft}"}
            ])
            break
        except Exception as e:
            attempts += 1
            if "429" in str(e) and attempts < max_attempts:
                import asyncio
                await asyncio.sleep(attempts * 5)
            else:
                raise e
    
    score = evaluation.quality_score
    approved = evaluation.verdict == "approve"
    feedback_str = "\n".join(evaluation.specific_improvements)
    
    if approved or state.get("revision_count", 0) >= state.get("max_revisions", 2):
        final_report = draft
        status_event = "completed"
    else:
        final_report = None
        status_event = "revising"
        
    await publish_agent_event(
        session_id=session_id,
        agent_name="critic",
        status="completed",
        content=f"Quality score: {score}/10. {'Approved!' if approved else 'Requesting revision...'}",
        redis_client=redis_client
    )
    await redis_client.close()
    
    return {
        "quality_score": score,
        "critic_feedback": feedback_str,
        "final_report": final_report,
        "status": status_event
    }
