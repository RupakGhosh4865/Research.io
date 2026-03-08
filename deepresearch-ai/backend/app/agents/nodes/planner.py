from app.agents.state import ResearchState, ResearchPlan
from langchain_openai import ChatOpenAI
import redis.asyncio as aioredis
from app.config import get_settings
from app.utils.streaming import publish_agent_event
import asyncio

settings = get_settings()

SYSTEM_PROMPT = """You are a research planning expert.
Your goal is to break down complex topics into an actionable research plan.
Given a topic, create a structured research plan that includes:
- sub_questions: 5-7 distinct questions that cover the breadth and depth of the topic.
- search_queries: 8-10 specific search queries tailored for a search engine to gather diverse information (factual, analytical, recent).
- approach: A short paragraph explaining your methodological approach to researching this topic.
- estimated_sections: 5-7 section titles for the final comprehensive report.

Make sure the queries are diverse and designed to surface high-quality, authoritative sources."""

async def planner_node(state: ResearchState) -> dict:
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    session_id = state.get("session_id")
    
    await publish_agent_event(
        session_id=session_id, 
        agent_name="planner", 
        status="thinking", 
        content="Analyzing your research topic...", 
        redis_client=redis_client
    )
    
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY)
    structured_llm = llm.with_structured_output(ResearchPlan)
    
    # In a real app, invoke the prompt.
    plan: ResearchPlan = await structured_llm.ainvoke([
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Topic: {state['topic']}"}
    ])
    
    await publish_agent_event(
        session_id=session_id, 
        agent_name="planner", 
        status="completed", 
        content=f"Created plan with {len(plan['sub_questions'])} sub-questions", 
        redis_client=redis_client
    )
    
    await redis_client.close()
    
    return {
        "research_plan": plan, 
        "current_agent": "planner", 
        "status": "awaiting_approval"
    }
