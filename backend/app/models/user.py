from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Integer, String

from app.db import Base


class UserRole(str, Enum):
    admin = 'admin'
    employee = 'employee'
    user = 'user'


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(length=120), nullable=False)
    email = Column(String(length=255), unique=True, index=True, nullable=False)
    password = Column(String(length=255), nullable=False)
    role = Column(Enum('admin', 'employee', 'user', name='user_role'), nullable=False, default='user')
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
