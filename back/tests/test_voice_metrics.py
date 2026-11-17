import unittest

from voice_metrics import analyze_voice_metrics


class AnalyzeVoiceMetricsTests(unittest.TestCase):
    def test_calculates_speech_rate_pauses_fillers_and_repeats(self):
        transcript = "えっと、今日は、今日は発表します。"
        segments = [
            {"start": 0.0, "end": 1.0, "text": "えっと、今日は"},
            {"start": 2.5, "end": 4.0, "text": "今日は発表します。"},
        ]

        result = analyze_voice_metrics(transcript, segments, 5.0)

        self.assertEqual(result["spoken_character_count"], 14)
        self.assertEqual(result["speech_duration_seconds"], 2.5)
        self.assertEqual(result["speaking_rate_characters_per_minute"], 336.0)
        self.assertEqual(result["estimated_silence_seconds"], 2.5)
        self.assertEqual(result["estimated_silence_ratio_percent"], 50.0)
        self.assertEqual(result["long_pause_count"], 1)
        self.assertEqual(result["filler_count"], 1)
        self.assertEqual(result["filler_per_minute"], 12.0)
        self.assertEqual(result["repeated_phrase_count"], 1)

    def test_does_not_count_lexical_ano_as_a_filler(self):
        result = analyze_voice_metrics(
            "あの人は発表します。",
            [{"start": 0.0, "end": 2.0, "text": "あの人は発表します。"}],
            2.0,
        )

        self.assertEqual(result["filler_count"], 0)

    def test_zero_duration_returns_zero_rates(self):
        result = analyze_voice_metrics("発表", [], 0.0)

        self.assertEqual(result["speaking_rate_characters_per_minute"], 0.0)
        self.assertEqual(result["estimated_silence_ratio_percent"], 0.0)
        self.assertEqual(result["filler_per_minute"], 0.0)

    def test_overlapping_segments_are_not_double_counted(self):
        result = analyze_voice_metrics(
            "発表内容です",
            [
                {"start": 0.0, "end": 2.0, "text": "発表"},
                {"start": 1.0, "end": 3.0, "text": "内容です"},
            ],
            3.0,
        )

        self.assertEqual(result["speech_duration_seconds"], 3.0)
        self.assertEqual(result["estimated_silence_seconds"], 0.0)


if __name__ == "__main__":
    unittest.main()
