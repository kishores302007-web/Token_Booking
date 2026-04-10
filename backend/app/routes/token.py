from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.token import Token, TokenStatus
from app.models.user import User
from app.schemas.token_schema import TokenCreate, TokenResponse
from app.services.token_service import create_token
from app.utils.jwt_handler import verify_token

router = APIRouter(prefix='/token', tags=['token'])


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.

    Args:
        credentials: HTTP authorization credentials.
        db: Database session.

    Returns:
        User: The authenticated user.

    Raises:
        HTTPException: If token is invalid or user not found.
    """
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


@router.post('/book', response_model=TokenResponse)
async def book_token(
    token_data: TokenCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Book a new token for the current user.

    Args:
        token_data: Token creation data.
        current_user: Authenticated user.
        db: Database session.

    Returns:
        TokenResponse: The created token.
    """
    # Ensure the token is booked for the current user
    token_data.user_id = current_user.id

    try:
        token = create_token(db, token_data)
        return token
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get('/my', response_model=List[TokenResponse])
async def get_my_tokens(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all tokens for the current user.

    Args:
        current_user: Authenticated user.
        db: Database session.

    Returns:
        List[TokenResponse]: List of user's tokens.
    """
    tokens = db.query(Token).filter(Token.user_id == current_user.id).all()
    return [TokenResponse.from_orm(token) for token in tokens]


@router.put('/{token_id}/cancel')
async def cancel_token(
    token_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a token for the current user.

    Args:
        token_id: ID of the token to cancel.
        current_user: Authenticated user.
        db: Database session.

    Returns:
        dict: Success message.
    """
    token = db.query(Token).filter(
        Token.id == token_id,
        Token.user_id == current_user.id
    ).first()

    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token not found")

    if token.status != TokenStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel token that is not pending"
        )

    token.status = TokenStatus.cancelled
    db.commit()

    return {"message": "Token cancelled successfully"}


@router.get('/{token_id}/status')
async def get_token_status(
    token_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the status of a specific token for the current user.

    Args:
        token_id: ID of the token.
        current_user: Authenticated user.
        db: Database session.

    Returns:
        dict: Token status.
    """
    token = db.query(Token).filter(
        Token.id == token_id,
        Token.user_id == current_user.id
    ).first()

    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token not found")

    return {"status": token.status.value}
