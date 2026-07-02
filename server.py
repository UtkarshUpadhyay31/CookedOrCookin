import cv2
import time
import os
import glob
import base64
import json
import asyncio
import threading
import shutil
import matplotlib
# Use non-interactive backend for matplotlib to prevent GUI thread conflicts
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from core.face_detector import FaceDetector
from core.landmark_detector import LandmarkDetector

from analytics.blink import BlinkDetector
from analytics.head_pose import HeadPoseEstimator
from analytics.eye_contact import EyeContactAnalyzer
from analytics.stability import StabilityAnalyzer
from analytics.attention import AttentionAnalyzer

# Report Generator Import
from reports.report_generator import ReportGenerator

# Starlette Imports
from starlette.applications import Starlette
from starlette.routing import Route, WebSocketRoute
from starlette.responses import JSONResponse, FileResponse
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

# Initialize Models
face_detector = FaceDetector("assets/face_detection_yunet_2023mar.onnx")
landmark_detector = LandmarkDetector()
blink_detector = BlinkDetector()
head_pose = HeadPoseEstimator()
eye_contact = EyeContactAnalyzer()
stability_analyzer = StabilityAnalyzer()
attention_analyzer = AttentionAnalyzer()
report_generator = ReportGenerator()

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]
NOSE_TIP = 1

# Multi-tab camera locking safeguards
is_camera_in_use = False
camera_use_lock = threading.Lock()

# Ensure reports directory exists
os.makedirs("reports", exist_ok=True)

class SessionTracker:
    def __init__(self):
        self.history = []
        
    def update(self, score):
        self.history.append(score)
        
    def get_data(self):
        return self.history

class InterviewSession:
    def __init__(self, ws_send_queue, loop):
        self.ws_send_queue = ws_send_queue
        self.loop = loop
        self.stop_event = threading.Event()
        self.thread = None
        self.cap = None
        
        # History
        self.eye_history = []
        self.stability_history = []
        self.attention_history = []
        self.readiness_history = []
        self.tracker = SessionTracker()
        
        # Metrics
        self.face_missing_start = None
        self.total_frames = 0
        self.visible_face_frames = 0
        self.multiple_face_events = 0
        self.multiple_face_active = False
        self.session_auto_ended = False
        self.start_time = None
        self.finalized = False
        
    def start(self):
        global is_camera_in_use
        with camera_use_lock:
            if is_camera_in_use:
                # Camera is occupied by another session/tab
                self._send_to_frontend({
                    "type": "error",
                    "message": "Webcam is already in use by another tab. Please close other CookedOrCookin tabs and try again."
                })
                return False
            is_camera_in_use = True
            
        self.start_time = time.time()
        self.thread = threading.Thread(target=self._run_loop_wrapper, daemon=True)
        self.thread.start()
        return True
        
    def stop(self):
        self.stop_event.set()
        if self.thread:
            self.thread.join(timeout=3)
        self._finalize_session()

    def _run_loop_wrapper(self):
        try:
            self._run_loop()
        except Exception as e:
            import traceback
            print("Exception in CV loop:")
            traceback.print_exc()
            if self.cap:
                try:
                    self.cap.release()
                except Exception:
                    pass
            self._send_to_frontend({
                "type": "error",
                "message": f"CV Engine Error: {str(e)}"
            })

    def _run_loop(self):
        # 1. Attempt to open webcam with DirectShow (Index 0)
        self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        
        # Fallback to index 0 default backend
        if not self.cap.isOpened():
            print("[CAMERA] Failed to open index 0 with CAP_DSHOW, trying default backend...")
            if self.cap: self.cap.release()
            self.cap = cv2.VideoCapture(0)
            
        # Fallback to index 1 with DirectShow (USB camera/Secondary device)
        if not self.cap.isOpened():
            print("[CAMERA] Failed to open index 0, trying index 1 with CAP_DSHOW...")
            if self.cap: self.cap.release()
            self.cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
            
        # Fallback to index 1 default backend
        if not self.cap.isOpened():
            print("[CAMERA] Failed to open index 1 with CAP_DSHOW, trying default backend...")
            if self.cap: self.cap.release()
            self.cap = cv2.VideoCapture(1)
            
        # If all indexes fail, notify user and abort
        if not self.cap.isOpened():
            self._send_to_frontend({
                "type": "error",
                "message": "Webcam not found or occupied. Make sure no other apps (like Zoom, Teams, or legacy app.py) are using it."
            })
            return
            
        try:
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        except Exception as e:
            print(f"[CAMERA] Warning: Failed to set camera resolution: {e}")
        
        # 2. Camera warm-up loop
        warmed_up = False
        for i in range(10):
            ret, frame = self.cap.read()
            if ret:
                warmed_up = True
                break
            print(f"[CAMERA] Warming up sensor, attempt {i+1}...")
            time.sleep(0.1)
            
        if not warmed_up:
            self._send_to_frontend({
                "type": "error",
                "message": "Webcam was opened, but failed to return video frames (sensor warm-up timeout)."
            })
            if self.cap:
                self.cap.release()
            return
            
        prev_time = time.time()
        
        while not self.stop_event.is_set():
            ret, frame = self.cap.read()
            if not ret:
                self._send_to_frontend({
                    "type": "warning",
                    "message": "Camera Lost"
                })
                time.sleep(0.5)
                continue
                
            frame = cv2.flip(frame, 1)
            h, w, _ = frame.shape
            
            # YuNet face detector sweep
            faces = face_detector.detect(frame)
            face_count = 0
            if faces is not None:
                face_count = len(faces)
                
            # MediaPipe FaceMesh processing run early
            results = landmark_detector.detect(frame)
            mp_face_count = len(results.multi_face_landmarks) if results.multi_face_landmarks else 0
            
            # Align face counts / Resolve False Negatives:
            # If MediaPipe detects exactly 1 face but YuNet returns 0, trust MediaPipe and set count to 1.
            # If YuNet detected multiple faces, preserve that count to ensure security flags are raised.
            if mp_face_count == 1 and face_count == 0:
                face_count = 1
                
            self.total_frames += 1
            if face_count == 1:
                self.visible_face_frames += 1
                
            # Warnings / Status List
            warnings = []
            status_indicators = {
                "looking_away": False,
                "focused": False,
                "blinking": False,
                "multiple_faces": False,
                "no_face": False,
                "session_valid": True
            }
            
            # Multiple Face Detection
            if face_count > 1:
                if not self.multiple_face_active:
                    self.multiple_face_events += 1
                    self.multiple_face_active = True
                warnings.append("Multiple Faces Detected")
                status_indicators["multiple_faces"] = True
                
                # Draw Red Box on Frame
                cv2.putText(
                    frame, "MULTIPLE FACES DETECTED", (250, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3
                )
            else:
                self.multiple_face_active = False
                
            # No Face Detection
            if face_count == 0:
                if self.face_missing_start is None:
                    self.face_missing_start = time.time()
                    
                warnings.append("No Face Detected")
                status_indicators["no_face"] = True
                
                cv2.putText(
                    frame, "NO FACE DETECTED", (320, 130),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3
                )
                
                # Auto Terminate check
                elapsed_missing = time.time() - self.face_missing_start
                if elapsed_missing > 10:
                    self.session_auto_ended = True
                    self.stop_event.set()
                    self._send_to_frontend({
                        "type": "auto_terminate",
                        "reason": "No face detected for more than 10 seconds."
                    })
                    break
            else:
                self.face_missing_start = None
                
            # Presence & Integrity live calculation (Calculated early for readiness caps)
            presence_live = (self.visible_face_frames / max(self.total_frames, 1)) * 100
            integrity_live = max(0, 100 - (self.multiple_face_events * 5))
            if presence_live < 90:
                integrity_live = max(0, integrity_live - 20)
                
            status_indicators["session_valid"] = (integrity_live >= 70 and self.multiple_face_events <= 5)
            
            # Default values if no landmarks or face_count != 1
            blink_count = blink_detector.blink_count
            ear = 0.0
            pitch, yaw, roll = 0.0, 0.0, 0.0
            direction = "CENTER"
            eye_score = 0.0 if face_count != 1 else 100.0
            looking = True
            stability_score = 0.0 if face_count != 1 else 100.0
            attention_score = 0.0 if face_count != 1 else 100.0
            readiness_score = 0.0 if face_count != 1 else 100.0
            verdict = "COOKED" if face_count != 1 else "GOOD"
            
            if results.multi_face_landmarks and face_count == 1:
                for face_landmarks in results.multi_face_landmarks:
                    left_eye = []
                    right_eye = []
                    
                    for idx in LEFT_EYE:
                        lm = face_landmarks.landmark[idx]
                        left_eye.append((int(lm.x * w), int(lm.y * h)))
                        
                    for idx in RIGHT_EYE:
                        lm = face_landmarks.landmark[idx]
                        right_eye.append((int(lm.x * w), int(lm.y * h)))
                        
                    # Blink Detection
                    ear, blink_count = blink_detector.update(left_eye, right_eye)
                    if blink_detector.eye_closed:
                        status_indicators["blinking"] = True
                        
                    # Head Pose
                    pitch, yaw, roll = head_pose.estimate(face_landmarks, w, h)
                    
                    # Direction Logic
                    direction = "CENTER"
                    if yaw < -10:
                        direction = "LEFT"
                    elif yaw > 10:
                        direction = "RIGHT"
                    elif pitch > 10:
                        direction = "DOWN"
                    elif pitch < -10:
                        direction = "UP"
                    
                    # Eye Contact
                    eye_score, looking = eye_contact.update(yaw, pitch)
                    
                    if not looking:
                        warnings.append("Looking Away")
                        status_indicators["looking_away"] = True
                    else:
                        status_indicators["focused"] = True
                        
                    # Stability & Attention
                    nose_lm = face_landmarks.landmark[NOSE_TIP]
                    nose_point = (int(nose_lm.x * w), int(nose_lm.y * h))
                    
                    stability_score = stability_analyzer.update(nose_point)
                    attention_score = attention_analyzer.update(direction)
                    
                    # Readiness Score capped dynamically by current Integrity
                    raw_readiness = (eye_score + stability_score + attention_score) / 3.0
                    readiness_score = min(raw_readiness, integrity_live)
                    
                    # Update histories
                    self.eye_history.append(eye_score)
                    self.stability_history.append(stability_score)
                    self.attention_history.append(attention_score)
                    self.readiness_history.append(readiness_score)
                    self.tracker.update(readiness_score)
                    
                    # Visual feedback bounding box
                    faces_array = faces[0][:4].astype(int) if faces is not None and len(faces) > 0 else [0, 0, 0, 0]
                    if sum(faces_array) > 0:
                        fx, fy, fw, fh = faces_array
                        cv2.rectangle(frame, (fx, fy), (fx + fw, fy + fh), (0, 255, 0), 2)
                    
                    # Draw eye landmarks
                    for pt in left_eye + right_eye:
                        cv2.circle(frame, pt, 1, (255, 255, 255), -1)
                        
                    # Readiness score on screen
                    cv2.putText(frame, f"Readiness: {int(readiness_score)}%", (20, 480), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    
                    # Verdict text overlays
                    if readiness_score >= 85:
                        verdict = "COOKIN"
                        v_color = (0, 255, 163) # Emerald
                    elif readiness_score >= 70:
                        verdict = "GOOD"
                        v_color = (255, 212, 0) # Blue-Cyan
                    elif readiness_score >= 50:
                        verdict = "NEEDS PRACTICE"
                        v_color = (87, 200, 255) # Yellow-Orange
                    else:
                        verdict = "COOKED"
                        v_color = (109, 77, 255) # Red-Rose
                        
                    cv2.putText(frame, verdict, (20, 520), cv2.FONT_HERSHEY_SIMPLEX, 1.2, v_color, 3)

            # FPS
            current_time = time.time()
            fps = 1 / (current_time - prev_time) if (current_time - prev_time) > 0 else 30
            prev_time = current_time
            cv2.putText(frame, f"FPS: {int(fps)}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            
            # Session Timer
            elapsed = int(time.time() - self.start_time)
            minutes = elapsed // 60
            seconds = elapsed % 60
            time_str = f"{minutes:02}:{seconds:02}"
            cv2.putText(frame, f"Session: {time_str}", (900, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
            
            # Debug console output logging
            no_face_timer = round(time.time() - self.face_missing_start, 1) if self.face_missing_start else 0.0
            print(f"[DEBUG] FaceCount: {face_count} | Presence: {round(presence_live, 1)}% | "
                  f"Integrity: {round(integrity_live, 1)} | Readiness: {round(readiness_score, 1)}% | "
                  f"Status: {'VALID' if status_indicators['session_valid'] else 'INVALID'} | "
                  f"Visible: {face_count == 1} | Multiple: {status_indicators['multiple_faces']} | "
                  f"NoFaceTimer: {no_face_timer}s")

            # Send frame to frontend
            _, buffer = cv2.imencode('.jpg', frame)
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            payload = {
                "type": "live_data",
                "frame": f"data:image/jpeg;base64,{frame_base64}",
                "metrics": {
                    "fps": int(fps),
                    "session_time": time_str,
                    "face_count": face_count,
                    "presence": round(presence_live, 1),
                    "integrity": round(integrity_live, 1),
                    "blink_count": blink_count,
                    "ear": round(ear, 2),
                    "yaw": round(yaw, 1),
                    "pitch": round(pitch, 1),
                    "roll": round(roll, 1),
                    "direction": direction,
                    "eye_score": round(eye_score, 1),
                    "looking": looking,
                    "stability_score": round(stability_score, 1),
                    "attention_score": round(attention_score, 1),
                    "readiness_score": round(readiness_score, 1),
                    "verdict": verdict
                },
                "warnings": warnings,
                "status_indicators": status_indicators
            }
            
            self._send_to_frontend(payload)
            time.sleep(0.04) # cap frame rate at ~25 FPS to save bandwidth/processing
            
        # Cleanup webcam
        if self.cap:
            self.cap.release()
            
        self._finalize_session()

    def _send_to_frontend(self, data):
        self.loop.call_soon_threadsafe(self.ws_send_queue.put_nowait, json.dumps(data))

    def _finalize_session(self):
        global is_camera_in_use
        if self.finalized:
            return
        self.finalized = True
        
        with camera_use_lock:
            is_camera_in_use = False
        
        if len(self.readiness_history) == 0:
            self._send_to_frontend({
                "type": "error",
                "message": "No face data recorded. Session discarded."
            })
            return
            
        presence_score = (self.visible_face_frames / max(self.total_frames, 1)) * 100
        integrity_score = max(0, 100 - (self.multiple_face_events * 5))
        if presence_score < 90:
            integrity_score = max(0, integrity_score - 20)
            
        session_status = "VALID"
        if integrity_score < 70 or self.multiple_face_events > 5:
            session_status = "INVALID"
            
        avg_readiness = sum(self.readiness_history) / len(self.readiness_history)
        avg_eye = sum(self.eye_history) / len(self.eye_history)
        avg_stability = sum(self.stability_history) / len(self.stability_history)
        avg_attention = sum(self.attention_history) / len(self.attention_history)
        
        # Generate plot
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        graph_filename = f"readiness_graph_{timestamp}.png"
        scores = self.tracker.get_data()
        
        plt.figure(figsize=(10, 5))
        plt.plot(scores, color='purple', linewidth=2)
        plt.title("Interview Readiness Over Time")
        plt.xlabel("Frame")
        plt.ylabel("Readiness Score")
        plt.grid(True)
        plt.savefig(graph_filename)
        plt.close()
        
        # Generate PDF report (written to CookedOrCookin_Report.pdf)
        report_generator.generate(
            avg_readiness,
            avg_eye,
            avg_stability,
            avg_attention,
            presence_score,
            integrity_score,
            self.multiple_face_events,
            session_status,
            self.session_auto_ended,
            graph_filename
        )
        
        # Copy file to historic reports list with timestamp
        pdf_report_name = f"Report_{timestamp}.pdf"
        pdf_dest_path = os.path.join("reports", pdf_report_name)
        if os.path.exists("CookedOrCookin_Report.pdf"):
            shutil.copy("CookedOrCookin_Report.pdf", pdf_dest_path)
            
        # Clean up temporary graph image
        if os.path.exists(graph_filename):
            try:
                os.remove(graph_filename)
            except Exception:
                pass
                
        # Strengths & Weaknesses
        strengths = []
        weaknesses = []
        if avg_eye >= 80:
            strengths.append("Excellent, consistent eye contact.")
        else:
            weaknesses.append("Frequently looked away from screen.")
            
        if avg_stability >= 80:
            strengths.append("Maintained exceptional head stability.")
        else:
            weaknesses.append("High degree of head movement/instability.")
            
        if avg_attention >= 80:
            strengths.append("Kept attention focused on the interview area.")
        else:
            weaknesses.append("Attention scores drop repeatedly due to distractions.")
            
        if integrity_score >= 90:
            strengths.append("Perfect session integrity score.")
        else:
            weaknesses.append("Session flagged for potential environment issues.")
            
        final_verdict = "NEEDS PRACTICE"
        if avg_readiness >= 85:
            final_verdict = "COOKIN"
        elif avg_readiness >= 70:
            final_verdict = "GOOD"
        elif avg_readiness >= 50:
            final_verdict = "NEEDS PRACTICE"
        else:
            final_verdict = "COOKED"
            
        final_results = {
            "type": "session_summary",
            "pdf_report": pdf_report_name,
            "readiness": round(avg_readiness, 1),
            "eye_contact": round(avg_eye, 1),
            "stability": round(avg_stability, 1),
            "attention": round(avg_attention, 1),
            "presence": round(presence_score, 1),
            "integrity": round(integrity_score, 1),
            "face_events": self.multiple_face_events,
            "session_status": session_status,
            "auto_ended": self.session_auto_ended,
            "verdict": final_verdict,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "duration": int(time.time() - self.start_time)
        }
        
        self._send_to_frontend(final_results)

# WebSocket endpoint
async def websocket_endpoint(websocket):
    active_session = None
    await websocket.accept()
    
    ws_send_queue = asyncio.Queue()
    loop = asyncio.get_running_loop()
    
    # Task to read queue and write to ws
    async def writer():
        try:
            while True:
                msg = await ws_send_queue.get()
                await websocket.send_text(msg)
                ws_send_queue.task_done()
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print("WS Writer Exception:", e)
            
    writer_task = asyncio.create_task(writer())
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            cmd_type = payload.get("type")
            
            if cmd_type == "start":
                if active_session:
                    active_session.stop()
                active_session = InterviewSession(ws_send_queue, loop)
                started = active_session.start()
                if started:
                    await ws_send_queue.put(json.dumps({"type": "session_state", "state": "active"}))
                else:
                    active_session = None
                
            elif cmd_type == "stop":
                if active_session:
                    active_session.stop()
                    active_session = None
                await ws_send_queue.put(json.dumps({"type": "session_state", "state": "ended"}))
                
    except Exception as e:
        print("WS Exception:", e)
    finally:
        writer_task.cancel()
        if active_session:
            active_session.stop()
            active_session = None
        try:
            await websocket.close()
        except Exception:
            pass

# Routes for API
async def list_reports(request):
    pdf_files = glob.glob(os.path.join("reports", "Report_*.pdf"))
    reports = []
    for filepath in pdf_files:
        filename = os.path.basename(filepath)
        stat = os.stat(filepath)
        mtime = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime))
        reports.append({
            "filename": filename,
            "size": stat.st_size,
            "created_at": mtime
        })
    # Sort by created time descending
    reports.sort(key=lambda x: x["created_at"], reverse=True)
    return JSONResponse(reports)

async def download_report(request):
    filename = request.path_params.get("filename")
    filepath = os.path.join("reports", filename)
    if os.path.exists(filepath) and filename.endswith(".pdf"):
        return FileResponse(filepath, media_type='application/pdf', filename=filename)
    return JSONResponse({"error": "File not found"}, status_code=404)

async def get_latest_pdf(request):
    filepath = "CookedOrCookin_Report.pdf"
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type='application/pdf', filename="CookedOrCookin_Report.pdf")
    return JSONResponse({"error": "No report generated yet"}, status_code=404)

# Starlette WebApp Setup
middleware = [
    Middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])
]

routes = [
    Route("/api/reports", list_reports, methods=["GET"]),
    Route("/api/reports/download/{filename}", download_report, methods=["GET"]),
    Route("/api/reports/latest", get_latest_pdf, methods=["GET"]),
    WebSocketRoute("/ws", websocket_endpoint)
]

app = Starlette(routes=routes, middleware=middleware)

# Serve React static assets in production if built
if os.path.exists(os.path.join("frontend", "dist")):
    app.mount("/", StaticFiles(directory=os.path.join("frontend", "dist"), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    # Listen on localhost port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)