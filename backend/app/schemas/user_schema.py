from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.user import UserRole


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[UserRole] = UserRole.user


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True
