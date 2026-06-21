# 🔥 CookedOrCookin

<p align="center">
  <h3 align="center">
    Are You Ready For The Interview, Or Are You Cooked?
  </h3>
</p>

<p align="center">
  Real-Time Interview Readiness Analyzer using Computer Vision
</p>

---

## 📸 Project Preview

### Real-Time Interview Analyzer

<p align="center">
  <img src="screenshots/analyzer_dashboard.png" width="700">
</p>

The system analyzes interview behavior in real time and tracks:

- Eye Contact
- Blink Activity
- Head Pose
- Attention
- Stability
- Readiness Score

---

### Readiness Trend Graph

<p align="center">
  <img src="screenshots/readiness_graph.png" width="700">
</p>

The application records readiness throughout the interview session and visualizes performance changes over time.

---

### Automated PDF Report

<p align="center">
  <img src="screenshots/generated_report.png" width="700">
</p>

After each session, a PDF report is automatically generated containing performance statistics and analytics.

---

# 🚀 Features

## 👁️ Real-Time Face Detection

- YuNet Face Detector
- Fast CPU Inference
- Stable Webcam Tracking

---

## 🎯 Eye Contact Analysis

Measures how consistently the candidate looks toward the camera.

Metrics:

- Eye Contact %
- Looking Away Events
- Looking Status

---

## 👀 Blink Detection

EAR (Eye Aspect Ratio) based blink detection.

Metrics:

- Blink Count
- Blink Activity
- Blink Quality

---

## 🧠 Head Pose Estimation

Tracks:

- Yaw
- Pitch
- Roll

Detects:

- Looking Left
- Looking Right
- Looking Up
- Looking Down

---

## 📌 Face Stability Analysis

Tracks facial movement using nose-tip landmarks.

Metrics:

- Head Movement
- Drift Analysis
- Stability Score

---

## 🎓 Attention Analysis

Measures user engagement during the interview.

Metrics:

- Attention %
- Attention Drops
- Looking Consistency

---

## 📊 Interview Readiness Score

Combines multiple behavioral signals:

- Eye Contact
- Stability
- Attention
- Blink Behavior

to generate a real-time readiness score.

---

## ⏱ Session Tracking

Tracks:

- Session Duration
- Score History
- Average Metrics

---

## 📈 Readiness Visualization

Automatically generates:

- Readiness Trend Graph
- Session Performance Analytics

---

## 📄 Automated PDF Report

Generates a report containing:

- Session Summary
- Average Eye Contact
- Average Stability
- Average Attention
- Final Readiness Score
- Readiness Graph

---

# 🏗️ System Architecture

```text
Webcam
   ↓
OpenCV
   ↓
YuNet Face Detector
   ↓
MediaPipe Face Mesh
   ↓
Behavior Analytics Engine
   ├── Blink Detection
   ├── Eye Contact Analysis
   ├── Head Pose Estimation
   ├── Stability Analysis
   └── Attention Analysis
   ↓
Readiness Score Engine
   ↓
Session Tracker
   ↓
Graph Generator
   ↓
PDF Report Generator
```

# 🖥️ Tech Stack

### Computer Vision

- OpenCV
- MediaPipe Face Mesh
- YuNet Face Detector

### Data Processing

- NumPy
- Pandas

### Visualization

- Matplotlib

### Reporting

- ReportLab

### Language

- Python

---

# 📂 Project Structure

```text
CookedOrCookin/

│
├── app.py
│
├── analytics/
│   ├── blink.py
│   ├── eye_contact.py
│   ├── head_pose.py
│   ├── stability.py
│   ├── attention.py
│   └── session_tracker.py
│
├── core/
│   ├── face_detector.py
│   └── landmark_detector.py
│
├── reports/
│   └── report_generator.py
│
├── assets/
│   └── face_detection_yunet_2023mar.onnx
│
├── screenshots/
│   ├── analyzer_dashboard.png
│   ├── readiness_graph.png
│   └── generated_report.png
│
├── requirements.txt
│
└── README.md
```

---

# ⚡ Installation

## Clone Repository

```bash
git clone https://github.com/UtkarshUpadhyay31/CookedOrCookin.git

cd CookedOrCookin
```

## Create Virtual Environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# ▶️ Run Application

```bash
python app.py
```

Press:

```text
ESC
```

to end the session.

---

# 📊 Sample Output

```text
Eye Contact : 96.4%
Stability   : 97.8%
Attention   : 94.3%

Readiness   : 95.2

Verdict     : COOKIN
```

---

# 📈 Sample Analytics

```text
Session Duration : 05:42

Average Eye Contact : 95.4%
Average Stability   : 97.1%
Average Attention   : 93.8%

Final Readiness     : 94.7
```

---

# 🎯 Use Cases

- Mock Interviews
- Placement Preparation
- Communication Practice
- Public Speaking Training
- Behavioral Analytics Research
- Career Coaching

---

# 🏆 Highlights

✅ Real-Time Face Analytics

✅ 20+ FPS CPU Performance

✅ YuNet Face Detection

✅ MediaPipe Face Mesh

✅ Interview Readiness Scoring

✅ Session Tracking

✅ Graph Visualization

✅ Automated PDF Reports

✅ Modular Architecture

---

# 🔮 Future Improvements

- Streamlit Dashboard
- Multi-Session Analytics
- Historical Performance Tracking
- AI Feedback Assistant
- Interview Recording Support
- Web Deployment

---

# 👨‍💻 Author

### Utkarsh Upadhyay

B.Tech Information Technology  
Rajkiya Engineering College, Azamgarh

### Connect

- GitHub: https://github.com/UtkarshUpadhyay31
- LinkedIn: https://www.linkedin.com/in/utkarshupadhyay31/

---

## ⭐ If you found this project useful, consider giving it a star.