import math


class StabilityAnalyzer:

    def __init__(self):

        self.prev_point = None

        self.total_movement = 0

        self.frames = 0

    def update(self, point):

        if self.prev_point is not None:

            movement = math.dist(
                self.prev_point,
                point
            )

            self.total_movement += movement

        self.prev_point = point

        self.frames += 1

        avg_movement = (
            self.total_movement /
            max(self.frames, 1)
        )

        stability = max(
            0,
            100 - avg_movement
        )

        return stability
    