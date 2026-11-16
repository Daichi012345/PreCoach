import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock

import httpx

from rag import cosine_similarity, retrieve_guidance


class RagTests(unittest.TestCase):
    def test_cosine_similarity(self):
        self.assertAlmostEqual(cosine_similarity([1.0, 0.0], [1.0, 0.0]), 1.0)
        self.assertEqual(cosine_similarity([], []), 0.0)

    def test_retrieves_top_chunks_and_limits_context(self):
        with tempfile.TemporaryDirectory() as temporary_directory:
            knowledge_dir = Path(temporary_directory)
            (knowledge_dir / "first.md").write_text("結論を先に示す", encoding="utf-8")
            (knowledge_dir / "second.md").write_text("具体例を含める", encoding="utf-8")
            response_vectors = iter(
                [
                    [1.0, 0.0],
                    [1.0, 0.0],
                    [0.0, 1.0],
                    [0.0, 1.0],
                    [0.0, 1.0],
                ]
            )
            client = Mock()
            client.post.side_effect = lambda *args, **kwargs: httpx.Response(
                200,
                json={"embeddings": [next(response_vectors)]},
                request=httpx.Request("POST", "http://ollama/api/embed"),
            )

            result = retrieve_guidance(
                "発表の構成",
                knowledge_dir,
                ollama_url="http://ollama",
                embedding_model="nomic-embed-text",
                top_k=1,
                max_context_chars=30,
                client=client,
            )

        self.assertIn("[first.md]", result)
        self.assertNotIn("second.md", result)
        self.assertLessEqual(len(result), 30)


if __name__ == "__main__":
    unittest.main()
