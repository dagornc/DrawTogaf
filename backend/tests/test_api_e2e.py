from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app
import json

client = TestClient(app)

def test_generate_endpoint_e2e():
    # Mock the LLM Logic to convert specific prompt to a predictable graph
    mock_llm_response = {
        "nodes": [
            {"id": "1", "name": "Customer", "type": "BusinessActor", "layer": "Business"},
            {"id": "2", "name": "CRM", "type": "ApplicationComponent", "layer": "Application"}
        ],
        "edges": []
    }
    
    # We patch GenerationService's generate_architecture method
    # Since the API calls it.
    # Note: validation logic in API endpoint depends on the returned dict.
    
    with patch("app.services.generation_service.GenerationService.generate_architecture", new_callable=AsyncMock) as mock_gen:
        mock_gen.return_value = mock_llm_response
        
        response = client.post("/api/generate", json={
            "prompt": "Test Prompt",
            "schema_type": "application"
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Check Structure
        assert "graph" in data
        assert "compliance" in data
        
        # Check Graph Content
        assert len(data["graph"]["nodes"]) == 2
        
        # Check Compliance (Expect Orphan error because edges are empty)
        assert data["compliance"]["score"] < 100
        assert len(data["compliance"]["issues"]) > 0
        assert data["compliance"]["issues"][0]["message"] == "Orphan element"
