# backend/app/bhashini.py
import requests
from app.core.config import settings

# Configuration for Bhashini Pipeline API (ULCA)
BHASHINI_URL = "https://meity-ulca.preprod.ulcacontrib.org/ulca/apis/v0/model/compute"
API_KEY = settings.BHASHINI_API_KEY

def translate_regional_text(text: str, source_language: str = "hi", target_language: str = "en") -> str:
    """
    Translates regional Indian language text into canonical English 
    so the backend and LLM reasoning nodes can process it uniformly.
    """
    payload = {
        "modelConfigs": [
            {
                "task": "translation",
                "pipelineId": "64392f96daac500b92c9883a", # Standard ULCA NMT Pipeline ID
                "sourceLanguage": source_language,
                "targetLanguage": target_language
            }
        ],
        "inputData": {
            "input": [{"source": text}]
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "ulcaApiKey": API_KEY
    }
    
    try:
        response = requests.post(BHASHINI_URL, json=payload, headers=headers, timeout=5.0)
        if response.status_code == 200:
            res_data = response.json()
            translated_text = res_data["pipelineResponse"][0]["output"][0]["target"]
            print(f"[Bhashini Translation] '{text}' ({source_language}) -> '{translated_text}' (en)")
            return translated_text
        else:
            print(f"[Bhashini API Error]: {response.status_code}")
    except Exception as e:
        print(f"[Bhashini Connection Failed]: {e}")
        
 
    return text