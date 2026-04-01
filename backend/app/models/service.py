from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db import Base


class Service(Base):
    __tablename__ = 'services'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=120), nullable=False)
    description = Column(String(length=255), nullable=True)
    department_id = Column(Integer, ForeignKey('departments.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    department = relationship('Department', back_populates='services')
