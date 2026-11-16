import re
import unicodedata
from collections.abc import Sequence
from typing import TypedDict


class VoiceMetrics(TypedDict):
    spoken_character_count: int
    speech_duration_seconds: float
    speaking_rate_characters_per_minute: float
    estimated_silence_seconds: float
    estimated_silence_ratio_percent: float
    long_pause_count: int
    filler_count: int
    filler_per_minute: float
    repeated_phrase_count: int


_FILLER_PATTERN = re.compile(
    r"えーと|えっと|あのー|あのう|うーんと|うーん|えー|あー|"
    r"あの(?=[、,。．.!！?？\s]|$)"
)
_REPEATED_PHRASE_PATTERN = re.compile(
    r"([ぁ-んァ-ヶ一-龠ーA-Za-z0-9]{2,12})[、,，。\s]+\1"
)
_LONG_PAUSE_SECONDS = 1.0


def _spoken_character_count(text: str) -> int:
    return sum(
        1
        for character in text
        if unicodedata.category(character)[0] in {"L", "N"}
    )


def _merge_speech_intervals(
    segments: Sequence[dict[str, float | str]],
    duration_seconds: float,
) -> list[tuple[float, float]]:
    intervals = sorted(
        (
            (max(0.0, float(segment["start"])), min(duration_seconds, float(segment["end"])))
            for segment in segments
        ),
        key=lambda interval: interval[0],
    )
    merged: list[tuple[float, float]] = []
    for start, end in intervals:
        if end <= start:
            continue
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def analyze_voice_metrics(
    transcript: str,
    segments: Sequence[dict[str, float | str]],
    duration_seconds: float,
) -> VoiceMetrics:
    safe_duration = max(0.0, float(duration_seconds))
    intervals = _merge_speech_intervals(segments, safe_duration)
    speech_duration = sum(end - start for start, end in intervals)
    silence_duration = max(0.0, safe_duration - speech_duration)
    character_count = _spoken_character_count(transcript)
    filler_count = len(_FILLER_PATTERN.findall(transcript))
    long_pause_count = sum(
        1
        for (_, previous_end), (next_start, _) in zip(intervals, intervals[1:])
        if next_start - previous_end >= _LONG_PAUSE_SECONDS
    )

    return {
        "spoken_character_count": character_count,
        "speech_duration_seconds": round(speech_duration, 2),
        "speaking_rate_characters_per_minute": round(
            character_count * 60 / speech_duration if speech_duration > 0 else 0.0,
            1,
        ),
        "estimated_silence_seconds": round(silence_duration, 2),
        "estimated_silence_ratio_percent": round(
            silence_duration * 100 / safe_duration if safe_duration > 0 else 0.0,
            1,
        ),
        "long_pause_count": long_pause_count,
        "filler_count": filler_count,
        "filler_per_minute": round(
            filler_count * 60 / safe_duration if safe_duration > 0 else 0.0,
            1,
        ),
        "repeated_phrase_count": len(_REPEATED_PHRASE_PATTERN.findall(transcript)),
    }
