from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

import httpx


@dataclass(frozen=True)
class KnowledgeChunk:
    source: str
    text: str


def load_knowledge_chunks(knowledge_dir: Path) -> list[KnowledgeChunk]:
    if not knowledge_dir.is_dir():
        return []

    chunks: list[KnowledgeChunk] = []
    for path in sorted(knowledge_dir.glob("*.md")):
        text = path.read_text(encoding="utf-8").strip()
        if text:
            chunks.append(KnowledgeChunk(path.name, text))
    return chunks


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if len(left) != len(right) or not left:
        return 0.0
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return sum(a * b for a, b in zip(left, right)) / (left_norm * right_norm)


def embed_text(
    text: str,
    ollama_url: str,
    embedding_model: str,
    *,
    client: httpx.Client,
) -> list[float]:
    response = client.post(
        f"{ollama_url}/api/embed",
        json={"model": embedding_model, "input": text},
    )
    response.raise_for_status()
    embeddings = response.json()["embeddings"]
    if not embeddings or not embeddings[0]:
        raise ValueError("OllamaからEmbeddingが返されませんでした")
    return embeddings[0]


def retrieve_guidance(
    query: str,
    knowledge_dir: Path,
    *,
    ollama_url: str,
    embedding_model: str,
    top_k: int = 3,
    max_context_chars: int = 3000,
    client: httpx.Client | None = None,
) -> str:
    if not query.strip() or top_k <= 0 or max_context_chars <= 0:
        return ""

    chunks = load_knowledge_chunks(knowledge_dir)
    if not chunks:
        return ""

    def retrieve(embedding_client: httpx.Client) -> str:
        query_embedding = embed_text(
            query,
            ollama_url,
            embedding_model,
            client=embedding_client,
        )
        ranked = sorted(
            (
                (
                    cosine_similarity(
                        query_embedding,
                        embed_text(
                            chunk.text,
                            ollama_url,
                            embedding_model,
                            client=embedding_client,
                        ),
                    ),
                    chunk,
                )
                for chunk in chunks
            ),
            key=lambda item: (-item[0], item[1].source),
        )

        selected: list[str] = []
        remaining = max_context_chars
        for _, chunk in ranked[:top_k]:
            section = f"[{chunk.source}]\n{chunk.text}"[:remaining].rstrip()
            if not section:
                break
            selected.append(section)
            remaining -= len(section) + 2
            if remaining <= 0:
                break
        return "\n\n".join(selected)

    if client is not None:
        return retrieve(client)
    with httpx.Client(timeout=60) as embedding_client:
        return retrieve(embedding_client)
