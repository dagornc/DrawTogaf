from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional, Annotated
from app.services.generation_service import GenerationService
from app.services.compliance_service import ComplianceService

router = APIRouter()

def get_generation_service():
    return GenerationService()

def get_compliance_service():
    return ComplianceService()

GenerationServiceDep = Annotated[GenerationService, Depends(get_generation_service)]
ComplianceServiceDep = Annotated[ComplianceService, Depends(get_compliance_service)]

class GenerateRequest(BaseModel):
    prompt: str
    schema_type: Optional[str] = "application"
    model: Optional[str] = "openai/gpt-3.5-turbo"

@router.get("/models")
async def get_models(generation_service: GenerationServiceDep):
    """
    Get available models from OpenRouter.
    """
    try:
        models = await generation_service.llm_service.get_available_models()
        return models
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch models: {str(e)}")

@router.post("/generate")
async def generate_architecture(
    request: GenerateRequest,
    generation_service: GenerationServiceDep,
    compliance_service: ComplianceServiceDep
):
    """
    Generate TOGAF architecture from natural language prompt, validated by Agent 5.
    """
    try:
        # 1. Generate Graph
        graph_dict = await generation_service.generate_architecture(
            prompt=request.prompt,
            schema_type=request.schema_type,
            model=request.model
        )
        
        # 2. Validate using ComplianceService
        # Refactored to use the service logic instead of inline code
        compliance_report = compliance_service.validate_graph_dict(graph_dict)
        
        return {
            "graph": graph_dict,
            "compliance": compliance_report
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

