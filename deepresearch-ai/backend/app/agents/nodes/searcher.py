from langgraph.constants import Send
from app.agents.state import ResearchState
import redis.asyncio as aioredis
from app.config import get_settings
from app.utils.streaming import publish_agent_event
from app.agents.tools.tavily_tool import search_web

settings = get_settings()

async def search_coordinator_node(state: ResearchState) -> list:
    queries = state["research_plan"]["search_queries"] if state.get("research_plan") else []
    
    if not queries:
        return [Send("search_agent", {**state, "assigned_queries": []})]
        
    part_size = max(1, len(queries) // 3)
    p1 = queries[0:part_size]
    p2 = queries[part_size:part_size*2]
    p3 = queries[part_size*2:]
    
    return [
        Send("search_agent", {**state, "assigned_queries": p1}),
        Send("search_agent", {**state, "assigned_queries": p2}),
        Send("search_agent", {**state, "assigned_queries": p3}),
    ]

async def search_agent_node(state: dict) -> dict:
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    session_id = state.get("session_id", "unknown")
    queries = state.get("assigned_queries", [])
    
    all_results = []
    
    for query in queries:
        await publish_agent_event(
            session_id=session_id,
            agent_name="searcher",
            status="searching",
            content=f"Searching: {query}",
            redis_client=redis_client
        )
        # Call Tavily
        results = await search_web(query, max_results=3)
        all_results.extend(results)
        
    await redis_client.close()
    return {"search_results": all_results}
