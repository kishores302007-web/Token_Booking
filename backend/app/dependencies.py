from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models.user import User
from app.utils.jwt_handler import verify_token

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_role(*allowed_roles: str):
    """
    Dependency factory to restrict access to specific user roles.

    Args:
        allowed_roles: Variable number of role strings that are allowed (e.g., 'admin', 'employee', 'user').

    Returns:
        A dependency function that checks if the user has one of the allowed roles.

    Example:
        @router.get("/admin", dependencies=[Depends(require_role("admin"))])
        async def admin_only():
            return {"message": "Admin access"}

        @router.get("/manager", dependencies=[Depends(require_role("admin", "employee"))])
        async def manager_access():
            return {"message": "Admin or Employee access"}
    """

    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        """
        Check if the current user has one of the allowed roles.

        Args:
            current_user: The authenticated user.

        Returns:
            User: The current user if role is allowed.

        Raises:
            HTTPException: If user role is not in allowed roles.
        """
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user

    return role_checker


async def get_current_admin(current_user: User = Depends(require_role("admin"))) -> User:
    """
    Dependency to get the current authenticated admin user.

    Args:
        current_user: The authenticated user with admin role.

    Returns:
        User: The admin user.
    """
    return current_user


async def get_current_employee(current_user: User = Depends(require_role("employee"))) -> User:
    """
    Dependency to get the current authenticated employee user.

    Args:
        current_user: The authenticated user with employee role.

    Returns:
        User: The employee user.
    """
    return current_user


async def get_current_regular_user(current_user: User = Depends(require_role("user"))) -> User:
    """
    Dependency to get the current authenticated regular user.

    Args:
        current_user: The authenticated user with user role.

    Returns:
        User: The regular user.
    """
    return current_user