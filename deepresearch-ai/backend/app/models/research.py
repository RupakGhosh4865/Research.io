import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, func, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class SessionStatus(str, enum.Enum):
    planning = 'planning'
    searching = 'searching'
    writing = 'writing'
    reviewing = 'reviewing'
    completed = 'completed'
    failed = 'failed'

class ResearchSession(Base):
    __tablename__ = "research_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    topic = Column(String, nullable=False)
    status = Column(SQLEnum(SessionStatus), default=SessionStatus.planning)
    plan_approved = Column(Boolean, default=False)
    langgraph_thread_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid())
    session_id = Column(UUID(as_uuid=True), ForeignKey("research_sessions.id"), unique=True)
    title = Column(String, nullable=True)
    content = Column(String, nullable=True)
    citations = Column(JSONB, nullable=True)
    quality_score = Column(Float, nullable=True)
    revision_count = Column(Integer, default=0)
    word_count = Column(Integer, nullable=True)
    share_token = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    amount = Column(Integer, nullable=False)
    type = Column(String, nullable=False)
    stripe_payment_intent_id = Column(String, nullable=True)
    research_session_id = Column(UUID(as_uuid=True), ForeignKey("research_sessions.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    indexed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
