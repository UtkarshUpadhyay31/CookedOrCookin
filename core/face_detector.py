import cv2


class FaceDetector:

    def __init__(self, model_path):

        self.detector = cv2.FaceDetectorYN.create(
            model_path,
            "",
            (320, 320)
        )

    def detect(self, frame):

        h, w = frame.shape[:2]

        self.detector.setInputSize((w, h))

        _, faces = self.detector.detect(frame)

        return faces

    def get_face_count(self, frame):

        faces = self.detect(frame)

        if faces is None:
            return 0

        return len(faces)