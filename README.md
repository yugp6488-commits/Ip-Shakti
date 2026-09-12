# IP-SAKTI Sahayak By RagRebels

**The zero-hallucination regulatory GPS for Ayurvedic & Traditional Knowledge innovation.**

IP-SAKTI Sahayak turns ancient Ayurvedic formulations into protected, globally compliant innovations. It analyzes a formulation's ingredients and use-case, then tells you exactly where it stands against India's overlapping IP, biodiversity, and drug-classification laws — with cited legal sources, not guesses.

> Built for **SIH Problem Statement 26045** (Ministry of AYUSH / AIIA).

---

## What it does

Innovators working with traditional Ayurvedic knowledge face a maze of laws that rarely talk to each other: the Patents Act (Section 3(p) bars patenting traditional knowledge), the Biological Diversity Act (NBA clearance for accessing biological resources), AYUSH/FSSAI drug-vs-food classification, and — for global filers — the WIPO GRATK Treaty and PCT timelines. Getting this wrong means rejected patents, biopiracy accusations, or blocked exports.

IP-SAKTI Sahayak automates that compliance check. Give it a formulation and some facts about it, and it returns a structured, evidence-backed verdict:

- **Patent risk** — flags likely Section 3(p) traditional-knowledge rejections
- **Biodiversity Act compliance** — determines whether NBA Form I (domestic) or Form III (foreign filing) clearance is required
- **Drug classification** — AYUSH Proprietary & Patent (P&P) Drug vs. Ayurveda-Aahar (food) categorization
- **Global filing readiness** — PCT 30-month national-phase tracking and WIPO country-of-origin disclosure requirements
- **Multilingual intake** — ingredients submitted in regional languages are translated to canonical English via the Bhashini gateway before analysis

Every requirement in the verdict comes with its legal source, section, and retrieved evidence text — the system is explicitly designed to avoid hallucinated legal advice.

## How it works

A formulation submitted to the API flows through a **LangGraph** state machine:

```
BotanicalLookup  →  LegalLookup  →  LLMReasoning  →  Structured Verdict
   (Neo4j)          (pgvector)      (Ollama/Qwen3)
```

1. **BotanicalLookup** — resolves ingredients against a Neo4j knowledge graph of botanical entities (cached in Redis)
2. **LegalLookup** — retrieves relevant statutes and gazette notifications from a pgvector-backed legal corpus
3. **LLMReasoning** — a locally-hosted Qwen3 model (via Ollama) reasons over the retrieved evidence and produces a structured compliance verdict, including per-requirement status, risk level, missing-information prompts, and source citations

The legal knowledge base is kept current via a **Crawl4AI**-powered gazette crawler and a PDF ingestion pipeline (PyMuPDF-based) that both feed embeddings into pgvector.

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (React 19), Tailwind, shadcn/ui, Firebase Auth, Three.js/GSAP for landing visuals |
| Backend API | FastAPI |
| Reasoning engine | LangGraph + Ollama (Qwen3) |
| Legal corpus | PostgreSQL + pgvector |
| Botanical knowledge graph | Neo4j |
| Cache / rate limiting | Redis |
| Multilingual translation | Bhashini API |
| Web ingestion | Crawl4AI |

## Repository layout

```
Ip-Shakti/
├── backend/
│   └── app/
│       ├── main.py            # FastAPI app, routes, security middleware
│       ├── engine/             # LangGraph workflow (graph.py, nodes.py, rag_chain.py)
│       ├── core/                # config, auth, rate limiting, logging
│       ├── routers/auth.py     # authentication endpoints
│       ├── crawler.py           # gazette notification crawler → pgvector
│       ├── ingest_pdf.py        # PDF → chunked embeddings → pgvector
│       ├── bhashini.py          # regional-language translation gateway
│       ├── legal_status.py      # compliance status enums
│       └── schemas.py           # request/response models
├── data-pipeline/
│   └── parsers/                 # parse_pdf_rag.py, parse_graph_csv.py
├── front-enf-new/                # Next.js frontend
├── docker-compose.yml            # Postgres+pgvector, Neo4j, Redis
├── .env.example                   # backend environment template
├── SECURITY_AUDIT.md               # security audit findings
└── SECURITY_IMPLEMENTATION_REPORT.md
```

## Getting started

### Prerequisites
- Docker & Docker Compose
- Python 3.10+
- Node.js 20+ / pnpm
- [Ollama](https://ollama.ai) running locally with a Qwen3 model pulled
- A Bhashini API key (for multilingual ingestion)
- A Firebase project (for frontend auth)

### 1. Spin up the data layer

```bash
cp .env.example .env   # fill in Postgres/Neo4j/Redis/Ollama/Bhashini values
docker compose up -d
```

This starts Postgres (with pgvector), Neo4j, and Redis, all bound to localhost only.

### 2. Run the backend

```bash
cd backend
pip install -r requirements.txt
python app/init_db.py       # initialize schema
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`. Health check: `GET /`.

### 3. Run the frontend

```bash
cd front-enf-new
cp .env.local.example .env.local   # fill in Firebase config
pnpm install
pnpm dev
```

Visit `http://localhost:3000`.

## Key API endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/analyze` | Submit a formulation for compliance analysis |
| `POST /api/v1/crawl-gazette` | Crawl and ingest a gazette notification URL into the legal corpus |
| `POST /api/v1/ingest-pdf` | Upload a legal PDF for ingestion into pgvector |
| `POST /api/v1/auth/*` | Authentication |

All write-heavy endpoints are rate-limited per client IP, and file uploads are validated by MIME type, magic bytes, and a 5MB streaming size cap.

## Security posture

The repo includes a self-authored `SECURITY_AUDIT.md` and `SECURITY_IMPLEMENTATION_REPORT.md` tracking hardening work across Docker network exposure, database least-privilege access, Redis authentication, sensitive-data logging, and prompt-injection resistance in the LLM reasoning node. Review these before deploying beyond local development.

## Disclaimer

IP-SAKTI Sahayak provides AI-assisted compliance guidance based on retrieved authoritative sources. It is **not** a final legal opinion, statutory approval, or patentability determination — verdicts should be reviewed by a qualified legal professional before being relied upon.

## License

No license file is currently included — add one before distributing or accepting contributions.
