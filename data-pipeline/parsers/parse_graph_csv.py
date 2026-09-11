from neo4j import GraphDatabase

# Connect to local Neo4j Docker container
URI = "bolt://localhost:7687"
AUTH = ("neo4j", "admin_password")

# Built-in botanical dataset (No external CSV required)
BUILTIN_BOTANICAL_DATA = [
    {"scientific_name": "Withania somnifera", "sanskrit_name": "Ashwagandha", "family": "Solanaceae", "therapeutic_use": "Adaptogen, Anti-stress"},
    {"scientific_name": "Musa paradisiaca", "sanskrit_name": "Kadali", "family": "Musaceae", "therapeutic_use": "Nutritional, Gastroprotective"},
    {"scientific_name": "Azadirachta indica", "sanskrit_name": "Nimba", "family": "Meliaceae", "therapeutic_use": "Antimicrobial, Skin disorders"},
    {"scientific_name": "Curcuma longa", "sanskrit_name": "Haridra", "family": "Zingiberaceae", "therapeutic_use": "Anti-inflammatory, Wound healing"}
]

def seed_builtin_graph_data():
    driver = GraphDatabase.driver(URI, auth=AUTH)

    def create_graph(tx, plant):
        tx.run("""
            MERGE (p:Plant {scientific_name: $scientific_name})
            ON CREATE SET p.sanskrit_name = $sanskrit_name, p.family = $family
            MERGE (t:TherapeuticUse {name: $therapeutic_use})
            MERGE (p)-[:HAS_THERAPEUTIC_USE]->(t)
        """, 
        scientific_name=plant['scientific_name'],
        sanskrit_name=plant['sanskrit_name'],
        family=plant['family'],
        therapeutic_use=plant['therapeutic_use'])

    with driver.session() as session:
        for plant in BUILTIN_BOTANICAL_DATA:
            print(f"Seeding Neo4j node: {plant['sanskrit_name']} ({plant['scientific_name']})...")
            session.execute_write(create_graph, plant)

    driver.close()
    print("Built-in botanical data successfully ingested into Neo4j graph.")

if __name__ == "__main__":
    seed_builtin_graph_data()	