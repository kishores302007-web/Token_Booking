from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = 'sqlite:///./token_booking.db'
    JWT_SECRET_KEY: str = 'your-secret-key'
    JWT_ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = ConfigDict(
        env_file='.env',
        env_file_encoding='utf-8'
    )


settings = Settings()
