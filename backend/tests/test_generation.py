import pytest
import json
from unittest.mock import AsyncMock, patch
from app.services.generation_service import GenerationService
from app.core.metamodel import ElementType

import asyncio

def test_generation_service():
    # Mock LLM Response
    mock_llm_response = {
        "choices": [{
            "message": {
                "content": json.dumps({
                    "business_layer": [
                        {"type": "BusinessActor", "name": "Customer", "description": "End user"}
                    ],
                    "application_layer": [],
                    "technology_layer": [],
                    "relationships": []
                })
            }
        }]
    }

    # Patch the LLMService within GenerationService
    with patch("app.services.llm_service.LLMService.generate_response", new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = mock_llm_response
        
        service = GenerationService()
        
        # Run async method synchronously
        result = asyncio.run(service.generate_architecture("Test prompt"))
        
        # Verify Graph Structure
        assert len(result["nodes"]) == 1
        assert result["nodes"][0]["name"] == "Customer"
        assert result["nodes"][0]["type"] == ElementType.BUSINESS_ACTOR
        
        # Verify LLM was called correctly
        mock_generate.assert_called_once()
