# IP-SAKTI Sahayak - Final Security Audit Extension

This document provides a comprehensive security and correctness audit of the current state of the IP-SAKTI Sahayak repository, mapping exactly to the 17 requested verification points.

## 1. Docker / Network Exposure
- **PostgreSQL (`ipsakti_postgres`)**: Exposed to all network interfaces (`0.0.0.0:5432`). **[Missing]**
- **Neo4j (`ipsakti_neo4j`)**: Exposed to all network interfaces (`0.0.0.0:7474`, `0.0.0.0:7687`). **[Missing]**
- **Redis (`ipsakti_redis`)**: Exposed to all network interfaces (`0.0.0.0:6379`). **[Missing]**
- **Ollama**: Not running in Docker Compose, running on host at `http://localhost:11434`. Assumed exposed to localhost only by default Ollama settings. **[Partially Implemented]**
- **Severity**: High
- **Risk**: External parties can directly connect to databases and cache.
- **Recommended Fix**: Bind ports to `127.0.0.1` (e.g., `127.0.0.1:5432:5432`) in `docker-compose.yml`.

## 2. Database Least Privilege
- **PostgreSQL**: `engine/nodes.py`, `crawler.py`, and `parse_pdf_rag.py` all connect as `user=admin`. **[Missing]**
- **Neo4j**: `engine/nodes.py` and `parse_graph_csv.py` connect with `auth=("neo4j", "admin_password")` (admin role). **[Missing]**
- **Severity**: High
- **Risk**: If the API is compromised, attackers have full admin access to databases.
- **Recommended Fix**: Create dedicated `ipsakti_runtime` (read/limited write) and `ipsakti_ingest` (write) roles.

## 3. Redis Authentication
- **Redis**: `docker-compose.yml` launches Redis without a password. `redis_client.py` connects with no password. **[Missing]**
- **Severity**: Medium
- **Risk**: Anyone with access to port 6379 can read/modify cached data (including sensitive ingredients).
- **Recommended Fix**: Add `--requirepass` to Redis Docker command and update `redis_client.py` to use a password via `.env`.

## 4. Sensitive Logging
- **Files**: `engine/nodes.py`, `redis_client.py`.
- **Exposures**: `print(f"🐢 [Neo4j DB MISS] Searching database for {ingredients}")` logs raw formulations. `redis_client.py` logs `print(f"⚡ [Redis Cache HIT] Key: {key}")` which contains raw ingredients (e.g., `botanical:ingredient1`). **[Missing]**
- **Severity**: Medium
- **Risk**: Proprietary formulations/ingredient combinations leak into application logs.
- **Recommended Fix**: Remove sensitive prints; use a structured logger that redacts/hashes ingredients.

## 5. Indirect Prompt Injection
- **Files**: `engine/nodes.py` (`llm_reasoning_node`).
- **Exposure**: `prompt` is constructed via f-string interpolation: `Ingredients: {state['botanical_context']} ... Relevant Legal Statutes: {state['legal_context']}`. **[Missing]**
- **Severity**: Critical
- **Risk**: Retrieved legal text or uploaded documents containing malicious instructions could hijack the Qwen model's reasoning.
- **Recommended Fix**: Implement XML-based trust boundaries (e.g., `<system>`, `<evidence>`, `<user>`) in the prompt template.

## 6. RAG Document Poisoning / Source Integrity
- **Files**: `init_db.py`, `crawler.py`, `parse_pdf_rag.py`.
- **Schema**: `legal_chunks` only stores `id`, `act_name`/`source`, `section`, `content`, `embedding`, `created_at`. **[Missing]**
- **Severity**: High
- **Risk**: No tracking of source URL, authority, jurisdiction, effective date, or SHA-256 hash. Trust cannot be verified.
- **Recommended Fix**: Expand PostgreSQL schema and parser scripts to capture and enforce source integrity metadata.

## 7. Structured LLM Output Validation
- **Files**: `engine/nodes.py` (`llm_reasoning_node`).
- **Validation**: Output is captured via `response['message']['content']` and assigned directly to `legal_reasoning`. **[Missing]**
- **Severity**: Medium
- **Risk**: LLM might return conversational text instead of structured data, breaking frontend parsing.
- **Recommended Fix**: Enforce structured output via Pydantic parsing and Ollama's format capabilities.

## 8. Evidence Safety Gate
- **Files**: `engine/nodes.py`.
- **Validation**: The model's verdict is returned immediately. No check is performed to verify if generated citations actually exist in `state['legal_context']`. **[Missing]**
- **Severity**: Critical
- **Risk**: The system can confidently return hallucinated legal reasoning that is not supported by the retrieved evidence.
- **Recommended Fix**: Implement a validation step after LLM generation to check claims against evidence chunks.

## 9. Retrieval Security / Correctness
- **Files**: `engine/nodes.py` (`legal_retrieval_node`).
- **Issues**:
  - **Fixed Retrieval Query**: Generates embeddings using a hardcoded string: `prompt="Section 3 Biological Diversity Act NBA Approval"`. **[Missing]**
  - **Global Cache Key**: Uses a hardcoded cache key: `cache_key = "legal:section3_bda_nba"`. **[Missing]**
  - **User Request Ignored**: The actual user ingredients/context are NOT used to retrieve legal evidence. **[Missing]**
  - **Bounded top_k**: Uses `LIMIT 2`. **[Implemented]**
- **Severity**: Critical
- **Risk**: The system will always retrieve and cache the exact same legal text regardless of what the user asks.
- **Recommended Fix**: Dynamically generate the embedding prompt/cache key based on the actual `ComplianceRequest` context.

## 10. Ollama Security
- **Model Control**: Model name (`'qwen3:30b'`) is hardcoded server-side. Users cannot manipulate it. **[Implemented]**
- **Exposure**: Defaults to localhost. **[Partially Implemented]**
- **Timeout/Concurrency**: No timeouts or concurrency limiters are applied to the `ollama_client.chat` call. **[Missing]**
- **Severity**: Medium
- **Risk**: Malicious heavy requests can crash the local host.
- **Recommended Fix**: Add a timeout parameter to the Ollama client and rate limiting on the FastAPI route.

## 11. LangGraph State Security
- **Files**: `schemas.py`.
- **State**: `AgentState` contains `request`, `botanical_context`, `legal_context`, and `verdict`. **[Implemented]**
- **Secrets/Persistence**: No secrets are stored in state. No checkpointing is currently used, meaning no sensitive data is persisted to disk unnecessarily. **[Not Applicable]**

## 12. Authentication Design
- **Current State**: Entirely open API. **[Missing]**
- **Proposal**: Implement FastAPI `Depends(verify_api_key)` or `Depends(get_current_user)` using a simple Bearer token in the `Authorization` header. Do not build frontend token storage logic; just secure the API endpoints.

## 13. Authorization
- **Current State**: No ownership models exist. **[Missing]**
- **Future Resources**: `/api/v1/ingest-pdf` currently processes documents globally. These need ownership tracking (`owner_id`) to prevent cross-tenant data exposure once authentication is added.

## 14. File Upload Security
- **Endpoint**: `/api/v1/ingest-pdf` in `main.py`.
- **Issues**: Uses `file.filename` directly to save to disk (Path Traversal risk). No MIME type verification. No size limits. Ingests directly into the global `pgvector` store (Authoritative Corpus poisoning). **[Missing]**
- **Severity**: Critical
- **Risk**: RCE via Path Traversal, Denial of Service via huge files, Corpus poisoning.
- **Recommended Fix**: Generate secure UUID filenames, check MIME types, enforce `UploadFile` size limits, and tag uploaded chunks with `trust=unverified` or an `owner_id`.

## 15. SSRF Security
- **Endpoint**: `/api/v1/crawl-gazette` in `main.py` / `crawler.py`.
- **Issues**: Accepts any URL provided in the `CrawlRequest`. **[Missing]**
- **Severity**: High
- **Risk**: Server-Side Request Forgery allowing the crawler to hit internal networks (e.g., `http://169.254.169.254` or `http://localhost`).
- **Recommended Fix**: Validate the URL scheme, and implement an allowlist (e.g., `.gov.in`, `.nic.in`) or block private IP spaces.

## 16. Dependency Security
- **Current State**: No `requirements.txt` exists. The `venv` directory appears to exist in the repository root. **[Missing]**
- **Severity**: Medium
- **Risk**: Non-reproducible builds, lack of vulnerability tracking, and repository bloat.
- **Recommended Fix**: Generate `requirements.txt`, pin versions, and add `venv/` to `.gitignore`.

## 17. Verify Previous Correctness Risks
- **pgvector Embedding Dimension Mismatch**: `init_db.py` creates `embedding vector(1536)`, but `parse_pdf_rag.py` comment states `nomic-embed-text` produces 768 dimensions. **[Missing/Risk]** -> Causes SQL insertion errors.
- **Neo4j Property Mismatch**: `parse_graph_csv.py` seeds nodes with `scientific_name` and `sanskrit_name`. `engine/nodes.py` queries `MATCH (p:Plant) WHERE p.name =~ $name`. `p.name` does not exist in the seeded data. **[Missing/Risk]** -> Causes Neo4j to never match anything.
- **Fixed Legal Retrieval Query**: Confirmed (see point 9). **[Missing/Risk]** -> Defeats the purpose of RAG.
- **Global Redis Legal Cache Key**: Confirmed (see point 9). **[Missing/Risk]** -> Serves stale/incorrect evidence.
- **Unused/Legacy `rag_chain.py`**: `main.py` routes to `compliance_agent` (LangGraph). `engine/rag_chain.py` contains a standalone pipeline `run_ip_sakti_pipeline` that is completely disconnected. **[Risk]** -> Dead code leading to maintenance confusion.

## Summary of Correctness Impact
If these code flaws are not resolved, the security layer will be protecting a broken engine. The system will fail to insert vectors, fail to retrieve botanicals, and retrieve irrelevant fixed legal text.

## Next Recommended Step
Address the correctness risks in `init_db.py`, `engine/nodes.py`, and clean up `rag_chain.py` **during or before** the security implementation to ensure the core MVP actually works.
