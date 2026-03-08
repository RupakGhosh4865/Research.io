from typing import TypedDict, Annotated, Optional, Literal
from langchain_core.messages import BaseMessage
import operator

class SearchResult(TypedDict):
    url: str
    title: str
    content: str
    source: str

class ResearchPlan(TypedDict):
    sub_questions: list[str]
    search_queries: list[str]
    approach: str
    estimated_sections: list[str]

class ResearchState(TypedDict):
    topic: str
    session_id: str
    user_id: str
    thread_id: str
    uploaded_doc_ids: list[str]
    
    research_plan: Optional[ResearchPlan]
    plan_approved: bool
    
    search_results: Annotated[list[SearchResult], operator.add]
    
    draft_report: Optional[str]
    final_report: Optional[str]
    citations: list[dict]
    
    quality_score: float
    critic_feedback: str
    revision_count: int
    max_revisions: int
    
    current_agent: str
    agent_messages: Annotated[list[str], operator.add]
    
    status: str
    error: Optional[str]
    assigned_queries: Optional[list[str]] # used dynamically for map-reduce
