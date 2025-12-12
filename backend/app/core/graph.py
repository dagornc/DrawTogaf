import networkx as nx
from typing import List, Optional, Dict
from .metamodel import ArchimateElement, ElementType, Layer
from .relationships import Relation, RelationshipType

class EnterpriseArchitectureGraph:
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_element(self, element: ArchimateElement):
        """Add a node to the graph"""
        self.graph.add_node(element.id, data=element)

    def add_relation(self, relation: Relation):
        """Add an edge to the graph"""
        self.graph.add_edge(
            relation.source_id, 
            relation.target_id, 
            type=relation.type,
            data=relation
        )

    def get_element(self, element_id: str) -> Optional[ArchimateElement]:
        if element_id in self.graph.nodes:
            return self.graph.nodes[element_id]["data"]
        return None

    def get_elements_by_layer(self, layer: Layer) -> List[ArchimateElement]:
        return [
            data["data"] 
            for _, data in self.graph.nodes(data=True) 
            if data["data"].layer == layer
        ]

    def to_dict(self) -> Dict:
        """Export for Frontend"""
        nodes = []
        edges = []
        
        for n_id, data in self.graph.nodes(data=True):
            element: ArchimateElement = data["data"]
            nodes.append(element.model_dump())
            
        for u, v, data in self.graph.edges(data=True):
            relation: Relation = data["data"]
            edges.append(relation.model_dump())
            
        return {
            "nodes": nodes,
            "edges": edges
        }
