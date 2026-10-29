import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from transcription import transcribe_audio_file


class TranscribeAudioFileTests(unittest.TestCase):
    def test_returns_japanese_transcript_and_timestamps(self):
        segments = [
            SimpleNamespace(start=0.0, end=1.25, text=" 今日は"),
            SimpleNamespace(start=1.25, end=2.5, text="発表します。 "),
        ]
        model = Mock()
        model.transcribe.return_value = (
            iter(segments),
            SimpleNamespace(language="ja", duration=2.5),
        )

        with patch("transcription.get_transcription_model", return_value=model):
            result = transcribe_audio_file("sample.webm")

        self.assertEqual(result["transcript"], "今日は発表します。")
        self.assertEqual(result["language"], "ja")
        self.assertEqual(result["duration_seconds"], 2.5)
        self.assertEqual(
            result["segments"],
            [
                {"start": 0.0, "end": 1.25, "text": "今日は"},
                {"start": 1.25, "end": 2.5, "text": "発表します。"},
            ],
        )
        model.transcribe.assert_called_once_with(
            "sample.webm",
            language="ja",
            vad_filter=True,
        )


if __name__ == "__main__":
    unittest.main()
