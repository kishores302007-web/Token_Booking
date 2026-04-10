from datetime import date
from sqlalchemy.orm import Session

from app.models.token import Token
from app.schemas.token_schema import TokenCreate, TokenResponse


def generate_token_number(db: Session, token_date: date, service_id: int) -> str:
    """
    Generate a sequential token number for the given date and service.

    Args:
        db (Session): Database session.
        token_date (date): The date for the token.
        service_id (int): The service ID.

    Returns:
        str: The generated token number (e.g., "001", "002").
    """
    # Count existing tokens for this date and service
    token_count = db.query(Token).filter(
        Token.date == token_date,
        Token.service_id == service_id
    ).count()

    # Next number is count + 1
    next_number = token_count + 1

    # Format as 3-digit number with leading zeros
    return f"{next_number:03d}"


def create_token(db: Session, token_data: TokenCreate) -> TokenResponse:
    """
    Create a new token with generated token number.

    Args:
        db (Session): Database session.
        token_data (TokenCreate): Token creation data.

    Returns:
        TokenResponse: The created token data.
    """
    # Generate token number
    token_number = generate_token_number(db, token_data.date, token_data.service_id)

    # Create new token
    new_token = Token(
        user_id=token_data.user_id,
        service_id=token_data.service_id,
        employee_id=token_data.employee_id,
        token_number=token_number,
        date=token_data.date,
        time_slot=token_data.time_slot,
    )

    db.add(new_token)
    db.commit()
    db.refresh(new_token)

    return TokenResponse.from_orm(new_token)
