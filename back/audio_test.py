
import sounddevice as sd
import numpy as np
import time

# =========================
# 設定
# =========================
SAMPLE_RATE = 16000       # サンプリング周波数
CHANNELS = 1              # モノラル
RECORD_SECONDS = 10       # 録音時間（秒）
BLOCK_SECONDS = 0.1       # 0.1秒ごとに分析
SILENCE_THRESHOLD = 0.015 # 無音判定のしきい値

# マイクのデバイス番号
DEVICE_ID = 1

# 音声データを保存するリスト
audio_data = []

# 声の大きさを保存するリスト
volume_history = []

# 無音時間の合計
silence_seconds = 0.0


def audio_callback(indata, frames, time_info, status):
    """マイクから取得した音声を一定間隔で処理する"""
    global silence_seconds

    if status:
        print("音声取得の警告:", status)

    # 音声データをコピーして保存
    data = indata[:, 0].copy()
    audio_data.append(data)

    # 音声の実効値（RMS）を計算
    rms = np.sqrt(np.mean(data ** 2))

    # 声の大きさを記録
    volume_history.append(rms)

    # 無音判定
    if rms < SILENCE_THRESHOLD:
        silence_seconds += BLOCK_SECONDS

    print(f"音量: {rms:.4f}", end="")

    if rms < SILENCE_THRESHOLD:
        print("  → 無音と判定")
    else:
        print("  → 音声あり")


def main():
    print("音声分析テストを開始します。")
    print(f"{RECORD_SECONDS}秒間、マイクに向かって話してください。")
    print("終了まで少し待ってください。\n")

    try:
        with sd.InputStream(
            device=DEVICE_ID,
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype="float32",
            blocksize=int(SAMPLE_RATE * BLOCK_SECONDS),
            callback=audio_callback
        ):
            time.sleep(RECORD_SECONDS)

    except Exception as e:
        print("\nマイクの取得中にエラーが発生しました。")
        print(e)
        return

    print("\n\n===== 音声分析結果 =====")

    if not volume_history:
        print("音声データを取得できませんでした。")
        return

    # 平均音量
    average_volume = np.mean(volume_history)

    # 最大音量
    max_volume = np.max(volume_history)

    # 無音率
    silence_rate = silence_seconds / RECORD_SECONDS * 100

    print(f"録音時間: {RECORD_SECONDS}秒")
    print(f"平均音量（RMS）: {average_volume:.4f}")
    print(f"最大音量（RMS）: {max_volume:.4f}")
    print(f"無音時間（推定）: {silence_seconds:.1f}秒")
    print(f"無音率（推定）: {silence_rate:.1f}%")

    # 録音データを結合
    recorded_audio = np.concatenate(audio_data)

    # 音声ファイルとして保存
    sd.play(recorded_audio, samplerate=SAMPLE_RATE)
    sd.wait()


if __name__ == "__main__":
    main()

