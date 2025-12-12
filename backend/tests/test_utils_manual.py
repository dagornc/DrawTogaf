
import unittest
from app.core.utils import extract_json_from_text

class TestUtils(unittest.TestCase):
    def test_extract_simple_json(self):
        text = '{"key": "value"}'
        self.assertEqual(extract_json_from_text(text), {"key": "value"})

    def test_extract_markdown_json(self):
        text = '```json\n{"key": "value"}\n```'
        self.assertEqual(extract_json_from_text(text), {"key": "value"})

    def test_extract_with_think_block(self):
        text = '<think>some reasoning</think> {"key": "value"}'
        self.assertEqual(extract_json_from_text(text), {"key": "value"})

    def test_extract_nested_json(self):
        text = 'some text {"key": {"nested": "value"}} more text'
        self.assertEqual(extract_json_from_text(text), {"key": {"nested": "value"}})

    def test_empty_text(self):
        with self.assertRaisesRegex(ValueError, "Empty response text"):
            extract_json_from_text("")

    def test_no_json(self):
        with self.assertRaisesRegex(ValueError, "Could not parse JSON"):
            extract_json_from_text("Just some text")

if __name__ == '__main__':
    unittest.main()
