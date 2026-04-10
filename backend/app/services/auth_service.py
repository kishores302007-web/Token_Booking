from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse
from app.utils.jwt_handler import create_access_token
from app.utils.password_hash import hash_password, verify_password


def register_user(db: Session, user_data: UserCreate) -> UserResponse:
    """
    Register a new user.

    Args:
        db (Session): Database session.
        user_data (UserCreate): User creation data.

    Returns:
        UserResponse: The created user data.

    Raises:
        ValueError: If user with email already exists.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise ValueError("User with this email already exists")

    # Hash the password
    hashed_password = hash_password(user_data.password)

    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        role=user_data.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse.from_orm(new_user)


def login_user(db: Session, user_data: UserLogin) -> dict:
    """
    Authenticate a user and return access token.

    Args:
        db (Session): Database session.
        user_data (UserLogin): User login data.

    Returns:
        dict: Contains access_token and user data.

    Raises:
        ValueError: If credentials are invalid.
    """
    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise ValueError("Invalid email or password")

    # Verify password
    if not verify_password(user_data.password, user.password):
        raise ValueError("Invalid email or password")

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user),
    }
