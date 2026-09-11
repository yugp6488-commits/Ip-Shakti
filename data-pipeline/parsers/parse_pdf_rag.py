import psycopg2
import ollama
import hashlib
import uuid

# Initialize local Ollama client for nomic-embed-text
ollama_client = ollama.Client(host='http://localhost:11434')

# Built-in statutory data (No external PDFs required)
BUILTIN_LEGAL_CHUNKS = [
    {
        "act_name": "Biological_Diversity_Act_2002",
        "title": "The Biological Diversity Act, 2002",
        "authority": "National Biodiversity Authority",
        "jurisdiction": "India",
        "section": "Section 3",
        "content": "No person who is not a citizen of India, or a body corporate, association or organization not incorporated or registered in India, shall obtain any biological resource occurring in India or knowledge associated thereto for research or for commercial utilization or for bio-survey and bio-utilization without prior approval of the National Biodiversity Authority."
    },
    {
        "act_name": "Patents_Act_1970",
        "title": "The Patents Act, 1970",
        "authority": "Indian Patent Office",
        "jurisdiction": "India",
        "section": "Section 3(p)",
        "content": "The following are not inventions within the meaning of this Act,— an invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components."
    },
    {
        "act_name": "Biological_Diversity_Amendment_Act_2023",
        "title": "The Biological Diversity (Amendment) Act, 2023",
        "authority": "National Biodiversity Authority",
        "jurisdiction": "India",
        "section": "Section 7",
        "content": "Prior intimation to the State Biodiversity Board is mandatory for any vaidya, hakim, or local practitioner who uses biological resources for commercial application, except for registered resident cultivators and traditional seed keepers."
    }
]

def seed_builtin_legal_data():
    conn = psycopg2.connect("dbname=ipsakti_db user=admin password=admin_password host=localhost port=5432")
    cur = conn.cursor()

    for item in BUILTIN_LEGAL_CHUNKS:
        print(f"Embedding and inserting: {item['act_name']} - {item['section']}...")
        
        # Generate 768-dim local vector embedding via Ollama
        embed_response = ollama_client.embeddings(
            model='nomic-embed-text',
            prompt=item['content']
        )
        embedding = embed_response['embedding']
        
        doc_hash = hashlib.sha256(item['content'].encode()).hexdigest()
        evidence_id = f"EV-SEED-{doc_hash[:8]}"

        # Insert into PostgreSQL pgvector table
        cur.execute("""
            INSERT INTO legal_chunks (
                evidence_id, title, authority, jurisdiction, act_name, section, document_hash, trust_level, content, embedding
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (evidence_id) DO NOTHING;
        """, (
            evidence_id, item.get('title'), item.get('authority'), item.get('jurisdiction'),
            item['act_name'], item['section'], doc_hash, 'official_authoritative', 
            item['content'], embedding
        ))

    conn.commit()
    cur.close()
    conn.close()
    print("Built-in legal data successfully embedded and stored in pgvector.")

if __name__ == "__main__":
    seed_builtin_legal_data()