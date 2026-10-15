
import os

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434"
)


@app.get("/")
def root():
    return {"message": "PreCoach API is running"}


class PresentationRequest(BaseModel):
    transcript: str


@app.post("/api/analyze-content")
async def analyze_content(data: PresentationRequest):
    if not data.transcript.strip():
        raise HTTPException(
            status_code=400,
            detail="文字起こし結果が空です"
        )

    prompt = f"""
あなたはプレゼン指導AIです。
以下の発表内容を日本語で評価してください。

必ず次の形式で簡潔に回答してください。

【良かった点】
1文で回答

【改善点】
1文で回答

【次回のアドバイス】
1文で回答

全体で150文字以内にしてください。
発表内容にない情報は推測しないでください。

発表内容：
{data.transcript}
"""

    try:
        async with httpx.AsyncClient(timeout=180) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "gemma3:4b",
                    "prompt": prompt,
                    "stream": False,
                    "keep_alive": "30m",
                    "options": {
                        "num_predict": 150,
                        "temperature": 0.3
                    }
                }
            )

            response.raise_for_status()
            result = response.json()

        return {
            "model": "gemma3:4b",
            "feedback": result["response"]
        }

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Ollamaの応答がタイムアウトしました"
        )

    except httpx.HTTPError:
        raise HTTPException(
            status_code=503,
            detail="Ollamaとの通信に失敗しました"
        )
