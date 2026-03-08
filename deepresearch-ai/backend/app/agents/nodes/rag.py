from app.agents.state import ResearchState
import redis.asyncio as aioredis
from app.config import get_settings
from app.utils.streaming import publish_agent_event
from app.agents.tools.pinecone_tool import retrieve_from_docs

settings = get_settings()

async def rag_node(state: ResearchState) -> dict:
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    session_id = state.get("session_id")
    doc_ids = state.get("uploaded_doc_ids", [])
    
    await publish_agent_event(
        session_id=session_id,
        agent_name="rag",
        status="thinking",
        content="Searching your uploaded documents...",
        redis_client=redis_client
    )
    
    if not doc_ids:
        await publish_agent_event(
            session_id=session_id,
            agent_name="rag",
            status="completed",
            content="No documents to search",
            redis_client=redis_client
        )
        await redis_client.close()
        return {}
        
    queries = state["research_plan"]["sub_questions"] if state.get("research_plan") else [state.get("topic")]
    
    rag_results = await retrieve_from_docs(queries, doc_ids, namespace=settings.PINECONE_INDEX_NAME)
    
    await publish_agent_event(
        session_id=session_id,
        agent_name="rag",
        status="completed",
        content=f"Found {len(rag_results)} relevant passages from your documents",
        redis_client=redis_client
    )
    
    await redis_client.close()
    return {"search_results": rag_results}
