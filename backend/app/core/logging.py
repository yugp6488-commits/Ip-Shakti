import json
import logging
from logging.handlers import RotatingFileHandler
import uuid
import datetime

# Configure standard Python logger for security events
logger = logging.getLogger("security_audit")
logger.setLevel(logging.INFO)

# Rotating File handler for audit logs (Max 10MB per file, keep 5 backups)
handler = RotatingFileHandler("security_audit.log", maxBytes=10*1024*1024, backupCount=5, encoding="utf-8")
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

def log_security_event(event_type: str, endpoint: str, status: str, extra: dict = None):
    """
    Logs structured JSON events for security auditing.
    Does NOT log sensitive passwords, API keys, or raw formulations.
    """
    event = {
        "event_id": str(uuid.uuid4()),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "event_type": event_type,
        "endpoint": endpoint,
        "status": status,
        "extra": extra or {}
    }
    
    # Redact sensitive keys if accidentally passed in 'extra'
    redacted_keys = {"password", "api_key", "token", "ingredients"}
    for k in list(event["extra"].keys()):
        if k.lower() in redacted_keys:
            event["extra"][k] = "[REDACTED]"
            
    logger.info(json.dumps(event))
