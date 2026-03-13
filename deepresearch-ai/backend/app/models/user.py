import uuid
from sqlalchemy import Column, String, Integer, Enum as SQLEnum, DateTime, func, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum

class PlanType(str, enum.Enum):
    free = 'free'
    test = 'test'
    starter = 'starter'
    pro = 'pro'
    special_pro = 'special_pro'

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid())
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    credits_remaining = Column(Integer, default=5)
    plan = Column(SQLEnum(PlanType), default=PlanType.free)
    is_admin = Column(Boolean, default=False)
    stripe_customer_id = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
