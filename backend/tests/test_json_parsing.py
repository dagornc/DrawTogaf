import pytest
from app.core.utils import extract_json_from_text

def test_extract_clean_json():
    text = '{"key": "value"}'
    assert extract_json_from_text(text) == {"key": "value"}

def test_extract_markdown_json():
    text = '```json\n{"key": "value"}\n```'
    assert extract_json_from_text(text) == {"key": "value"}

def test_extract_markdown_no_tag():
    text = '```\n{"key": "value"}\n```'
    assert extract_json_from_text(text) == {"key": "value"}

def test_extract_with_preamble_and_postamble():
    text = 'Here is the JSON:\n```json\n{"key": "value"}\n```\nHope this helps!'
    assert extract_json_from_text(text) == {"key": "value"}

def test_extract_messy_no_code_blocks():
    text = 'Sure, I can help. {"key": "value"} is the answer.'
    assert extract_json_from_text(text) == {"key": "value"}

def test_extract_deepseek_reasoning():
    text = '<think>I need to generate a JSON object.</think>\n```json\n{"key": "value"}\n```'
    assert extract_json_from_text(text) == {"key": "value"}

def test_extract_multiple_code_blocks():
    # Should take the last one
    text = 'First attempt:\n```json\n{"attempt": 1}\n```\nCorrection:\n```json\n{"attempt": 2}\n```'
    assert extract_json_from_text(text) == {"attempt": 2}

def test_extract_partial_json_failure():
    text = 'This is not valid json: {key: value}'
    with pytest.raises(ValueError):
        extract_json_from_text(text)
