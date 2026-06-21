import cv2
import numpy as np


class HeadPoseEstimator:

    def __init__(self):
        pass

    def estimate(self, face_landmarks, img_w, img_h):

        face_2d = []
        face_3d = []

        landmark_ids = [
            33,   # left eye
            263,  # right eye
            1,    # nose tip
            61,   # left mouth
            291,  # right mouth
            199   # chin
        ]

        for idx in landmark_ids:

            lm = face_landmarks.landmark[idx]

            x = int(lm.x * img_w)
            y = int(lm.y * img_h)

            face_2d.append([x, y])

            face_3d.append(
                [x, y, lm.z * 3000]
            )

        face_2d = np.array(face_2d, dtype=np.float64)
        face_3d = np.array(face_3d, dtype=np.float64)

        focal_length = img_w

        cam_matrix = np.array([
            [focal_length, 0, img_w / 2],
            [0, focal_length, img_h / 2],
            [0, 0, 1]
        ])

        dist_matrix = np.zeros((4, 1))

        success, rot_vec, trans_vec = cv2.solvePnP(
            face_3d,
            face_2d,
            cam_matrix,
            dist_matrix
        )

        rmat, _ = cv2.Rodrigues(rot_vec)

        angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)

        pitch = angles[0]
        yaw = angles[1]
        roll = angles[2]

        return pitch, yaw, roll