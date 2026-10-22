
import cv2
import mediapipe as mp

from pathlib import Path
from collections import Counter
from time import perf_counter
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


# このPythonファイルと同じフォルダにあるモデルを読み込む
BASE_DIR = Path(__file__).resolve().parent
FACE_MODEL = BASE_DIR / "face_landmarker.task"
POSE_MODEL = BASE_DIR / "pose_landmarker_lite.task"


def estimate_face_direction(face_landmarks):
    """
    顔の特徴点から、顔の向きを簡易判定する。
    戻り値: Front / Left / Right / Unknown
    """

    nose = face_landmarks[1]
    left_side = face_landmarks[234]
    right_side = face_landmarks[454]

    # 顔の左右幅を計算
    face_width = right_side.x - left_side.x

    if abs(face_width) < 0.0001:
        return "Unknown"

    # 顔の中央に対する鼻の位置を計算
    face_center_x = (left_side.x + right_side.x) / 2
    nose_offset = (nose.x - face_center_x) / face_width

    # 顔の向きを簡易判定
    if nose_offset < -0.08:
        return "Left"
    elif nose_offset > 0.08:
        return "Right"
    else:
        return "Front"


def main():
    # モデルファイルの存在を確認
    if not FACE_MODEL.exists():
        print(f"顔検出モデルが見つかりません: {FACE_MODEL}")
        return

    if not POSE_MODEL.exists():
        print(f"姿勢検出モデルが見つかりません: {POSE_MODEL}")
        return

    # 顔検出モデル
    face_options = vision.FaceLandmarkerOptions(
        base_options=python.BaseOptions(
            model_asset_path=str(FACE_MODEL)
        ),
        running_mode=vision.RunningMode.VIDEO,
        num_faces=1
    )

    # 姿勢検出モデル
    pose_options = vision.PoseLandmarkerOptions(
        base_options=python.BaseOptions(
            model_asset_path=str(POSE_MODEL)
        ),
        running_mode=vision.RunningMode.VIDEO,
        num_poses=1
    )

    with (
        vision.FaceLandmarker.create_from_options(face_options) as face_detector,
        vision.PoseLandmarker.create_from_options(pose_options) as pose_detector
    ):
        # PCのカメラを起動
        cap = cv2.VideoCapture(0)

        if not cap.isOpened():
            print("カメラを起動できませんでした。")
            return

        # 各方向の検出回数
        direction_counts = Counter()

        # 顔が検出されなかった回数
        not_detected_count = 0

        # 顔の向きを記録するリスト
        direction_history = []

        frame_count = 0
        start_time = perf_counter()

        print("カメラを起動しました。")
        print("顔の向きを分析中です。終了するには q キーを押してください。")

        while True:
            success, frame = cap.read()

            if not success:
                print("カメラ映像を取得できませんでした。")
                break

            # MediaPipe用にBGRからRGBへ変換
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb_frame
            )

            # VIDEOモード用のタイムスタンプ
            timestamp_ms = int(frame_count * 33.333)

            # 顔を検出
            face_result = face_detector.detect_for_video(
                mp_image, timestamp_ms
            )

            # 姿勢を検出
            pose_result = pose_detector.detect_for_video(
                mp_image, timestamp_ms
            )

            # 顔の検出と向きの推定
            if face_result.face_landmarks:
                landmarks = face_result.face_landmarks[0]

                # 顔の特徴点を描画
                for point in landmarks:
                    x = int(point.x * frame.shape[1])
                    y = int(point.y * frame.shape[0])
                    cv2.circle(frame, (x, y), 1, (0, 255, 0), -1)

                direction = estimate_face_direction(landmarks)

                # 向きを記録
                direction_counts[direction] += 1
                direction_history.append(direction)

                cv2.putText(
                    frame,
                    f"Face: {direction}",
                    (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 0),
                    2
                )

            else:
                # 顔が検出されなかった場合
                not_detected_count += 1

                cv2.putText(
                    frame,
                    "Face: Not detected",
                    (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 0, 255),
                    2
                )

            # 姿勢の検出結果を表示
            if pose_result.pose_landmarks:
                landmarks = pose_result.pose_landmarks[0]

                # 肩・肘・手首・腰の特徴点を描画
                for index in [11, 12, 13, 14, 15, 16, 23, 24]:
                    point = landmarks[index]

                    x = int(point.x * frame.shape[1])
                    y = int(point.y * frame.shape[0])

                    cv2.circle(frame, (x, y), 5, (255, 0, 0), -1)

                cv2.putText(
                    frame,
                    "Pose detected",
                    (20, 70),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (255, 0, 0),
                    2
                )

            cv2.imshow("PreCoach - Camera Analysis", frame)

            frame_count += 1

            # qキーで終了
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        # 分析終了時刻
        elapsed_time = perf_counter() - start_time

        cap.release()
        cv2.destroyAllWindows()

        # 分析結果を表示
        print("\n========== 顔の向きの分析結果 ==========\n")
        print(f"分析時間：約{elapsed_time:.1f}秒")
        print(f"処理フレーム数：{frame_count}")

        # 顔が検出されたフレームの合計
        detected_count = sum(direction_counts.values())

        if detected_count > 0:
            print("\n【顔の向きの割合】")

            for direction, label in [
                ("Front", "正面（Front）"),
                ("Left", "左（Left）"),
                ("Right", "右（Right）"),
                ("Unknown", "判定不能（Unknown）")
            ]:
                count = direction_counts[direction]
                percentage = count / detected_count * 100

                print(
                    f"{label}：{percentage:.1f}% "
                    f"（{count}フレーム）"
                )

            print(f"\n顔が検出されたフレーム数：{detected_count}")
            print(f"顔が検出されなかったフレーム数：{not_detected_count}")

        else:
            print("\n顔を検出できなかったため、割合を計算できませんでした。")

        print("\n========================================")


if __name__ == "__main__":
    main()

