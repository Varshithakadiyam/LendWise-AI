import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "LendWise AI Backend"
    API_V1_STR: str = ""
    
    # Server configuration
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    
    # CORS Origins (allow all by default for easy development, configurable via environment)
    CORS_ORIGINS: List[str] = ["*"]
    
    # LLM API keys
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # Rate limiting
    RATE_LIMIT_DEFAULT: str = "100/minute"
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore"

settings = Settings()
