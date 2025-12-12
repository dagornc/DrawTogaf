import json
import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def extract_json_from_text(text: str) -> Dict[str, Any]:
    """
    Robustly extracts and interprets JSON from a string that might contain
    markdown formatting, code blocks, chain-of-thought, or surrounding text.
    """
    if not text:
        raise ValueError("Empty response text")

    # 1. Strip whitespace
    text = text.strip()
    
    # 2. Key Step: Remove <think>...</think> blocks first (DeepSeek/Reasoning models)
    # This prevents finding JSON-like structures inside reasoning traces.
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

    # 3. Try code blocks using regex
    # We look for markdown code blocks tagged with json or just untagged blocks with braces
    # Reversed order to prefer the final block (often the result)
    code_block_matches = re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    for json_str in reversed(code_block_matches):
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            continue

    # 4. Fallback: Search for ANY valid JSON object in the text
    # We scan for '{' and try to parse a valid object starting there using raw_decode.
    # This handles trailing text, leading text, and multiple objects (we take the last one).
    decoder = json.JSONDecoder()
    candidate_jsons = []
    
    start_pos = 0
    while True:
        idx = text.find('{', start_pos)
        if idx == -1:
            break
            
        try:
            obj, end_idx = decoder.raw_decode(text[idx:])
            # We expect a dictionary (the graph structure)
            if isinstance(obj, dict):
                candidate_jsons.append(obj)
            
            # Move past this object to find the next one
            # raw_decode returns the index in the slice, so we add idx to get global index
            start_pos = idx + end_idx
        except json.JSONDecodeError:
            # If parsing failed at this '{', advance by 1 to try finding the next '{'
            # inside (if nested) or after.
            start_pos = idx + 1

    if candidate_jsons:
        # Return the last valid JSON object found, assuming it's the final answer
        return candidate_jsons[-1]

    # 5. If all fails
    logger.error(f"Failed to parse JSON from text. Content snippet of first 200 chars: {text[:200]}...")
    raise ValueError("Could not parse JSON from LLM response: No JSON object found in response")
