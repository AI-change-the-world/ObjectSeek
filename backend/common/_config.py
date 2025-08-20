from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    s3_access_key: str = "dev-key-123"
    s3_secret_key: str = "dev-key-123"
    s3_bucket_name: str = "dev-bucket-123"
    s3_endpoint_url: str = "http://127.0.0.1:9000"
    env: str = "dev"

    class Config:
        env_prefix = ""  # 不加前缀
        env_file = ".env"  # 相对路径，也可以写绝对路径


settings = Settings()
