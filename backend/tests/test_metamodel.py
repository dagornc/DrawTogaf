import pytest
from app.core.metamodel import (
    BusinessActor, BusinessService, ApplicationComponent, Device, Layer, ElementType
)
from app.core.relationships import RelationshipType, Relation
from app.core.graph import EnterpriseArchitectureGraph

def test_create_business_actor():
    actor = BusinessActor(name="Chief Architect", description="Responsible for EA")
    assert actor.layer == Layer.BUSINESS
    assert actor.type == ElementType.BUSINESS_ACTOR
    assert actor.name == "Chief Architect"
    assert actor.id is not None

def test_create_application_component():
    app = ApplicationComponent(name="CRM System")
    assert app.layer == Layer.APPLICATION
    assert app.type == ElementType.APPLICATION_COMPONENT

def test_graph_operations():
    graph = EnterpriseArchitectureGraph()
    
    actor = BusinessActor(name="User")
    app = ApplicationComponent(name="App")
    
    graph.add_element(actor)
    graph.add_element(app)
    
    relation = Relation(
        source_id=actor.id,
        target_id=app.id,
        type=RelationshipType.SERVING
    )
    graph.add_relation(relation)
    
    export = graph.to_dict()
    assert len(export["nodes"]) == 2
    assert len(export["edges"]) == 1
    assert export["edges"][0]["type"] == RelationshipType.SERVING
