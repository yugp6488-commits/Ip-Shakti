import ollama
from pydantic import BaseModel
from typing import List

# Connect to your local Qwen 3 model running on Ollama
ollama_client = ollama.Client(host='http://localhost:11434')

def run_ip_sakti_pipeline(ingredients: List[str], has_patent: bool, is_foreign_entity: bool) -> dict:
    # 1. Determine baseline NBA forms using our Python decision tree
    required_forms = []
    if is_foreign_entity:
        required_forms.append("NBA Form 1 (Access to Biological Resources)")
    if has_patent and is_foreign_entity:
        required_forms.append("NBA Form 3 (Applying for IPR outside India)")

    # 2. Build the Strict LLM Prompt (XML Controlled)
    prompt = f"""
    You are IP-SAKTI Sahayak, an air-gapped legal compliance engine.
    
    <form_requirements>
    {required_forms}
    </form_requirements>
    
    <user_query>
    Analyze formulation containing: {', '.join(ingredients)}. 
    Foreign entity: {is_foreign_entity}. Patent status: {has_patent}.
    </user_query>
    
    Based ONLY on the rules above, provide a short legal verdict explaining if they are cleared or blocked, and list the forms they need.
    """

    # 3. Trigger Local Inference (Zero Latency)
    response = ollama_client.chat(
        model='qwen3:30b',
        messages=[{'role': 'user', 'content': prompt}],
        options={'temperature': 0.0, 'seed': 42}
    )

    return {
        "status": "BLOCKED" if required_forms else "CLEARED",
        "required_nba_forms": required_forms,
        "legal_reasoning": response['message']['content']
    }