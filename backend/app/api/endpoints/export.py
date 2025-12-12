from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.export_service import ExportService

router = APIRouter()
export_service = ExportService()

class ExportGraphRequest(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

@router.post("/pptx")
async def export_pptx(data: ExportGraphRequest):
    """
    Export the provided graph data (nodes/edges) to a PowerPoint file.
    """
    try:
        # data.dict() might be needed or just data.nodes
        graph_data = {
            "nodes": data.nodes,
            "edges": data.edges
        }
        
        file_stream = export_service.create_pptx(graph_data)
        
        headers = {
            "Content-Disposition": "attachment; filename=architecture.pptx"
        }
        
        return StreamingResponse(
            file_stream, 
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation", 
            headers=headers
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
