from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "ChainGuard AI"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./chainguard.db"
    
    # Supabase PostgreSQL & REST Settings
    SUPABASE_URL: Optional[str] = ""
    SUPABASE_ANON_KEY: Optional[str] = ""
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = ""

    # IBM watsonx.ai Foundation Models
    WATSONX_API_KEY: Optional[str] = ""
    WATSONX_PROJECT_ID: Optional[str] = ""
    WATSONX_URL: str = "https://us-south.ml.cloud.ibm.com"

    # Multi-LLM Providers (Google Gemini, Groq, OpenAI)
    GEMINI_API_KEY: Optional[str] = ""
    GROQ_API_KEY: Optional[str] = ""
    OPENAI_API_KEY: Optional[str] = ""
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
