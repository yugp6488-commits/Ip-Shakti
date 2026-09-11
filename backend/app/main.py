# backend/app/main.py
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import shutil
import os
import uuid

# Ensure UTF-8 output encoding across Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from app.schemas import ComplianceRequest, AgentState, CrawlRequest
from app.engine.graph import compliance_agent
from app.bhashini import translate_regional_text
from app.crawler import crawl_gazette_notifications, ingest_text_to_pgvector
from app.ingest_pdf import process_legal_pdf
from app.core.config import settings
from app.core.rate_limit import check_rate_limit
from app.core.logging import log_security_event
from app.routers import auth
from app.core.auth import get_current_user

app = FastAPI(
    title="IP-SAKTI Sahayak Legal Compliance Gateway",
    version="1.0.0",
    description="Multi-database Legal & Botanical Compliance API with Bhashini Multilingual Gateway"
)

# Security Headers Middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["X-Frame-Options"] = "DENY"
    return response

# Secure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_id = str(uuid.uuid4())
    log_security_event("error", request.url.path, "system_error", {"error_id": error_id, "detail": str(exc)})
    
    # Ensure CORS headers are explicitly present on 500 errors so browsers do not mask errors as Failed to fetch
    origin = request.headers.get("origin")
    allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
    headers = {}
    if origin and (origin in allowed_origins or "*" in allowed_origins):
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
        headers["Vary"] = "Origin"

    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error_id": error_id},
        headers=headers
    )

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])

@app.get("/")
def health_check():
    return {"status": "operational", "engine": "LangGraph + Ollama Qwen3"}

@app.post("/api/v1/analyze")
async def analyze_formulation(payload: ComplianceRequest, request: Request):
    # Rate Limit: 10 requests per minute per API key
    try:
        check_rate_limit(f"analyze:{request.client.host}", limit=10, window_seconds=60)
    except HTTPException as e:
        log_security_event("rate_limit", request.url.path, "analyze_limit_exceeded")
        raise e
        
    log_security_event("request_accepted", request.url.path, "analyze_started")
    
    # Translate any regional language ingredients into canonical English via Bhashini Gateway
    processed_ingredients = [
        translate_regional_text(ingredient, source_language="hi", target_language="en") 
        for ingredient in payload.ingredients
    ]
    
    # Override payload ingredients with canonical English terms
    payload.ingredients = processed_ingredients
    
    initial_state = {
        "request": payload,
        "botanical_context": "",
        "legal_context": "",
        "verdict": {}
    }
    
    # Invoke the state machine workflow
    final_state = compliance_agent.invoke(initial_state)
    
    return final_state["verdict"]

@app.post("/api/v1/crawl-gazette")
async def trigger_gazette_crawl(payload: CrawlRequest, request: Request):
    # Rate Limit: 5 requests per minute
    try:
        check_rate_limit(f"crawl:{request.client.host}", limit=5, window_seconds=60)
    except HTTPException as e:
        log_security_event("rate_limit", request.url.path, "crawl_limit_exceeded")
        raise e
        
    # 1. Scrape content using Crawl4AI asynchronously
    markdown_content = await crawl_gazette_notifications(str(payload.url))
    
    if not markdown_content:
        log_security_event("ssrf_block", request.url.path, "unsafe_url_or_crawl_failed")
        raise HTTPException(status_code=400, detail="Failed to extract content from URL or URL is unsafe.")
        
    # 2. Automatically generate vector embeddings and save to pgvector
    ingest_text_to_pgvector(markdown_content, payload.source_title)
    
    log_security_event("request_accepted", request.url.path, "crawl_success")
    return {
        "status": "success", 
        "message": f"Successfully crawled and ingested '{payload.source_title}' into pgvector."
    }

@app.post("/api/v1/ingest-pdf")
async def ingest_pdf_endpoint(request: Request, file: UploadFile = File(...)):
    # Rate Limit: 5 requests per minute
    try:
        check_rate_limit(f"ingest:{request.client.host}", limit=5, window_seconds=60)
    except HTTPException as e:
        log_security_event("rate_limit", request.url.path, "ingest_limit_exceeded")
        raise e
        
    # 1. Validate MIME type
    if file.content_type != "application/pdf":
        log_security_event("invalid_upload", request.url.path, "invalid_mime_type")
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDFs are allowed.")
        
    # 1.5. Validate PDF Magic Bytes (%PDF-)
    magic_bytes = await file.read(5)
    if magic_bytes != b"%PDF-":
        log_security_event("invalid_upload", request.url.path, "spoofed_mime_type")
        raise HTTPException(status_code=400, detail="Invalid file signature. File is not a valid PDF.")
    
    # 2. Prevent path traversal with a UUID filename
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    secure_filename = f"{uuid.uuid4()}.pdf"
    file_path = os.path.join(temp_dir, secure_filename)
    
    # 3. True Streaming Size Enforcement
    MAX_UPLOAD_BYTES = 5 * 1024 * 1024 # 5MB limit
    total_bytes_written = 5 # accounts for magic bytes read
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(magic_bytes)
            while True:
                chunk = await file.read(8192)
                if not chunk:
                    break
                
                total_bytes_written += len(chunk)
                if total_bytes_written > MAX_UPLOAD_BYTES:
                    # Exceeded limit: abort safely
                    buffer.close()
                    os.remove(file_path)
                    log_security_event("invalid_upload", request.url.path, "file_too_large")
                    raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB.")
                    
                buffer.write(chunk)
                
        # Process and push chunks into pgvector
        process_legal_pdf(file_path)
        
        log_security_event("request_accepted", request.url.path, "ingest_success")
        return {
            "status": "success",
            "message": f"Successfully parsed and ingested the uploaded document."
        }
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)