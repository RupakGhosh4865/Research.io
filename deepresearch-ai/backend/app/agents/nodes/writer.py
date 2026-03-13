from app.agents.state import ResearchState
import redis.asyncio as aioredis
from app.config import get_settings
from app.utils.streaming import publish_agent_event
from langchain_groq import ChatGroq
from langchain_core.callbacks import AsyncCallbackHandler
import re

settings = get_settings()

SYSTEM_PROMPT = """You are a world-class academic researcher and professional technical writer at a top-tier research institution.
Your task is to produce an exceptional, publication-quality research paper based on the provided search results and context.

Writing Guidelines:
1. **Academic Tone**: Use a formal, objective, and sophisticated academic tone. Avoid colloquialisms and maintain a professional voice throughout.
2. **Structural Precision**: Follow a rigorous academic structure: 
   - Abstract (Concise summary of findings)
   - Introduction (Context, problem statement, and objectives)
   - Methodology (How the research was synthesized)
   - Detailed Analysis (Organized by the research plan sections)
   - Discussion (Implications and synthesis of findings)
   - Conclusion (Summary and future outlook)
   - References (Formatted in a consistent style)
3. **Deep Analysis**: Go beyond mere summary. Synthesize information from multiple sources to provide unique insights and a comprehensive overview.
4. **Rigorous Citation**: Include numbered citations [1], [2], etc., for every factual claim, statistical data point, or unique concept derived from the sources.
5. **Length and Depth**: Aim for extreme depth. The paper should be extensive (minimum 2500-3000 words) and thoroughly explore the topic's nuances.
6. **Critic Integration**: If feedback is provided, address it with surgical precision to elevate the paper's quality to the highest possible standard.

Your goal is to create a definitive resource on the topic that is indistinguishable from a peer-reviewed journal article.
"""

class StreamingCallback(AsyncCallbackHandler):
    def __init__(self, publish_func, session_id, redis_client):
        self.publish_func = publish_func
        self.session_id = session_id
        self.redis_client = redis_client
        self.token_count = 0
        
    async def on_llm_new_token(self, token: str, **kwargs) -> None:
        self.token_count += 1
        if self.token_count % 100 == 0:
            import asyncio
            # In a callback we should schedule it if not strictly async Context
            asyncio.create_task(self.publish_func(
                session_id=self.session_id,
                agent_name="writer",
                status="thinking",
                content=f"Writing report... ({self.token_count} tokens)",
                redis_client=self.redis_client
            ))

async def writer_node(state: ResearchState) -> dict:
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    session_id = state.get("session_id")
    rev = state.get("revision_count", 0)
    
    await publish_agent_event(
        session_id=session_id,
        agent_name="writer",
        status="thinking",
        content=f"Writing research report (revision {rev + 1})...",
        redis_client=redis_client
    )
    
    # Truncate and limit results to save tokens and avoid 429 errors
    results = state.get("search_results", [])
    # Limit to top 10 results and truncate each to ~1500 chars (600-800 tokens approx)
    limited_results = results[:10]
    
    context_sections = []
    for i, r in enumerate(limited_results):
        content = r['content'][:1500]
        context_sections.append(f"Source [{i+1}] {r['url']}\nTitle: {r.get('title', 'N/A')}\nContent: {content}...")
    
    context_str = "\n\n".join(context_sections)
    
    prompt = f"Topic: {state.get('topic')}\n\nContext:\n{context_str}"
    if rev > 0 and state.get("critic_feedback"):
        prompt += f"\n\nCritic Feedback to Address:\n{state.get('critic_feedback')}"
        
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=settings.GROQ_API_KEY,
        streaming=True,
        callbacks=[StreamingCallback(publish_agent_event, session_id, redis_client)]
    )
    
    # Simple retry logic for 429s (Groq specific)
    attempts = 0
    max_attempts = 3
    report_text = ""
    
    while attempts < max_attempts:
        try:
            response = await llm.ainvoke([
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ])
            report_text = response.content
            break
        except Exception as e:
            attempts += 1
            if "429" in str(e) and attempts < max_attempts:
                import asyncio
                wait_time = attempts * 5
                await publish_agent_event(session_id, "writer", "thinking", f"Rate limited. Retrying in {wait_time}s...", redis_client)
                await asyncio.sleep(wait_time)
            else:
                raise e
    
    # Correctly collect citations from the used results
    citations = [
        {"url": r["url"], "title": r.get("title", r["url"])}
        for r in limited_results
    ]
    
    await publish_agent_event(
        session_id=session_id,
        agent_name="writer",
        status="completed",
        content="Report draft complete. Running quality review...",
        redis_client=redis_client
    )
    await redis_client.close()
    
    return {
        "draft_report": report_text,
        "citations": citations,
        "revision_count": rev + 1
    }
