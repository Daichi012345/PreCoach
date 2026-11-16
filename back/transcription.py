import os
from threading import Lock
from typing import Any

from voice_metrics import analyze_voice_metrics

_model: Any | None = None
_model_lock = Lock()


def get_transcription_model() -> Any:
    global _model

    if _model is None:
        with _model_lock:
            if _model is None:
                from faster_whisper import WhisperModel

                _model = WhisperModel(
                    os.getenv("WHISPER_MODEL_SIZE", "tiny"),
                    device="cpu",
                    compute_type="int8",
                )
    return _model


def transcribe_audio_file(audio_path: str) -> dict[str, Any]:
    model = get_transcription_model()
    segments, info = model.transcribe(
        audio_path,
        language="ja",
        vad_filter=True,
    )
    transcript_segments = [
        {
            "start": float(segment.start),
            "end": float(segment.end),
            "text": segment.text.strip(),
        }
        for segment in segments
    ]

    transcript = "".join(segment["text"] for segment in transcript_segments).strip()
    duration_seconds = float(info.duration)

    return {
        "transcript": transcript,
        "language": info.language,
        "duration_seconds": duration_seconds,
        "segments": transcript_segments,
        "voice_metrics": analyze_voice_metrics(
            transcript,
            transcript_segments,
            duration_seconds,
        ),
    }
