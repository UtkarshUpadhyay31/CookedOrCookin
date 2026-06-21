class AttentionAnalyzer:

    def __init__(self):

        self.total_frames = 0
        self.attention_frames = 0

    def update(self, direction):

        self.total_frames += 1

        if direction == "CENTER":
            self.attention_frames += 1

        score = (
            self.attention_frames /
            self.total_frames
        ) * 100

        return score