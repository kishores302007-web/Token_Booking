from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from app.models.token import TokenStatus


class TokenCreate(BaseModel):
    user_id: int
    service_id: Optional[int] = None
    employee_id: Optional[int] = None
    date: date
    time_slot: str


class TokenResponse(BaseModel):
    id: int
    user_id: int
    service_id: Optional[int]
    employee_id: Optional[int]
    token_number: str
    status: TokenStatus
    date: date
    time_slot: str
    created_at: datetime

    class Config:
        from_attributes = True
