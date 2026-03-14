import os
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
import asyncio
import uuid
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
    
    # AsyncPostgresSaver usually wants the standard postgresql:// DSN, not the async driver one
    pg_conn_str = settings.DATABASE_URL
    
    async with AsyncPostgresSaver.from_conn_string(pg_conn_str) as checkpointer:
        await checkpointer.setup()
        graph = build_graph().compile(checkpointer=checkpointer, interrupt_before=["search_agent"])
        
        config = {"configurable": {"thread_id": thread_id}}
        
        # Check if we have an existing state to resume
        existing_checkpoint = await graph.aget_state(config)
        
        is_resume = existing_checkpoint and existing_checkpoint.values
        
        if is_resume:
            print(f"[Graph] Resuming session {session_id} for thread {thread_id}")
            # If resuming, check if we need to update state with approval
            from app.database import get_async_sessionmaker
            from app.models.research import ResearchSession, SessionStatus
            from sqlalchemy.future import select
            
            AsyncSessionLocal = get_async_sessionmaker()
            async with AsyncSessionLocal() as db:
                session_uuid = uuid.UUID(session_id)
                res = await db.execute(select(ResearchSession).filter(ResearchSession.id == session_uuid))
                session = res.scalars().first()
                if session:
                    print(f"[Graph] Session status: {session.status}, Plan approved: {session.plan_approved}")
                    if session.plan_approved:
                        # Sync approval to LangGraph state
                        await graph.aupdate_state(config, {"plan_approved": True}, as_node="planner")
                        
                        # Update status to searching if it was planning
                        if session.status == SessionStatus.planning:
                            session.status = SessionStatus.searching
                            await db.commit()
                            print(f"[Graph] Status updated to searching")
            
            input_data = None
        else:
            print(f"[Graph] Starting new session {session_id}")
            input_data = {
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
        
        try:
            final_state = {}
            async for event in graph.astream(input_data, config=config, stream_mode="values"):
                final_state = event
        
            # Save report logic here
            from app.database import get_async_sessionmaker
            from app.models.user import User
            from app.models.research import ResearchSession, Report, SessionStatus
            from sqlalchemy.future import select
            
            AsyncSessionLocal = get_async_sessionmaker()
            async with AsyncSessionLocal() as db:
                session_uuid = uuid.UUID(session_id)
                res = await db.execute(select(ResearchSession).filter(ResearchSession.id == session_uuid))
                session = res.scalars().first()
                
                # Extract report content
                if not final_state:
                    # If we interrupted, we might not have a final_state from recursion
                    existing_state = await graph.aget_state(config)
                    final_state = existing_state.values if existing_state else {}

                if session and final_state.get("final_report"):
                    session.status = SessionStatus.completed
                
                # Create or update report
                report_content = final_state.get("final_report")
                if not report_content:
                    # If no report yet (still in progress), skip report saving but commit status
                    await db.commit()
                    return

                report_title = f"Research Report: {topic}"
                
                res = await db.execute(select(Report).filter(Report.session_id == session_uuid))
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
                    report.citations = final_state.get("citations", []),
                    report.quality_score = final_state.get("quality_score", 0.0)
                    report.word_count = len(report_content.split()) if report_content else 0
                    report.revision_count = final_state.get("revision_count", 0)
                
                await db.commit()
                report_id = str(report.id)
            
            redis_url = settings.REDIS_URL
            if redis_url.startswith("rediss://") and "ssl_cert_reqs" not in redis_url:
                separator = "&" if "?" in redis_url else "?"
                redis_url = f"{redis_url}{separator}ssl_cert_reqs=none"
                
            redis_client = aioredis.from_url(redis_url, decode_responses=True)
            await publish_completed_event(session_id, report_id, redis_client)
            await redis_client.close()
            
        except Exception as e:
            print(f"Graph execution failed: {e}")
            from app.utils.streaming import publish_error_event
            redis_url = settings.REDIS_URL
            if redis_url.startswith("rediss://") and "ssl_cert_reqs" not in redis_url:
                separator = "&" if "?" in redis_url else "?"
                redis_url = f"{redis_url}{separator}ssl_cert_reqs=none"
                
            redis_client = aioredis.from_url(redis_url, decode_responses=True)
            await publish_error_event(session_id, str(e), redis_client)
            await redis_client.close()
