import json
import logging
import re
from typing import Dict, Any
from app.services.llm_service import LLMService
from app.core.utils import extract_json_from_text
from app.core.graph import EnterpriseArchitectureGraph
from app.core.factory import ElementFactory
from app.core.relationships import Relation, RelationshipType
from app.core.prompts import TOGAF_SYSTEM_PROMPTS

logger = logging.getLogger(__name__)

class GenerationService:
    def __init__(self):
        self.llm_service = LLMService()

    async def generate_architecture(self, prompt: str, schema_type: str = "application", model: str = "openai/gpt-3.5-turbo") -> Dict[str, Any]:
        """
        Orchestrates the generation flow: Prompt -> LLM -> JSON -> Graph -> Frontend Dict
        """
        logger.info(f"Generating architecture for prompt: {prompt[:50]}... with schema {schema_type} and model {model}")
        
        # Select prompt based on schema_type
        system_prompt = TOGAF_SYSTEM_PROMPTS.get(schema_type, TOGAF_SYSTEM_PROMPTS["default"])

        # 1. Call LLM
        response_json = await self.llm_service.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            model=model
        )
        
        # 2. Parse Content
        # OpenRouter usually returns standard OpenAI format: choices[0].message.content
        if "choices" in response_json and len(response_json["choices"]) > 0:
            message = response_json["choices"][0]["message"]
            content_str = message.get("content", "") or ""
            finish_reason = response_json["choices"][0].get("finish_reason")
            
            # Fallback: Check 'reasoning' field if content is empty (common with some DeepSeek models)
            if not content_str:
                reasoning = message.get("reasoning", "")
                if reasoning:
                    logger.warning(f"Content was empty. Using 'reasoning' field as fallback. Finish reason: {finish_reason}")
                    content_str = reasoning
            
            if not content_str:
                logger.error(f"Received empty content from LLM. Finish reason: {finish_reason}. Full response: {response_json}")
                raise ValueError(f"LLM returned empty response. Finish reason: {finish_reason}")
        else:
            # Fallback or direct content
            content_str = str(response_json)

        try:
             data = extract_json_from_text(content_str)
        except ValueError as e:
            logger.error(f"Failed to parse JSON from LLM response. Content snippet: {content_str[:200]}... Full response keys: {response_json.keys() if isinstance(response_json, dict) else 'Not a dict'}")
            raise ValueError(str(e))

        # 3. Build Graph
        graph = EnterpriseArchitectureGraph()
        name_to_id = {}

        # Helper to process layers
        def process_elements(elements, layer_key):
            for el in elements:
                el_type = el.get("type", "")
                name = el.get("name", "Unknown")
                desc = el.get("description", "")
                
                # Use Factory to create element
                obj = ElementFactory.create_element(el_type, name, desc)
                
                if obj:
                    graph.add_element(obj)
                    name_to_id[name.lower()] = obj.id
                else:
                    logger.warning(f"Unknown element type: {el_type} for element {name}")

        # Process all layers in data
        process_elements(data.get("strategy_layer", []), "strategy")
        process_elements(data.get("business_layer", []), "business")
        process_elements(data.get("application_layer", []), "application")
        process_elements(data.get("technology_layer", []), "technology")
        process_elements(data.get("physical_layer", []), "physical")
        process_elements(data.get("motivation_layer", []), "motivation")
        process_elements(data.get("implementation_layer", []), "implementation")

        # 4. Process Relationships
        for rel in data.get("relationships", []):
            src_name = rel.get("source", "").lower()
            tgt_name = rel.get("target", "").lower()
            rel_type_str = rel.get("type", "Association")
            
            if src_name in name_to_id and tgt_name in name_to_id:
                # Map string to Enum
                try:
                    rel_enum = RelationshipType(rel_type_str)
                except ValueError:
                    rel_enum = RelationshipType.ASSOCIATION
                
                relation = Relation(
                    source_id=name_to_id[src_name],
                    target_id=name_to_id[tgt_name],
                    type=rel_enum,
                    description=rel.get("description", "")
                )
                graph.add_relation(relation)

        return graph.to_dict()
