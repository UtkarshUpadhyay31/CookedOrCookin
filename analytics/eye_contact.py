class EyeContactAnalyzer:

    def __init__(self):

        self.total_frames = 0
        self.contact_frames = 0

    def update(self, yaw, pitch):

        self.total_frames += 1

        looking_at_camera = (
            abs(yaw) < 10 and
            abs(pitch) < 10
        )

        if looking_at_camera:
            self.contact_frames += 1

        score = (
            self.contact_frames /
            self.total_frames
        ) * 100

        return score, looking_at_camera