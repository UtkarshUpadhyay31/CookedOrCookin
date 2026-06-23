class SessionTracker:

    def __init__(self):

        self.readiness = []

        self.total_frames = 0
        self.visible_face_frames = 0

        self.multiple_face_events = 0

    def update(self, score):

        self.readiness.append(score)

    def update_presence(self, face_count):

        self.total_frames += 1

        if face_count == 1:
            self.visible_face_frames += 1

        if face_count > 1:
            self.multiple_face_events += 1

    def get_presence_score(self):

        if self.total_frames == 0:
            return 0

        return (
            self.visible_face_frames /
            self.total_frames
        ) * 100

    def get_integrity_score(self):

        score = 100

        score -= (
            self.multiple_face_events * 5
        )

        if self.get_presence_score() < 90:
            score -= 20

        return max(0, score)

    def get_data(self):

        return self.readiness