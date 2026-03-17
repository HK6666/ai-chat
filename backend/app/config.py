from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OPENAI_API_BASE: str = "https://api.openai.com/v1"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    SYSTEM_PROMPT: str = "你是一个友好的AI助手，请用中文回答问题。"
    APP_PASSWORD: str = ""
    DATABASE_URL: str = "sqlite+aiosqlite:///./chat.db"

    model_config = {"env_file": ["../.env", ".env"], "env_file_encoding": "utf-8"}


settings = Settings()
