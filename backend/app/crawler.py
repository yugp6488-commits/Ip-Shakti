# backend/app/crawler.py
import asyncio
from crawl4ai import AsyncWebCrawler
import psycopg2
from urllib.parse import urlparse
import httpx
import socket
from app.core.config import settings
from app.core.logging import log_security_event

def is_safe_hostname(hostname: str) -> bool:
    if not hostname:
        return False
    # Prevent obvious private ranges (simplified)
    if hostname == "localhost" or hostname.startswith("127.") or hostname.startswith("192.168.") or hostname.startswith("10.") or hostname.startswith("169.254."):
        return False
    # Strict allowlist for MVP
    if not (hostname.endswith(".gov.in") or hostname.endswith(".nic.in")):
        return False
    return True

async def pre_validate_url(url: str) -> str:
    """
    Follows redirects safely to ensure the final destination is safe,
    enforcing timeouts and size limits. Returns the final safe URL.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0, max_redirects=5) as client:
            # We stream the response to check headers/size without downloading fully
            async with client.stream("GET", url) as response:
                final_url = str(response.url)
                parsed = urlparse(final_url)
                
                if parsed.scheme not in ["http", "https"]:
                    raise ValueError("Invalid scheme")
                    
                if not is_safe_hostname(parsed.hostname):
                    raise ValueError("Destination domain not allowed")
                
                # Check resolved IP to prevent DNS rebinding or obfuscated private IPs
                ip_addr = socket.gethostbyname(parsed.hostname)
                if is_safe_hostname(ip_addr) is False and not (ip_addr.startswith("164.") or ip_addr.startswith("103.")): # Basic check, in reality use ipaddress module
                    if ip_addr.startswith("127.") or ip_addr.startswith("10.") or ip_addr.startswith("192.168."):
                        raise ValueError(f"Resolved IP {ip_addr} is private")
                
                content_length = response.headers.get("Content-Length")
                if content_length and int(content_length) > 5 * 1024 * 1024:
                    raise ValueError("Response too large")
                    
                return final_url
    except Exception as e:
        raise ValueError(f"URL validation failed: {str(e)}")

async def crawl_gazette_notifications(url: str):
    """
    Crawls official Gazette pages or legal repositories using Crawl4AI 
    and extracts structured markdown text for compliance updating.
    """
    try:
        safe_url = await pre_validate_url(url)
    except ValueError as e:
        print(f"❌ [SSRF Block] Blocked unsafe or unauthorized URL: {e}")
        log_security_event("ssrf_block", "/api/v1/crawl-gazette", "url_validation_failed", {"reason": str(e)})
        return None

    print(f"🕷️ [Crawl4AI] Starting crawl on: {safe_url}")
    try:
        # Wrap the crawler with an absolute timeout
        async with AsyncWebCrawler() as crawler:
            result = await asyncio.wait_for(crawler.arun(url=safe_url), timeout=30.0)
            if result.success:
                print(f"✅ [Crawl4AI] Successfully extracted {len(result.markdown)} characters.")
                return result.markdown
            else:
                print(f"❌ [Crawl4AI] Failed to crawl URL: {safe_url}")
                return None
    except asyncio.TimeoutError:
        print(f"❌ [Crawl4AI] Crawl timed out for URL: {safe_url}")
        log_security_event("crawl_timeout", "/api/v1/crawl-gazette", "timeout_exceeded")
        return None
    except Exception as e:
        print(f"❌ [Crawl4AI] Unexpected error: {e}")
        return None

def ingest_text_to_pgvector(content: str, source_title: str, trust_level: str = 'unverified'):
    """
    Embeds scraped or OCR text and inserts it directly into PostgreSQL pgvector 
    for semantic similarity legal matching.
    """
    import ollama
    import hashlib
    client = ollama.Client(host=settings.OLLAMA_HOST)
    
    # Generate vector embedding using configured model
    embed_resp = client.embeddings(model=settings.EMBEDDING_MODEL, prompt=content)
    vector = embed_resp['embedding']
    
    doc_hash = hashlib.sha256(content.encode()).hexdigest()
    evidence_id = f"EV-CRAWL-{doc_hash[:8]}" if trust_level == 'unverified' else f"EV-DOC-{doc_hash[:8]}"
    
    # Connect to PostgreSQL pgvector database using ingest role if configured
    conn = psycopg2.connect(
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_INGEST_USER,
        password=settings.POSTGRES_INGEST_PASSWORD,
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT
    )
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO legal_chunks (
            evidence_id, act_name, title, section, content, document_hash, trust_level, embedding
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (evidence_id) DO NOTHING;
    """, (evidence_id, source_title, source_title, "Scraped", content, doc_hash, trust_level, vector))
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"💾 [pgvector Ingestion] Saved '{source_title}' into vector database with evidence ID {evidence_id} as {trust_level}.")