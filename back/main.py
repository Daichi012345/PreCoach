import hashlib
import hmac
import logging
import os
import secrets
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import httpx
from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, create_engine, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker
from starlette.concurrency import run_in_threadpool

from rag import retrieve_guidance
from transcription import transcribe_audio_file

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://precoach_user:admin@localhost:5432/precoach",
)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    organization: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    auth_token_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    practices: Mapped[list["Practice"]] = relationship(back_populates="user")


class Practice(Base):
    __tablename__ = "practices"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    duration_seconds: Mapped[int] = mapped_column(Integer)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    user: Mapped[User] = relationship(back_populates="practices")


Base.metadata.create_all(engine)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_origin_regex=os.getenv(
        "CORS_ORIGIN_REGEX",
        r"https?://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?",
    ),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_EMBEDDING_MODEL = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
KNOWLEDGE_DIR = Path(
    os.getenv("RAG_KNOWLEDGE_DIR", str(Path(__file__).parent / "knowledge"))
)
RAG_TOP_K = int(os.getenv("RAG_TOP_K", "3"))
RAG_MAX_CONTEXT_CHARS = int(os.getenv("RAG_MAX_CONTEXT_CHARS", "3000"))
logger = logging.getLogger(__name__)
MAX_AUDIO_SIZE = 50 * 1024 * 1024
SUPPORTED_AUDIO_TYPES = {
    "audio/mp4": ".m4a",
    "audio/mpeg": ".mp3",
    "audio/mpga": ".mpga",
    "audio/ogg": ".ogg",
    "audio/wav": ".wav",
    "audio/webm": ".webm",
    "audio/x-m4a": ".m4a",
    "audio/x-wav": ".wav",
}


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    organization: str = Field(min_length=1, max_length=200)
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=4, max_length=128)


class LoginRequest(BaseModel):
    email: str
    password: str


class VoiceMetrics(BaseModel):
    spoken_character_count: int = Field(ge=0)
    speech_duration_seconds: float = Field(ge=0)
    speaking_rate_characters_per_minute: float = Field(ge=0)
    estimated_silence_seconds: float = Field(ge=0)
    estimated_silence_ratio_percent: float = Field(ge=0, le=100)
    long_pause_count: int = Field(ge=0)
    filler_count: int = Field(ge=0)
    filler_per_minute: float = Field(ge=0)
    repeated_phrase_count: int = Field(ge=0)


class PresentationRequest(BaseModel):
    transcript: str
    title: str = Field(default="練習", max_length=200)
    duration_seconds: int = Field(default=0, ge=0)
    voice_metrics: VoiceMetrics | None = None


class TranscriptionSegment(BaseModel):
    start: float
    end: float
    text: str


class TranscriptionResponse(BaseModel):
    transcript: str
    language: str
    duration_seconds: float
    segments: list[TranscriptionSegment]
    voice_metrics: VoiceMetrics


def hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600_000)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_hex, digest_hex = stored_hash.split("$", 1)
        expected = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt_hex), 600_000
        ).hex()
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(expected, digest_hex)


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def issue_token(user: User, db: Session) -> str:
    token = secrets.token_urlsafe(32)
    user.auth_token_hash = token_hash(token)
    db.commit()
    return token


def current_user(authorization: str | None = Header(default=None)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="ログインが必要です")
    with SessionLocal() as db:
        user = db.scalar(
            select(User).where(User.auth_token_hash == token_hash(authorization[7:]))
        )
        if user is None:
            raise HTTPException(status_code=401, detail="ログインの有効期限が切れています")
        return user


@app.on_event("startup")
def verify_database_connection() -> None:
    with engine.connect() as connection:
        connection.exec_driver_sql("SELECT 1")


@app.get("/")
def root():
    return {"message": "PreCoach API is running"}


@app.post("/api/auth/register")
def register(data: RegisterRequest):
    email = data.email.strip().lower()
    name = data.name.strip()
    organization = data.organization.strip()
    if not name or not organization or not email:
        raise HTTPException(status_code=422, detail="入力内容を確認してください")
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.email == email)) is not None:
            raise HTTPException(status_code=409, detail="このメールアドレスは既に登録されています")
        user = User(
            name=name,
            organization=organization,
            email=email,
            password_hash=hash_password(data.password),
        )
        db.add(user)
        try:
            db.flush()
            token = issue_token(user, db)
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(
                status_code=409, detail="このメールアドレスは既に登録されています"
            ) from exc
        return {
            "token": token,
            "user": {"name": user.name, "organization": user.organization, "email": user.email},
        }


@app.post("/api/auth/login")
def login(data: LoginRequest):
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == data.email.strip().lower()))
        if user is None or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail="メールアドレスまたはパスワードが正しくありません",
            )
        token = issue_token(user, db)
        return {
            "token": token,
            "user": {"name": user.name, "organization": user.organization, "email": user.email},
        }


@app.get("/api/me")
def me(user: User = Depends(current_user)):
    return {"name": user.name, "organization": user.organization, "email": user.email}


@app.get("/api/practices")
def list_practices(user: User = Depends(current_user)):
    with SessionLocal() as db:
        practices = db.scalars(
            select(Practice)
            .where(Practice.user_id == user.id)
            .order_by(Practice.created_at.desc())
        ).all()
        return [
            {
                "id": practice.id,
                "date": practice.created_at.isoformat(),
                "title": practice.title,
                "duration": practice.duration_seconds,
                "score": practice.score,
                "feedback": practice.feedback,
            }
            for practice in practices
        ]


@app.post("/api/transcribe", response_model=TranscriptionResponse)
async def transcribe(
    audio: UploadFile = File(...),
    user: User = Depends(current_user),
):
    content_type = (audio.content_type or "").split(";", maxsplit=1)[0].strip().lower()
    extension = SUPPORTED_AUDIO_TYPES.get(content_type)
    if extension is None:
        raise HTTPException(status_code=415, detail="対応していない音声形式です")

    content = await audio.read(MAX_AUDIO_SIZE + 1)
    if not content:
        raise HTTPException(status_code=400, detail="音声ファイルが空です")
    if len(content) > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=413, detail="音声ファイルは50MB以下にしてください")

    temporary_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as temporary_file:
            temporary_file.write(content)
            temporary_path = temporary_file.name

        result = await run_in_threadpool(transcribe_audio_file, temporary_path)
    finally:
        if temporary_path is not None:
            Path(temporary_path).unlink(missing_ok=True)
        await audio.close()

    return result


@app.post("/api/analyze-content")
async def analyze_content(
    data: PresentationRequest,
    user: User = Depends(current_user),
):
    if not data.transcript.strip():
        raise HTTPException(status_code=400, detail="文字起こし結果が空です")
    metrics_prompt = ""
    if data.voice_metrics is not None:
        metrics = data.voice_metrics
        metrics_prompt = f"""音声指標（自動推定値）：
- 発話中の話速：{metrics.speaking_rate_characters_per_minute}文字/分
- 推定沈黙割合：{metrics.estimated_silence_ratio_percent}%、1秒以上の間：{metrics.long_pause_count}回
- フィラー候補：{metrics.filler_count}回（{metrics.filler_per_minute}回/分）
- 繰り返し表現候補：{metrics.repeated_phrase_count}箇所
"""
    try:
        guidance = await run_in_threadpool(
            retrieve_guidance,
            data.transcript,
            KNOWLEDGE_DIR,
            ollama_url=OLLAMA_URL,
            embedding_model=OLLAMA_EMBEDDING_MODEL,
            top_k=RAG_TOP_K,
            max_context_chars=RAG_MAX_CONTEXT_CHARS,
        )
    except (httpx.HTTPError, KeyError, ValueError) as exc:
        logger.error("Failed to retrieve RAG guidance: %s", exc)
        raise HTTPException(
            status_code=503,
            detail="Embeddingモデルによる資料検索に失敗しました",
        ) from exc

    retrieved_context = guidance or "関連する評価資料はありません。一般的な基準で評価してください。"
    prompt = f"""あなたはプレゼン指導AIです。
以下の評価資料を参考にしてください。資料にない内容を事実として扱わず、発表内容を最優先してください。
--- 評価資料 ---
{retrieved_context}
--- 評価資料ここまで ---
以下の発表内容を日本語で評価してください。
必ず次の形式で簡潔に回答してください。
【良かった点】
1文で回答
【改善点】
1文で回答。音声指標がある場合は、指標に基づく改善点を含める
【次回のアドバイス】
1文で回答
全体で150文字以内にしてください。
発表内容にない情報は推測しないでください。
音声指標は自動推定値であり、厳密な無音・言いよどみ判定ではありません。指標が示していない抑揚や声量は評価しないでください。
{metrics_prompt}
発表内容：
{data.transcript}"""
    try:
        async with httpx.AsyncClient(timeout=180) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "gemma3:4b",
                    "prompt": prompt,
                    "stream": False,
                    "keep_alive": "30m",
                    "options": {"num_predict": 150, "temperature": 0.3},
                },
            )
            response.raise_for_status()
            feedback = response.json()["response"]
    except httpx.TimeoutException as exc:
        logger.error("Ollama request timed out: %s", exc)
        raise HTTPException(status_code=504, detail="Ollamaの応答がタイムアウトしました") from exc
    except httpx.HTTPStatusError as exc:
        logger.error(
            "Ollama returned HTTP %s: %s",
            exc.response.status_code,
            exc.response.text,
        )
        raise HTTPException(status_code=503, detail="Ollamaとの通信に失敗しました") from exc
    except httpx.RequestError as exc:
        logger.error("Failed to connect to Ollama: %s", exc)
        raise HTTPException(status_code=503, detail="Ollamaとの通信に失敗しました") from exc
    except KeyError as exc:
        logger.error("Ollama response is missing the expected field: %s", exc)
        raise HTTPException(status_code=503, detail="Ollamaとの通信に失敗しました") from exc

    with SessionLocal() as db:
        practice = Practice(
            user_id=user.id,
            title=data.title.strip() or "練習",
            duration_seconds=data.duration_seconds,
            feedback=feedback,
        )
        db.add(practice)
        db.commit()
        db.refresh(practice)
        return {
            "id": practice.id,
            "model": "gemma3:4b",
            "transcript": data.transcript,
            "feedback": feedback,
        }
