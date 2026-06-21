class SessionTracker:

    def __init__(self):

        self.readiness = []

    def update(self, score):

        self.readiness.append(score)

    def get_data(self):

        return self.readiness