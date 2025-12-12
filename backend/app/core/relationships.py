from enum import Enum
from pydantic import BaseModel, Field

class RelationshipType(str, Enum):
    # Structural
    COMPOSITION = "Composition"
    AGGREGATION = "Aggregation"
    ASSIGNMENT = "Assignment"
    REALIZATION = "Realization"
    
    # Dynamic
    SERVING = "Serving"
    ACCESS = "Access"
    INFLUENCE = "Influence"
    TRIGGERING = "Triggering"
    FLOW = "Flow"
    
    # Other
    ASSOCIATION = "Association"
    SPECIALIZATION = "Specialization"
    JUNCTION = "Junction"

class Relation(BaseModel):
    source_id: str
    target_id: str
    type: RelationshipType
    description: str = ""
    bidirectional: bool = False
