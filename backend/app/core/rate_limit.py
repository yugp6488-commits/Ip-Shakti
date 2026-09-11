import time
from fastapi import HTTPException
from app.redis_client import redis_client

# Simple Fixed Window Rate Limiter
def check_rate_limit(key: str, limit: int, window_seconds: int):
    """
    Raises HTTP 429 if the limit is exceeded in the given window.
    """
    current_time = int(time.time())
    window_key = f"rate_limit:{key}:{current_time // window_seconds}"
    
    try:
        requests = redis_client.incr(window_key)
        if requests == 1:
            redis_client.expire(window_key, window_seconds)
            
        if requests > limit:
            raise HTTPException(status_code=429, detail="Too Many Requests")
    except Exception as e:
        print(f"⚠️ Redis Rate Limiter Error: {e}")
        # Fail open if Redis is down for MVP
        pass
