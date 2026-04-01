from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db import Base


class Department(Base):
    __tablename__ = 'departments'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=120), nullable=False, unique=True)
    description = Column(String(length=255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    services = relationship('Service', back_populates='department', cascade='all, delete-orphan')
