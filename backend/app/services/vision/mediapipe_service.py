import cv2, mediapipe as mp, numpy as np, logging
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)
mp_face_mesh = mp.solutions.face_mesh
mp_pose      = mp.solutions.pose
_face_mesh = None
_pose      = None

LEFT_EAR_IDX  = [362, 385, 387, 263, 373, 380]
RIGHT_EAR_IDX = [33,  160, 158, 133, 153, 144]
MOUTH_IDX     = [61, 291, 39, 181, 0, 17, 269, 405]

def get_face_mesh():
    global _face_mesh
    if _face_mesh is None:
        _face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.5, min_tracking_confidence=0.5)
    return _face_mesh

def get_pose():
    global _pose
    if _pose is None:
        _pose = mp_pose.Pose(static_image_mode=False, model_complexity=1, smooth_landmarks=True, min_detection_confidence=0.5, min_tracking_confidence=0.5)
    return _pose

@dataclass
class LandmarkResult:
    face_landmarks: Optional[list] = None
    face_detected: bool = False
    left_eye:  list = field(default_factory=list)
    right_eye: list = field(default_factory=list)
    mouth_landmarks: list = field(default_factory=list)
    pose_landmarks: Optional[list] = None
    pose_detected: bool = False
    width:  int = 640
    height: int = 480

def extract_landmarks(frame_bytes: bytes) -> LandmarkResult:
    arr = np.frombuffer(frame_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return LandmarkResult()
    h, w = img.shape[:2]
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    rgb.flags.writeable = False
    result = LandmarkResult(width=w, height=h)
    face_result = get_face_mesh().process(rgb)
    if face_result.multi_face_landmarks:
        fl = face_result.multi_face_landmarks[0]
        result.face_detected = True
        result.face_landmarks = fl.landmark
        def pt(idx):
            lm = fl.landmark[idx]
            return (lm.x, lm.y, lm.z)
        result.left_eye  = [pt(i) for i in LEFT_EAR_IDX]
        result.right_eye = [pt(i) for i in RIGHT_EAR_IDX]
        result.mouth_landmarks = [pt(i) for i in MOUTH_IDX]
    pose_result = get_pose().process(rgb)
    if pose_result.pose_landmarks:
        result.pose_detected = True
        result.pose_landmarks = pose_result.pose_landmarks.landmark
    return result
