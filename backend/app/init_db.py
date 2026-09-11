import psycopg2
from neo4j import GraphDatabase

def init_postgres():
    # Connect to your new Docker Postgres container
    conn = psycopg2.connect(
        "dbname=ipsakti_db user=admin password=admin_password host=localhost port=5432"
    )
    cur = conn.cursor()
    
    # Enable pgvector and create the table
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    # Drop table since it only contains seed data and schema needs to change
    cur.execute("DROP TABLE IF EXISTS legal_chunks;")
    cur.execute("""
        CREATE TABLE legal_chunks (
            id SERIAL PRIMARY KEY,
            evidence_id VARCHAR(100) UNIQUE,
            document_id VARCHAR(100),
            title VARCHAR(255),
            authority VARCHAR(100),
            domain VARCHAR(100),
            jurisdiction VARCHAR(100),
            act_name VARCHAR(255),
            section VARCHAR(100),
            page INTEGER,
            source_url VARCHAR(500),
            publication_date DATE,
            effective_date DATE,
            version VARCHAR(50),
            document_hash VARCHAR(64),
            trust_level VARCHAR(50) DEFAULT 'unverified',
            content TEXT,
            embedding vector(768),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    # Create users table for JWT Authentication
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Phase 4: Database Least Privilege
    try:
        # We catch exceptions because roles might already exist or we might not have superuser access to create roles
        cur.execute("DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ipsakti_runtime') THEN CREATE ROLE ipsakti_runtime LOGIN PASSWORD 'runtime_secret'; END IF; END $$;")
        cur.execute("DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ipsakti_ingest') THEN CREATE ROLE ipsakti_ingest LOGIN PASSWORD 'ingest_secret'; END IF; END $$;")
    except Exception as e:
        print(f"Role creation skipped (likely due to permissions or existing roles): {e}")
        
    cur.execute("GRANT SELECT ON legal_chunks TO ipsakti_runtime;")
    cur.execute("GRANT SELECT, INSERT, UPDATE ON legal_chunks TO ipsakti_ingest;")
    cur.execute("GRANT USAGE, SELECT ON SEQUENCE legal_chunks_id_seq TO ipsakti_ingest;")
    
    # Grant users table permissions
    cur.execute("GRANT SELECT, INSERT, UPDATE ON users TO ipsakti_runtime;")
    cur.execute("GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO ipsakti_runtime;")
    
    conn.commit()
    cur.close()
    conn.close()
    print("PostgreSQL pgvector table and roles initialized successfully.")

def init_neo4j():
    # Connect to your new Docker Neo4j container
    driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "admin_password"))
    with driver.session() as session:
        session.run("CREATE CONSTRAINT FOR (p:Plant) REQUIRE p.scientific_name IS UNIQUE;")
        session.run("CREATE CONSTRAINT FOR (t:Term) REQUIRE t.name IS UNIQUE;")
    driver.close()
    print("Neo4j graph constraints initialized successfully.")

if __name__ == "__main__":
    init_postgres()
    init_neo4j()