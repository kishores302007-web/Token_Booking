from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.user_schema import UserCreate, UserLogin
from app.services.auth_service import login_user, register_user

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post('/register', response_model=dict)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    Args:
        user_data (UserCreate): User registration data.
        db (Session): Database session.

    Returns:
        dict: Success message and user data.
    """
    try:
        user = register_user(db, user_data)
        return {"message": "User registered successfully", "user": user}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post('/login')
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login a user and return JWT token.

    Args:
        user_data (UserLogin): User login credentials.
        db (Session): Database session.

    Returns:
        dict: Access token, token type, and user data.
    """
    try:
        result = login_user(db, user_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
