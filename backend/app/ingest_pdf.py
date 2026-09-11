# backend/app/ingest_pdf.py
import pdfplumber
from app.crawler import ingest_text_to_pgvector

def process_legal_pdf(pdf_path: str):
    """
    Extracts text page by page from legal PDF documents and triggers pgvector ingestion.
    Defaults to 'user_private' trust level to prevent untrusted sources from overriding authoritative corpus.
    """
    print(f"📖 [PDF OCR/Parser] Processing file: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text and len(text.strip()) > 50:
                source_name = f"{pdf_path} - Page {i+1}"
                ingest_text_to_pgvector(text, source_name, trust_level="user_private")
                
    print(f"✅ [PDF Ingestion Complete] Successfully ingested {pdf_path}")