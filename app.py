import cv2
import time
import matplotlib.pyplot as plt

from core.face_detector import FaceDetector
from core.landmark_detector import LandmarkDetector

from analytics.blink import BlinkDetector
from analytics.head_pose import HeadPoseEstimator
from analytics.eye_contact import EyeContactAnalyzer
from analytics.stability import StabilityAnalyzer
from analytics.attention import AttentionAnalyzer

# Report Generator Import Kiya
from reports.report_generator import ReportGenerator

# =====================================
# Session Tracker Class
# =====================================
class SessionTracker:
    def __init__(self):
        self.history = []
        
    def update(self, score):
        self.history.append(score)
        
    def get_data(self):
        return self.history


# =====================================
# Landmark IDs
# =====================================

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]

NOSE_TIP = 1


# =====================================
# Models & Generators
# =====================================

face_detector = FaceDetector(
    "assets/face_detection_yunet_2023mar.onnx"
)

landmark_detector = LandmarkDetector()

blink_detector = BlinkDetector()

head_pose = HeadPoseEstimator()

eye_contact = EyeContactAnalyzer()

stability_analyzer = StabilityAnalyzer()
attention_analyzer = AttentionAnalyzer()

# Report Generator Initialize Kiya
report = ReportGenerator()

# Session History Lists
eye_history = []
stability_history = []
attention_history = []
readiness_history = []

# Tracker Initialize Kiya
tracker = SessionTracker()


# =====================================
# Webcam
# =====================================

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

# Better FPS
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

prev_time = time.time()
session_start = time.time()

# ==========================
# Integrity Tracking
# ==========================

face_missing_start = None

total_frames = 0
visible_face_frames = 0

multiple_face_events = 0
multiple_face_active = False

session_auto_ended = False


# =====================================
# Main Loop
# =====================================

while True:

    ret, frame = cap.read()

    if not ret:
        break

    frame = cv2.flip(frame, 1)

    # =====================================
    # Face Detection
    # =====================================

    faces = face_detector.detect(frame)

    face_count = 0

    if faces is not None:
        face_count = len(faces)

    # ==========================
    # Presence Tracking
    # ==========================

    total_frames += 1

    if face_count == 1:
        visible_face_frames += 1

    # ==========================
    # Multiple Face Detection
    # ==========================

    if face_count > 1:

        if not multiple_face_active:
            multiple_face_events += 1
            multiple_face_active = True

        cv2.putText(
            frame,
            "MULTIPLE FACES DETECTED",
            (250, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            3
        )

    else:
        multiple_face_active = False

    # ==========================
    # No Face Detection
    # ==========================

    if face_count == 0:

        if face_missing_start is None:
            face_missing_start = time.time()

        cv2.putText(
            frame,
            "NO FACE DETECTED",
            (320, 130),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            3
        )

        if time.time() - face_missing_start > 10:

            session_auto_ended = True

            print("Session Auto Ended")

            break

    else:

        face_missing_start = None


    if faces is not None:

        for face in faces:

            x, y, w_box, h_box = face[:4].astype(int)

            cv2.rectangle(
                frame,
                (x, y),
                (x + w_box, y + h_box),
                (0, 255, 0),
                2
            )

    # =====================================
    # Face Mesh
    # =====================================

    results = landmark_detector.detect(frame)

    if (
        results.multi_face_landmarks
        and face_count == 1
    ):

        for face_landmarks in results.multi_face_landmarks:

            h, w, _ = frame.shape

            left_eye = []
            right_eye = []

            # --------------------------
            # Left Eye
            # --------------------------

            for idx in LEFT_EYE:

                lm = face_landmarks.landmark[idx]

                left_eye.append(
                    (
                        int(lm.x * w),
                        int(lm.y * h)
                    )
                )

            # --------------------------
            # Right Eye
            # --------------------------

            for idx in RIGHT_EYE:

                lm = face_landmarks.landmark[idx]

                right_eye.append(
                    (
                        int(lm.x * w),
                        int(lm.y * h)
                    )
                )

            # --------------------------
            # Blink Detection
            # --------------------------

            ear, blink_count = blink_detector.update(
                left_eye,
                right_eye
            )

            # --------------------------
            # Head Pose
            # --------------------------

            pitch, yaw, roll = head_pose.estimate(
                face_landmarks,
                w,
                h
            )

            # --------------------------
            # Direction Logic
            # --------------------------

            direction = "CENTER"

            if yaw < -10:
                direction = "LEFT"

            elif yaw > 10:
                direction = "RIGHT"

            elif pitch > 10:
                direction = "DOWN"

            elif pitch < -10:
                direction = "UP"

            # --------------------------
            # Eye Contact
            # --------------------------

            eye_score, looking = eye_contact.update(
                yaw,
                pitch
            )

            # --------------------------
            # Attention
            # --------------------------

            attention_score = attention_analyzer.update(direction)

            status = "LOOKING"

            if not looking:
                status = "AWAY"

            # --------------------------
            # Stability
            # --------------------------

            nose_lm = face_landmarks.landmark[NOSE_TIP]

            nose_point = (
                int(nose_lm.x * w),
                int(nose_lm.y * h)
            )

            stability_score = stability_analyzer.update(
                nose_point
            )
            
            # --------------------------
            # Readiness Score
            # --------------------------

            blink_score = min(
                blink_count * 2,
                100
            )

            # Calculate readiness score
            readiness_score = (attention_score + eye_score + stability_score) / 3.0

            # Tracker update
            tracker.update(readiness_score)

            # Save metrics to history lists
            eye_history.append(eye_score)
            stability_history.append(stability_score)
            attention_history.append(attention_score)
            readiness_history.append(readiness_score)

            if readiness_score >= 85:
                verdict = "COOKIN"
                verdict_color = (0, 255, 0)

            elif readiness_score >= 70:  
                verdict = "GOOD"
                verdict_color = (0, 255, 255)

            elif readiness_score >= 50:
                verdict = "NEEDS PRACTICE"
                verdict_color = (0, 165, 255)
                
            else:
                verdict = "COOKED"
                verdict_color = (0, 0, 255)
                
            # --------------------------
            # Draw Eye Points
            # --------------------------

            for point in left_eye:

                cv2.circle(
                    frame,
                    point,
                    2,
                    (0, 255, 0),
                    -1
                )

            for point in right_eye:

                cv2.circle(
                    frame,
                    point,
                    2,
                    (0, 255, 0),
                    -1
                )

            # --------------------------
            # Metrics
            # --------------------------

            cv2.putText(
                frame,
                f"EAR: {ear:.2f}",
                (20, 80),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

            cv2.putText(
                frame,
                f"Blinks: {blink_count}",
                (20, 120),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Yaw: {yaw:.1f}",
                (20, 160),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

            cv2.putText(
                frame,
                f"Pitch: {pitch:.1f}",
                (20, 200),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

            cv2.putText(
                frame,
                f"Roll: {roll:.1f}",
                (20, 240),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

            cv2.putText(
                frame,
                f"Looking: {direction}",
                (20, 280),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 255),
                2
            )

            cv2.putText(
                frame,
                f"Eye Contact: {eye_score:.1f}%",
                (20, 320),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                status,
                (20, 360),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 255, 0),
                2
            )

            cv2.putText(
                frame,
                f"Stability: {stability_score:.1f}%",
                (20, 400),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )
            
            cv2.putText(
               frame,
               f"Attention: {attention_score:.1f}%",
               (20, 440),
               cv2.FONT_HERSHEY_SIMPLEX,
               0.7,
               (255, 255, 255),
               2
            )
            
            cv2.putText(
               frame,
               f"Readiness: {readiness_score:.1f}",
               (20, 620),
               cv2.FONT_HERSHEY_SIMPLEX,
               0.9,
               (0, 255, 0),
               2
            )
            
            cv2.putText(
                frame,
                verdict,
                (20, 520),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.2,
                verdict_color,
                3
            )
            
    # =====================================
    # FPS
    # =====================================

    current_time = time.time()

    fps = 1 / (current_time - prev_time)

    prev_time = current_time

    cv2.putText(
        frame,
        f"FPS: {int(fps)}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 255),
        2
    )

    # =====================================
    # Display & Session Timer
    # =====================================

    elapsed = int(time.time() - session_start)
    minutes = elapsed // 60
    seconds = elapsed % 60

    cv2.putText(
        frame,
        f"Session: {minutes:02}:{seconds:02}",
        (900, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 0),
        2
    )

    presence_live = (
        visible_face_frames /
        max(total_frames, 1)
    ) * 100

    integrity_live = max(
        0,
        100 - (multiple_face_events * 5)
    )

    cv2.putText(
        frame,
        f"Faces: {face_count}",
        (900, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255,255,255),
        2
    )

    cv2.putText(
        frame,
        f"Presence: {presence_live:.1f}%",
        (900,120),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255,255,255),
        2
    )

    cv2.putText(
        frame,
        f"Integrity: {integrity_live:.1f}",
        (900,160),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0,255,255),
        2
    )

    cv2.imshow(
        "CookedOrCookin - Interview Analyzer",
        frame
    )

    # =====================================
    # ESC press karne par - Loop End
    # =====================================
    if cv2.waitKey(1) & 0xFF == 27:
        break


# =====================================
# Post-Session Processing (Common Finalization Block)
# =====================================
if len(readiness_history) > 0:

    presence_score = (
        visible_face_frames /
        max(total_frames,1)
    ) * 100

    integrity_score = 100

    integrity_score -= (
        multiple_face_events * 5
    )

    if presence_score < 90:
        integrity_score -= 20

    integrity_score = max(
        0,
        integrity_score
    )

    session_status = "VALID"

    if (
        integrity_score < 70
        or
        multiple_face_events > 5
    ):
        session_status = "INVALID"

    print("\n===== SESSION SUMMARY =====")
    print(f"Avg Eye Contact: {sum(eye_history)/len(eye_history):.1f}%")
    print(f"Avg Stability: {sum(stability_history)/len(stability_history):.1f}%")
    print(f"Avg Attention: {sum(attention_history)/len(attention_history):.1f}%")
    print(f"Final Readiness: {sum(readiness_history)/len(readiness_history):.1f}")
    print(f"Presence Score: {presence_score:.1f}%")
    print(f"Multiple Face Events: {multiple_face_events}")
    print(f"Integrity Score: {integrity_score:.1f}")
    print(f"Session Status: {session_status}")
    
    # Unique filename ke liye timestamp generate kiya
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    graph_filename = f"readiness_graph_{timestamp}.png"
    
    # 1. Pehle Graph Plot aur Save hoga
    print("\nGenerating graph...")
    scores = tracker.get_data()
    plt.figure(figsize=(10, 5))
    plt.plot(scores, color='purple', linewidth=2)
    plt.title("Interview Readiness Over Time")
    plt.xlabel("Frame")
    plt.ylabel("Readiness Score")
    plt.grid(True)
    plt.savefig(graph_filename)
    print(f"Graph saved as: {graph_filename}")
    plt.show(block=False)  # Non-blocking window toggle kiya
    plt.close()            # Resource memory cleanup kiya
    
    # 2. Baad mein PDF Report Generate hogi
    print("Generating PDF report...")
    
    avg_readiness = sum(readiness_history)/len(readiness_history)
    avg_eye = sum(eye_history)/len(eye_history)
    avg_stability = sum(stability_history)/len(stability_history)
    avg_attention = sum(attention_history)/len(attention_history)
    
    report.generate(
        avg_readiness,
        avg_eye,
        avg_stability,
        avg_attention,
        presence_score,
        integrity_score,
        multiple_face_events,
        session_status,
        session_auto_ended,
        graph_filename
    )
    print("PDF Report generated successfully!")
    
else:
    print("\n===== SESSION SUMMARY =====")
    print("No face data recorded. Graph and report skipped.")


# =====================================
# Cleanup
# =====================================

cap.release()
cv2.destroyAllWindows()