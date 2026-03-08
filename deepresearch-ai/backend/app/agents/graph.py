import os
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

from app.agents.state import ResearchState
from app.agents.nodes.planner import planner_node
from app.agents.nodes.searcher import search_coordinator_node, search_agent_node
from app.agents.nodes.rag import rag_node
from app.agents.nodes.writer import writer_node
from app.agents.nodes.critic import critic_node
from app.config import get_settings

settings = get_settings()

def should_continue(state: ResearchState):
    if state["quality_score"] >= 7.0 or state["revision_count"] >= state["max_revisions"]:
        return END
    return "writer"

def build_graph():
    builder = StateGraph(ResearchState)
    
    builder.add_node("planner", planner_node)
    builder.add_node("search_coordinator", search_coordinator_node)
    builder.add_node("search_agent", search_agent_node)
    builder.add_node("rag_retriever", rag_node)
    builder.add_node("writer", writer_node)
    builder.add_node("critic", critic_node)
    
    builder.add_edge(START, "planner")
    
    # After planner, we would ideally interrupt, but for now we go to search_coordinator
    # Actual interrupt needs checkpointer and graph.compile(interrupt_before=["search_coordinator"])
    builder.add_edge("planner", "search_coordinator")
    
    # Conditional edge from coordinator to parallel search agents
    builder.add_conditional_edges("search_coordinator", lambda state: ["search_agent"] * 3 if state.get("assigned_queries") else ["search_agent"])
    
    # In LangGraph Send() API, the output of parallel nodes goes to the next nodes.
    # To simplify for the boilerplate:
    builder.add_edge("search_agent", "rag_retriever")
    builder.add_edge("rag_retriever", "writer")
    builder.add_edge("writer", "critic")
    
    builder.add_conditional_edges("critic", should_continue)
    
    return builder

async def run_graph(session_id: str, topic: str, thread_id: str, uploaded_doc_ids: list[str] = [], user_id: str = ""):
    from app.utils.streaming import publish_completed_event
    import redis.asyncio as aioredis
    
    engine = create_async_engine(settings.DATABASE_URL)
    
    # Use AsyncPostgresSaver when implementing full persistence
    # async with AsyncPostgresSaver.from_conn_string(settings.DATABASE_URL) as checkpointer:
    #    await checkpointer.setup()
    #    graph = build_graph().compile(checkpointer=checkpointer, interrupt_before=["search_coordinator"])
    
    graph = build_graph().compile()
    
    initial_state = {
        "topic": topic,
        "session_id": session_id,
        "user_id": user_id,
        "thread_id": thread_id,
        "uploaded_doc_ids": uploaded_doc_ids,
        "plan_approved": False,
        "search_results": [],
        "draft_report": None,
        "final_report": None,
        "citations": [],
        "quality_score": 0.0,
        "critic_feedback": "",
        "revision_count": 0,
        "max_revisions": 2,
        "status": "started",
        "error": None
    }
    
    config = {"configurable": {"thread_id": thread_id}}
    
    try:
        async for event in graph.astream(initial_state, config=config, stream_mode="values"):
            pass # the nodes themselves will publish SSE
        
        final_state = await graph.aget_state(config)
        # Save report logic here
        
        redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await publish_completed_event(session_id, "mock_report_id", redis_client)
        await redis_client.close()
        
    except Exception as e:
        print(f"Graph execution failed: {e}")
        from app.utils.streaming import publish_error_event
        redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await publish_error_event(session_id, str(e), redis_client)
        await redis_client.close()
