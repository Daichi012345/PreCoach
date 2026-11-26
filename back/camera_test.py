import cv2
import mediapipe as mp
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from pathlib import Path
from collections import Counter
from time import perf_counter
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


# このPythonファイルと同じフォルダにあるモデルを読み込む
BASE_DIR = Path(__file__).resolve().parent
FACE_MODEL = BASE_DIR / "face_landmarker.task"
POSE_MODEL = BASE_DIR / "pose_landmarker_lite.task"



# OpenCV標準フォントは日本語に対応していないため、Pillowで日本語を描画する
TEXT_ITEMS = []

def queue_text(frame, text, org, font_face, font_scale, color, thickness):
    """画面に表示する文字を記録し、フレーム末尾でまとめて描画する。"""
    TEXT_ITEMS.append((str(text), org, font_scale, color, thickness))


def draw_queued_text(frame):
    """記録した文字を日本語対応フォントでまとめて描画する。"""
    image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(image)

    font_path_candidates = [
        "C:/Windows/Fonts/meiryo.ttc",
        "C:/Windows/Fonts/YuGothM.ttc",
        "C:/Windows/Fonts/msgothic.ttc",
    ]
    font_path = next((p for p in font_path_candidates if Path(p).exists()), None)

    for text, org, font_scale, color, thickness in TEXT_ITEMS:
        font_size = max(14, int(font_scale * 30))
        try:
            font = ImageFont.truetype(font_path, font_size) if font_path else ImageFont.load_default()
        except OSError:
            font = ImageFont.load_default()

        x, y = org
        # OpenCVはBGR、PillowはRGB
        rgb_color = (color[2], color[1], color[0])
        draw.text((x, y), text, font=font, fill=rgb_color, stroke_width=max(0, thickness - 1))

    TEXT_ITEMS.clear()
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)


def estimate_face_direction(face_landmarks):
    """
    顔の特徴点から顔の向きを簡易判定する。
    戻り値：正面／左／右／判定不能
    """

    nose = face_landmarks[1]
    left_side = face_landmarks[234]
    right_side = face_landmarks[454]

    face_width = right_side.x - left_side.x

    if abs(face_width) < 0.0001:
        return "判定不能"

    face_center_x = (left_side.x + right_side.x) / 2
    nose_offset = (nose.x - face_center_x) / face_width

    if nose_offset < -0.08:
        return "左"
    elif nose_offset > 0.08:
        return "右"
    else:
        return "正面"


def estimate_face_angles(face_landmarks, image_width, image_height):
    """
    顔の特徴点から頭部の回転角度を推定する。
    戻り値: yaw / pitch / roll（度数法）

    注意:
    3D顔モデルを使った概算値。
    カメラ条件や個人差による誤差がある。
    """

    landmark_indices = [1, 152, 33, 263, 61, 291]

    image_points = np.array(
        [
            [
                face_landmarks[index].x * image_width,
                face_landmarks[index].y * image_height
            ]
            for index in landmark_indices
        ],
        dtype=np.float64
    )

    # 3D顔モデル上の対応点（概算）
    model_points = np.array(
        [
            (0.0, 0.0, 0.0),          # 鼻先
            (0.0, -63.6, -12.5),      # あご
            (-43.3, 32.7, -26.0),     # 目の外側
            (43.3, 32.7, -26.0),
            (-28.9, -28.9, -24.1),    # 口の端
            (28.9, -28.9, -24.1)
        ],
        dtype=np.float64
    )

    focal_length = image_width
    center = (image_width / 2, image_height / 2)

    camera_matrix = np.array(
        [
            [focal_length, 0, center[0]],
            [0, focal_length, center[1]],
            [0, 0, 1]
        ],
        dtype=np.float64
    )

    distortion_coefficients = np.zeros((4, 1), dtype=np.float64)

    success, rotation_vector, _ = cv2.solvePnP(
        model_points,
        image_points,
        camera_matrix,
        distortion_coefficients,
        flags=cv2.SOLVEPNP_ITERATIVE
    )

    if not success:
        return None

    rotation_matrix, _ = cv2.Rodrigues(rotation_vector)

    angles = cv2.RQDecomp3x3(rotation_matrix)[0]

    pitch, yaw, roll = angles

    return {
        "yaw": float(yaw),
        "pitch": float(pitch),
        "roll": float(roll)
    }


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
        num_faces=1,
        output_face_blendshapes=True
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
        vision.FaceLandmarker.create_from_options(face_options)
        as face_detector,
        vision.PoseLandmarker.create_from_options(pose_options)
        as pose_detector
    ):

        # PCのカメラを起動
        cap = cv2.VideoCapture(0)

        if not cap.isOpened():
            print("カメラを起動できませんでした。")
            return

        direction_counts = Counter()
        not_detected_count = 0

        frame_count = 0
        start_time = perf_counter()

        # 表情特徴量を画面に表示する対象
        blendshape_labels = {
            "jawOpen": "口の開き",
            "mouthSmileLeft": "左口角の笑顔度",
            "mouthSmileRight": "右口角の笑顔度",
            "eyeBlinkLeft": "左目の閉じ具合",
            "eyeBlinkRight": "右目の閉じ具合",
            "browInnerUp": "眉の上がり具合",
        }

        target_blendshapes = {
            "jawOpen",
            "mouthSmileLeft",
            "mouthSmileRight",
            "eyeBlinkLeft",
            "eyeBlinkRight",
            "browInnerUp"
        }

        print("カメラを起動しました。")
        print("顔の向き・角度・表情を分析中です。")
        print("終了するには q キーを押してください。")

        while True:

            success, frame = cap.read()

            if not success:
                print("カメラ映像を取得できませんでした。")
                break

            TEXT_ITEMS.clear()
            height, width = frame.shape[:2]

            # BGRからRGBへ変換
            rgb_frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )

            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb_frame
            )

            # VIDEOモード用タイムスタンプ
            timestamp_ms = int(
                perf_counter() * 1000
            )

            # 顔を検出
            face_result = face_detector.detect_for_video(
                mp_image,
                timestamp_ms
            )

            # 姿勢を検出
            pose_result = pose_detector.detect_for_video(
                mp_image,
                timestamp_ms
            )

            # =========================
            # 顔の分析
            # =========================
            if face_result.face_landmarks:

                face_landmarks = face_result.face_landmarks[0]

                # 顔の特徴点を描画
                for point in face_landmarks:
                    x = int(point.x * width)
                    y = int(point.y * height)

                    cv2.circle(
                        frame,
                        (x, y),
                        1,
                        (0, 255, 0),
                        -1
                    )

                # 顔の向き
                direction = estimate_face_direction(
                    face_landmarks
                )

                direction_counts[direction] += 1

                queue_text(
                    frame,
                    f"顔の向き：{direction}",
                    (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2
                )

                # 顔の角度
                angles = estimate_face_angles(
                    face_landmarks,
                    width,
                    height
                )

                if angles is not None:

                    queue_text(
                        frame,
                        f"左右の向き（Yaw）：{angles['yaw']:.1f}°",
                        (20, 70),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 255, 255),
                        2
                    )

                    queue_text(
                        frame,
                        f"上下の向き（Pitch）：{angles['pitch']:.1f}°",
                        (20, 95),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 255, 255),
                        2
                    )

                    queue_text(
                        frame,
                        f"傾き（Roll）：{angles['roll']:.1f}°",
                        (20, 120),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 255, 255),
                        2
                    )

                # 表情特徴量
                if face_result.face_blendshapes:

                    blendshapes = face_result.face_blendshapes[0]

                    values = {
                        category.category_name: category.score
                        for category in blendshapes
                    }

                    y_position = 150

                    for name in sorted(target_blendshapes):

                        if name not in values:
                            continue

                        score = values[name]

                        queue_text(
                            frame,
                            f"{blendshape_labels.get(name, name)}：{score:.2f}",
                            (20, y_position),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.45,
                            (255, 255, 0),
                            1
                        )

                        y_position += 22

            else:

                not_detected_count += 1

                queue_text(
                    frame,
                    "顔を検出できません",
                    (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 0, 255),
                    2
                )

            # =========================
            # 姿勢の検出結果
            # =========================
            if pose_result.pose_landmarks:

                pose_landmarks = pose_result.pose_landmarks[0]

                # 肩・肘・手首・腰
                for index in [11, 12, 13, 14, 15, 16, 23, 24]:

                    point = pose_landmarks[index]

                    x = int(point.x * width)
                    y = int(point.y * height)

                    cv2.circle(
                        frame,
                        (x, y),
                        5,
                        (255, 0, 0),
                        -1
                    )

                queue_text(
                    frame,
                    "姿勢を検出中",
                    (20, height - 20),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.6,
                    (255, 0, 0),
                    2
                )

            # 日本語の文字をまとめて描画してから表示
            frame = draw_queued_text(frame)

            # カメラ映像を表示
            cv2.imshow(
                "PreCoach - カメラ分析",
                frame
            )

            frame_count += 1

            # qキーで終了
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        # =========================
        # 終了処理
        # =========================
        elapsed_time = perf_counter() - start_time

        cap.release()
        cv2.destroyAllWindows()

        # =========================
        # 分析結果
        # =========================
        print("\n========== 顔の分析結果 ==========\n")
        print(f"分析時間：約{elapsed_time:.1f}秒")
        print(f"処理フレーム数：{frame_count}")

        detected_count = sum(direction_counts.values())

        if detected_count > 0:

            print("\n【顔の向きの割合】")

            for direction, label in [
                ("正面", "正面"),
                ("左", "左"),
                ("右", "右"),
                ("判定不能", "判定不能")
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

        print("\n==================================")

if __name__ == "__main__":
    main()

