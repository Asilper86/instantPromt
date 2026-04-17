# Guía de Configuración: Vercel Edge Config para InstantPrompt

Para una seguridad de nivel profesional, no debemos exponer las API Keys en el código o en variables de entorno estáticas que requieran un nuevo despliegue para cambiar. Usaremos **Vercel Edge Config** para una gestión dinámica y segura.

## 1. Crear el Edge Config en Vercel

1. Ve a tu panel de Vercel y selecciona tu proyecto.
2. Haz clic en la pestaña **"Storage"**.
3. Selecciona **"Edge Config"** y haz clic en **"Create New"**.
4. Ponle un nombre (ej: `instantprompt-config`).

## 2. Añadir la API Key

En el editor de items del Edge Config, añade un objeto JSON:

```json
{
  "GROQ_API_KEY": "gsk_your_real_key_here"
}
```

## 3. Conectar a la Aplicación

Vercel creará automáticamente una variable de entorno llamada `EDGE_CONFIG`. 

Para leerla desde el backend (si despliegas el backend en Vercel Functions o similar), puedes usar el SDK:

```python
# pip install vercel-edge-config
from vercel_edge_config import get

api_key = get('GROQ_API_KEY')
```

## 4. Beneficios en Producción

*   **Cambio Instantáneo**: Si necesitas rotar la clave porque ha sido comprometida, la cambias en Edge Config y la app la usa en milisegundos sin necesidad de hacer `re-deploy`.
*   **Seguridad**: La clave no reside en el sistema de archivos del servidor.
*   **Baja Latencia**: Edge Config se sirve desde el borde (Edge), lo que garantiza que el backend la obtenga casi instantáneamente.

---
*Documento generado por Antigravity para InstantPrompt Professional.*
