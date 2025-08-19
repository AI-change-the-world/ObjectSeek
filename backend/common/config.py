from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    api_key: str = "dev-key-123"
    env: str = "dev"

    class Config:
        env_prefix = ""       # 不加前缀
        env_file = ".env"     # 相对路径，也可以写绝对路径

settings = Settings()
