# backend/app/redis_client.py
import redis
import json
from typing import Optional, Any
from app.core.config import settings

# Connect to the local Redis Docker container using settings
redis_client = redis.Redis(
    host=settings.REDIS_HOST, 
    port=settings.REDIS_PORT, 
    db=0, 
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)

def get_cached_key(key: str) -> Optional[Any]:
    try:
        data = redis_client.get(key)
        if data:
            print("[Redis Cache HIT] Key retrieved")
            return json.loads(data)
    except Exception as e:
        print(f"[Redis Connection Error]: {e}")
    return None

def set_cached_key(key: str, value: Any, ttl_seconds: int = 86400):
    try:
        redis_client.setex(key, ttl_seconds, json.dumps(value))
        print(f"[Redis Cache SET] Key saved (TTL: {ttl_seconds}s)")
    except Exception as e:
        print(f"[Redis Set Error]: {e}")