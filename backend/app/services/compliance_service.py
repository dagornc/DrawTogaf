from typing import List, Dict, Any
from app.core.graph import EnterpriseArchitectureGraph
from app.core.metamodel import Layer, ElementType
from app.core.relationships import RelationshipType

class ComplianceService:
    def validate_graph(self, graph: EnterpriseArchitectureGraph) -> Dict[str, Any]:
        """
        Validate the EA model against TOGAF and ArchiMate rules.
        """
        issues = []
        score = 100

        # 1. Check for Orphan Nodes (Nodes with no edges)
        # Note: NetworkX graph.degree returns (node, degree)
        degrees = dict(graph.graph.degree())
        for node_id, degree in degrees.items():
            if degree == 0:
                element = graph.get_element(node_id)
                issues.append({
                    "severity": "medium",
                    "element": element.name,
                    "message": f"Orphan element: '{element.name}' ({element.type}) is not connected to anything."
                })
                score -= 5

        # 2. Check Layer Violations (Business should not directly serve Technology)
        for u, v, data in graph.graph.edges(data=True):
            source = graph.get_element(u)
            target = graph.get_element(v)
            relation_type = data.get("type")

            # Example Rule: Business Actor cannot 'serve' a Device directly (needs App Interface)
            if (source.layer == Layer.BUSINESS and target.layer == Layer.TECHNOLOGY) or \
               (source.layer == Layer.TECHNOLOGY and target.layer == Layer.BUSINESS):
                issues.append({
                    "severity": "high",
                    "element": f"{source.name} -> {target.name}",
                    "message": f"Cross-Layer Violation: Direct connection between {source.layer} and {target.layer} layers is often an anti-pattern. Use Application Layer as bridge."
                })
                score -= 10

        # 3. Check Protocol/Naming (Simple check)
        nodes = graph.graph.nodes(data=True)
        for _, data in nodes:
            el = data["data"]
            if not el.description or len(el.description) < 5:
                issues.append({
                    "severity": "low",
                    "element": el.name,
                    "message": "Missing or short description. Documentation is key in TOGAF."
                })
                score -= 1

        return {
            "score": max(0, score),
            "issues": issues,
            "compliant": score > 80
        }

    def validate_graph_dict(self, graph_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate a graph dictionary by reconstructing the graph object first.
        """
        try:
            from app.core.graph import EnterpriseArchitectureGraph
            from app.core.factory import ElementFactory
            from app.core.relationships import Relation, RelationshipType

            graph = EnterpriseArchitectureGraph()
            name_to_id = {}

            # Reconstruction logic (similar to GenerationService but simplified)
            all_nodes = graph_dict.get("nodes", [])
            for node_data in all_nodes:
                el_type = node_data.get("type", "")
                name = node_data.get("name", "Unknown")
                desc = node_data.get("description", "")
                
                # Use Factory
                obj = ElementFactory.create_element(el_type, name, desc)
                if obj:
                    # If ID is preserved in dict, use it (important for edges)
                    if "id" in node_data:
                        obj.id = node_data["id"]
                    
                    graph.add_element(obj)
                    name_to_id[name.lower()] = obj.id
                    # Also map by ID if available for edge reconstruction
                    name_to_id[obj.id] = obj.id

            all_edges = graph_dict.get("edges", [])
            for edge_data in all_edges:
                source = edge_data.get("source_id") 
                target = edge_data.get("target_id")
                # Fallback if names are used in dict instead of IDs (depends on GenerationService output)
                # GenerationService output currently has 'nodes' and 'edges' with IDs.
                
                if source and target:
                    try:
                        # Map string type to Enum
                        rel_type_str = edge_data.get("relationship_type", "Association")
                        rel_enum = RelationshipType(rel_type_str)
                    except ValueError:
                        rel_enum = RelationshipType.ASSOCIATION

                    relation = Relation(
                        source_id=source,
                        target_id=target,
                        type=rel_enum,
                        description=edge_data.get("description", "")
                    )
                    graph.add_relation(relation)

            return self.validate_graph(graph)
        except Exception as e:
            # Fallback if reconstruction fails
            return {
                "score": 0,
                "issues": [{"severity": "high", "element": "System", "message": f"Validation failed due to internal error: {str(e)}"}],
                "compliant": False
            }
