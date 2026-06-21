import math


class BlinkDetector:

    def __init__(self):

        self.blink_count = 0
        self.eye_closed = False

        self.EAR_THRESHOLD = 0.22

    def distance(self, p1, p2):

        return math.sqrt(
            (p1[0] - p2[0]) ** 2 +
            (p1[1] - p2[1]) ** 2
        )

    def calculate_ear(self, eye):

        vertical1 = self.distance(eye[1], eye[5])
        vertical2 = self.distance(eye[2], eye[4])

        horizontal = self.distance(eye[0], eye[3])

        return (vertical1 + vertical2) / (2 * horizontal)

    def update(self, left_eye, right_eye):

        left_ear = self.calculate_ear(left_eye)

        right_ear = self.calculate_ear(right_eye)

        ear = (left_ear + right_ear) / 2

        if ear < self.EAR_THRESHOLD:

            if not self.eye_closed:

                self.blink_count += 1
                self.eye_closed = True

        else:

            self.eye_closed = False

        return ear, self.blink_count