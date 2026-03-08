from app.agents.state import ResearchState
import redis.asyncio as aioredis
from app.config import get_settings
from app.utils.streaming import publish_agent_event
from langchain_openai import ChatOpenAI
from langchain_core.callbacks import AsyncCallbackHandler
import re

settings = get_settings()

SYSTEM_PROMPT = """You are an expert academic researcher and technical writer.
Your task is to write a comprehensive, well-structured research report based on the provided search results and context.
Requirements:
1. Include numbered citations [1], [2], etc., corresponding to the sources used.
2. Structure the report precisely: Executive Summary, Introduction, the sections outlined in the research plan, Conclusion, and References.
3. The report must be highly detailed (minimum 2000 words if possible given the context) and thoroughly analyze the topic.
4. Cite every factual claim using the provided sources.
5. If revising an existing draft, address the critic's specific feedback meticulously.
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
    
    context_str = "\n\n".join([f"Source [{i+1}] {r['url']}:\n{r['content']}" for i, r in enumerate(state.get("search_results", []))])
    
    prompt = f"Topic: {state.get('topic')}\n\nContext:\n{context_str}"
    if rev > 0 and state.get("critic_feedback"):
        prompt += f"\n\nCritic Feedback to Address:\n{state.get('critic_feedback')}"
        
    llm = ChatOpenAI(
        model="gpt-4o", 
        api_key=settings.OPENAI_API_KEY, 
        streaming=True, 
        callbacks=[StreamingCallback(publish_agent_event, session_id, redis_client)]
    )
    
    response = await llm.ainvoke([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ])
    
    report_text = response.content
    
    citations = []
    
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
