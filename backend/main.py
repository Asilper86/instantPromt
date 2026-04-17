import os
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from collections import defaultdict
import time
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("InstantPrompt")

# Load env variables
load_dotenv()

from groq import Groq

# Initialize Groq
api_key = os.getenv("GROQ_API_KEY", "")
client = Groq(api_key=api_key) if api_key else None

app = FastAPI(title="InstantPrompt Professional API")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Basic IP Rate Limiting ---
class IPRateLimiter:
    def __init__(self, limit: int, window: int):
        self.limit = limit
        self.window = window
        self.requests = defaultdict(list)
    
    def check_rate_limit(self, ip: str):
        now = time.time()
        self.requests[ip] = [req_time for req_time in self.requests[ip] if req_time > now - self.window]
        if len(self.requests[ip]) >= self.limit:
            logger.warning(f"Rate limit exceeded for IP: {ip}")
            raise HTTPException(status_code=429, detail="Rate Limit Exceeded. Espera un minuto.")
        self.requests[ip].append(now)

limiter = IPRateLimiter(limit=20, window=60)

class PromptRequest(BaseModel):
    prompt: str
    tone: str
    variation: str = "Detailed" # Default variation

tones_config = {
    "Professional": {
        "role": "un Experto Consultor y Estratega de Negocios",
        "format": "Estructurado, con títulos claros, viñetas y un marco conceptual.",
        "instructions": "Mantén un tono objetivo. Usa lenguaje corporativo, formal y directo al punto."
    },
    "Creative": {
        "role": "un Director Creativo y Copywriter Galardonado",
        "format": "Dinámico, utilizando analogías o una estructura de 'storytelling'.",
        "instructions": "Piensa fuera de la caja. Utiliza un tono entusiasta e inspirador."
    },
    "Technical": {
        "role": "un Arquitecto de Software y Especialista de Sistemas",
        "format": "Documentación técnica con secciones de restricciones, inputs requeridos y pasos lógicos.",
        "instructions": "Sé extremadamente preciso. Nivel de detalle: Avanzado."
    },
    "Academic": {
        "role": "un Investigador Académico Cum Laude",
        "format": "Estructura investigativa: Contexto teórico, variables a considerar y rigor esperado.",
        "instructions": "Utiliza un registro formal y aséptico."
    }
}

variations_config = {
    "Short": "Redacta un prompt conciso, de máximo 3 frases, enfocado puramente en la acción inmediata.",
    "Detailed": "Redacta un prompt exhaustivo, incluyendo contexto, restricciones, ejemplos de salida y criterios de éxito.",
    "Creative": "Redacta un prompt con un enfoque original, pidiendo a la IA que asuma una personalidad única o use métodos no convencionales."
}

def fallback_optimize(prompt: str, tone: str, variation: str):
    """Fallback logic using templates if AI fails"""
    logger.info("Executing Fallback Optimization logic")
    role = tones_config.get(tone, tones_config["Professional"])["role"]
    return f"""### [FALLBACK OPTIMIZATION]
Actúa como {role}.
Tu tarea es: {prompt}
Instrucciones:
1. Analiza el contexto de la solicitud.
2. Genera una respuesta estructurada y profesional.
3. Asegúrate de cumplir con los estándares de calidad esperados para un perfil {tone}.
Variación solicitada: {variation}
---
Nota: Esta es una versión optimizada localmente debido a alta demanda."""

async def stream_groq(prompt: str, tone: str, variation: str):
    if not client:
        logger.error("GROQ_API_KEY missing in environment")
        yield "Error: Configuración de API faltante. Contacte al administrador."
        return
        
    config = tones_config.get(tone, tones_config["Professional"])
    var_instr = variations_config.get(variation, variations_config["Detailed"])
    
    system_prompt = f"""Eres {config['role']}. 
Tu ÚNICO propósito es convertir la idea del usuario en un "Megaprompt" excepcionalmente bien estructurado.

REGLAS ESTRICTAS:
1. NO saludes, NO hables de ti mismo, NO ofrezcas conclusiones fuera del prompt.
2. Devuelve EXCLUSIVAMENTE el texto del prompt optimizado.
3. Asegúrate de que el formato sea: {config['format']}
4. Aplica estas reglas de tono: {config['instructions']}
5. REGLA DE VARIACIÓN: {var_instr}"""

    try:
        stream = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Esta es mi idea base: {prompt}\n\nMéjorarla y devuelve solo el prompt optimizado."}
            ],
            stream=True,
            max_tokens=2048,
            temperature=0.7,
        )
        
        for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content
    except Exception as e:
        logger.error(f"Groq API Error: {str(e)}")
        # If streaming fails at the start, we can still yield the fallback
        yield fallback_optimize(prompt, tone, variation)

@app.post("/api/optimize")
async def optimize_prompt(request_data: PromptRequest, req: Request):
    if not request_data.prompt.strip():
        raise HTTPException(status_code=400, detail="El prompt no puede estar vacío.")
    
    # 1. Check Rate Limit
    client_ip = req.client.host if req.client else "127.0.0.1"
    limiter.check_rate_limit(client_ip)
    
    logger.info(f"Optimizing prompt for IP {client_ip} | Tone: {request_data.tone} | Variation: {request_data.variation}")
    
    # 2. Return Streaming Response
    return StreamingResponse(
        stream_groq(request_data.prompt, request_data.tone, request_data.variation),
        media_type="text/event-stream"
    )
