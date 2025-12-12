import os
import httpx
import json
from typing import Dict, Any, AsyncGenerator

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable is not set")

    async def generate_response(
        self, 
        prompt: str, 
        system_prompt: str,
        model: str = "tngtech/deepseek-r1t2-chimera:free"
    ) -> Dict[str, Any]:
        """
        Generate a complete response from the LLM.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://drawtogaf.app",
            "X-Title": "DrawTogaf"
        }
        
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            # "response_format": {"type": "json_object"} # Removed to avoid 400 on unsupported models
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            return response.json()

    async def stream_response(
        self,
        prompt: str,
        system_prompt: str,
        model: str = "tngtech/deepseek-r1t2-chimera:free"
    ) -> AsyncGenerator[str, None]:
        """
        Stream the response from the LLM.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://drawtogaf.app",
            "X-Title": "DrawTogaf"
        }
        
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "stream": True
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST", 
                f"{self.base_url}/chat/completions", 
                headers=headers, 
                json=data
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                        content = line[6:]
                        if content != "[DONE]":
                            yield content

    async def get_available_models(self) -> Dict[str, Any]:
        """
        Fetch available models from OpenRouter.
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://drawtogaf.app",
            "X-Title": "DrawTogaf"
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{self.base_url}/models",
                headers=headers
            )
            response.raise_for_status()
            return response.json()

