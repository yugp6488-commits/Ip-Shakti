from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # PostgreSQL Roles & Least Privilege
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "ipsakti_db"
    
    POSTGRES_ADMIN_USER: str = "admin"
    POSTGRES_ADMIN_PASSWORD: str = "admin_password"
    
    POSTGRES_RUNTIME_USER: str = "ipsakti_runtime"
    POSTGRES_RUNTIME_PASSWORD: str = "runtime_secret"
    
    POSTGRES_INGEST_USER: str = "ipsakti_ingest"
    POSTGRES_INGEST_PASSWORD: str = "ingest_secret"

    # Neo4j
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "neo4j_secret_placeholder"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "redis_secret_placeholder"

    # Ollama
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen3:30b"
    EMBEDDING_MODEL: str = "nomic-embed-text"

    # JWT Authentication
    JWT_SECRET_KEY: str = "change_this_to_a_secure_random_key_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # API Keys
    BHASHINI_API_KEY: str = "your_bhashini_api_key_here"
    API_KEY_SECRET: str = "super_secret_api_key_for_clients"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
