from typing import TypedDict, Annotated, Optional, Literal
from langchain_core.messages import BaseMessage
import operator

class SearchResult(TypedDict):
    url: str
    title: str
    content: str
    source: str

from pydantic import BaseModel, Field

class ResearchPlan(BaseModel):
    sub_questions: list[str] = Field(description="5-7 distinct questions that cover the breadth and depth of the topic.")
    search_queries: list[str] = Field(description="8-10 specific search queries tailored for a search engine.")
    approach: str = Field(description="A short paragraph explaining the methodological approach.")
    estimated_sections: list[str] = Field(description="5-7 section titles for the final comprehensive report.")

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
