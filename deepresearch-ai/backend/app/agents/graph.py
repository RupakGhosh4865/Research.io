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
    builder.add_node("search_agent", search_agent_node)
    builder.add_node("rag_retriever", rag_node)
    builder.add_node("writer", writer_node)
    builder.add_node("critic", critic_node)
    
    builder.add_edge(START, "planner")
    
    builder.add_conditional_edges("planner", search_coordinator_node)
    
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
    
    db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    engine = create_async_engine(db_url)
    
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
        final_state = initial_state
        async for event in graph.astream(initial_state, config=config, stream_mode="values"):
            final_state = event
        
        # Save report logic here
        from app.database import AsyncSessionLocal
        from app.models.user import User
        from app.models.research import ResearchSession, Report, SessionStatus
        from sqlalchemy.future import select
        
        async with AsyncSessionLocal() as db:
            # Update session status
            res = await db.execute(select(ResearchSession).filter(ResearchSession.id == session_id))
            session = res.scalars().first()
            if session:
                session.status = SessionStatus.completed
            
            # Create or update report
            report_content = final_state.get("final_report", "No report generated.")
            report_title = f"Research Report: {topic}"
            
            res = await db.execute(select(Report).filter(Report.session_id == session_id))
            report = res.scalars().first()
            
            if not report:
                report = Report(
                    session_id=session_id,
                    title=report_title,
                    content=report_content,
                    citations=final_state.get("citations", []),
                    quality_score=final_state.get("quality_score", 0.0),
                    word_count=len(report_content.split()) if report_content else 0,
                    revision_count=final_state.get("revision_count", 0)
                )
                db.add(report)
            else:
                report.title = report_title
                report.content = report_content
                report.citations = final_state.get("citations", [])
                report.quality_score = final_state.get("quality_score", 0.0)
                report.word_count = len(report_content.split()) if report_content else 0
                report.revision_count = final_state.get("revision_count", 0)
            
            await db.commit()
            report_id = str(report.id)
        
        redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await publish_completed_event(session_id, report_id, redis_client)
        await redis_client.close()
        
    except Exception as e:
        print(f"Graph execution failed: {e}")
        from app.utils.streaming import publish_error_event
        redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await publish_error_event(session_id, str(e), redis_client)
        await redis_client.close()
