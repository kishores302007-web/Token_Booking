from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.token import Token, TokenStatus
from app.models.user import User, UserRole
from app.routes.token import get_current_user
from app.schemas.token_schema import TokenResponse

router = APIRouter(prefix='/employee', tags=['employee'])


def get_current_employee(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to ensure the current user is an employee.

    Args:
        current_user: Authenticated user.

    Returns:
        User: The employee user.

    Raises:
        HTTPException: If user is not an employee.
    """
    if current_user.role != UserRole.employee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Employee role required."
        )
    return current_user


@router.get('/tokens/today', response_model=List[TokenResponse])
async def get_today_tokens(
    current_employee: User = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """
    Get all tokens assigned to the employee for today.

    Args:
        current_employee: Authenticated employee.
        db: Database session.

    Returns:
        List[TokenResponse]: Today's tokens for the employee.
    """
    today = date.today()
    tokens = db.query(Token).filter(
        Token.employee_id == current_employee.id,
        Token.date == today
    ).all()

    return [TokenResponse.from_orm(token) for token in tokens]


@router.put('/tokens/{token_id}/status')
async def update_token_status(
    token_id: int,
    new_status: TokenStatus,
    current_employee: User = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """
    Update the status of a token assigned to the employee.

    Args:
        token_id: ID of the token.
        new_status: New status for the token.
        current_employee: Authenticated employee.
        db: Database session.

    Returns:
        dict: Success message.
    """
    token = db.query(Token).filter(
        Token.id == token_id,
        Token.employee_id == current_employee.id
    ).first()

    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token not found")

    # Validate status transitions if needed
    if token.status == TokenStatus.completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update status of completed token"
        )

    token.status = new_status
    db.commit()

    return {"message": f"Token status updated to {new_status.value}"}


@router.put('/tokens/call-next')
async def call_next_token(
    current_employee: User = Depends(get_current_employee),
    db: Session = Depends(get_db)
):
    """
    Call the next pending token for the employee (set to active).

    Args:
        current_employee: Authenticated employee.
        db: Database session.

    Returns:
        dict: The called token or message if no tokens available.
    """
    # Find the next pending token for today, ordered by creation time
    today = date.today()
    next_token = db.query(Token).filter(
        Token.employee_id == current_employee.id,
        Token.date == today,
        Token.status == TokenStatus.pending
    ).order_by(Token.created_at).first()

    if not next_token:
        return {"message": "No pending tokens available"}

    next_token.status = TokenStatus.active
    db.commit()

    return {
        "message": "Next token called",
        "token": TokenResponse.from_orm(next_token)
    }
