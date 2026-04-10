from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db import Base
from app.models.user import User


class TokenStatus(str, Enum):
    pending = 'pending'
    active = 'active'
    completed = 'completed'
    cancelled = 'cancelled'


class Token(Base):
    __tablename__ = 'tokens'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    service_id = Column(Integer, nullable=True)
    employee_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    token_number = Column(String(length=50), nullable=False)
    status = Column(Enum('pending', 'active', 'completed', 'cancelled', name='token_status'), nullable=False, default='pending')
    date = Column(Date, nullable=False)
    time_slot = Column(String(length=50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship('User', foreign_keys=[user_id], backref='tokens')
    employee = relationship('User', foreign_keys=[employee_id], backref='assigned_tokens')
