import hashlib
import hmac
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


class PresentationRequest(BaseModel):
    transcript: str
    title: str = Field(default="練習", max_length=200)
    duration_seconds: int = Field(default=0, ge=0)


class TranscriptionSegment(BaseModel):
    start: float
    end: float
    text: str


class TranscriptionResponse(BaseModel):
    transcript: str
    language: str
    duration_seconds: float
    segments: list[TranscriptionSegment]


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
    prompt = f"""あなたはプレゼン指導AIです。
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
        raise HTTPException(status_code=504, detail="Ollamaの応答がタイムアウトしました") from exc
    except (httpx.HTTPError, KeyError) as exc:
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
        return {"id": practice.id, "model": "gemma3:4b", "feedback": feedback}
