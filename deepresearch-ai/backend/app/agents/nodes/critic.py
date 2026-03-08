from app.agents.state import ResearchState
import redis.asyncio as aioredis
from app.config import get_settings
from app.utils.streaming import publish_agent_event
from langchain_openai import ChatOpenAI
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
Evaluate the following research report on:
- Factual accuracy
- Citation quality and density
- Depth of analysis
- Structure and flow
- Clarity
- Completeness relative to the original topic

Provide a rigorous score from 0.0 to 10.0. Be extremely critical. If the score is below 7.0, issue a 'revise' verdict and list specific improvements."""

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
    
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY)
    structured_llm = llm.with_structured_output(CriticOutput)
    
    draft = state.get("draft_report", "")
    
    evaluation: CriticOutput = await structured_llm.ainvoke([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Topic: {state.get('topic')}\n\nReport:\n{draft}"}
    ])
    
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
