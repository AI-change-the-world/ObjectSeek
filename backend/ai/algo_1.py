""" 实现了人员跟踪和检索算法
"""

import threading
from typing import Tuple

import cv2
import numpy as np
import onnxruntime as ort
import supervision as sv
from ultralytics import YOLO

from ai._basic import AlgoConfig, AlgoType, BasicAlgo
from common import logger, numpy_to_base64


def bndbox_overlap(
    bndbox1: Tuple[float, float, float, float],
    bndbox2: Tuple[float, float, float, float],
) -> float:
    """计算两个边界框的重叠面积比例"""
    x1, y1, x2, y2 = bndbox1
    x1_p, y1_p, x2_p, y2_p = bndbox2

    # 先快速排除不可能相交的情况
    if x2 <= x1_p or x2_p <= x1 or y2 <= y1_p or y2_p <= y1:
        return 0.0

    # 计算重叠区域
    overlap_x1 = max(x1, x1_p)
    overlap_y1 = max(y1, y1_p)
    overlap_x2 = min(x2, x2_p)
    overlap_y2 = min(y2, y2_p)

    overlap_area = max(0, overlap_x2 - overlap_x1) * max(0, overlap_y2 - overlap_y1)
    area1 = (x2 - x1) * (y2 - y1)
    area2 = (x2_p - x1_p) * (y2_p - y1_p)

    return overlap_area / min(area1, area2)


# === 工具方法 ===
def crop_and_encode(frame, bbox):
    """裁剪bbox并转为base64"""
    x1, y1, x2, y2 = map(int, bbox)
    crop_img = frame[y1:y2, x1:x2]
    return numpy_to_base64(crop_img)


def crop(frame, bbox, id: str = "", save_image: bool = False):
    """裁剪bbox"""
    x1, y1, x2, y2 = map(int, bbox)
    crop_img = frame[y1:y2, x1:x2] if x1 < x2 and y1 < y2 else None
    if save_image:
        cv2.imwrite(f"logs/{id}.jpg", crop_img)
    return crop_img


class ReIDModel:
    def __init__(self, onnx_model_path: str):
        self.session = ort.InferenceSession(onnx_model_path)
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name

    def preprocess_for_reid(
        self, img: np.ndarray, target_size=(128, 256)
    ) -> np.ndarray:
        """
        对图像进行padding和resize，保持原始高宽比
        """
        target_w, target_h = target_size
        h, w, _ = img.shape

        # 计算缩放比例和padding尺寸
        scale = min(target_w / w, target_h / h)
        new_w, new_h = int(w * scale), int(h * scale)
        img_resized = cv2.resize(img, (new_w, new_h))

        # 创建一个目标尺寸的画布，并将resize后的图像粘贴到中心
        pad_img = np.full((target_h, target_w, 3), 128, dtype=np.uint8)  # 用灰色填充
        pad_top = (target_h - new_h) // 2
        pad_left = (target_w - new_w) // 2
        pad_img[pad_top : pad_top + new_h, pad_left : pad_left + new_w] = img_resized

        return pad_img

    def extract_feature(self, img: np.ndarray) -> np.ndarray:
        """
        输入: img (np.ndarray), shape=[H,W,3] (BGR 或 RGB 都可以)
        输出: feature 向量 (1, D)
        """
        if img is None:
            raise ValueError("输入图像为空")

        # 确保是 RGB
        if img.shape[2] == 3:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # resize (W=128, H=256)
        img_resized = self.preprocess_for_reid(img, (128, 256))

        # float32 归一化
        img_resized = img_resized.astype(np.float32) / 255.0

        # [H,W,C] → [C,H,W]
        img_resized = np.transpose(img_resized, (2, 0, 1))

        # [1,C,H,W]
        img_resized = np.expand_dims(img_resized, axis=0)

        # 推理
        features = self.session.run([self.output_name], {self.input_name: img_resized})[
            0
        ]

        # 有些 ReID 模型会输出 (1, D)，直接返回即可
        return features.squeeze()


class ClassTrackerObject:
    """
    追踪对象类，用于管理视频中跟踪的目标对象

    该类封装了目标对象的所有属性和操作，包括：
    - 对象标识和时间信息
    - 边界框信息管理
    - 图像特征和向量管理
    - 线程安全的更新操作
    """

    def __init__(
        self,
        object_id: str,
        start_frame: int,
        bounding_box: Tuple[int, int, int, int],
        current_bounding_box: Tuple[int, int, int, int] = None,
        end_frame: int = None,
        features: str = None,
        embed_vector=None,
        min_image_size: Tuple[int, int] = (10, 10),
    ):
        """
        初始化追踪对象

        Args:
            object_id: 对象的唯一标识符
            start_frame: 对象首次出现的帧号
            bounding_box: 初始边界框 (x1, y1, x2, y2)
            current_bounding_box: 当前边界框，默认与初始边界框相同
            end_frame: 对象最后出现的帧号
            features: 对象特征描述字符串
            embed_vector: 对象的特征向量
            min_image_size: 最小图像尺寸阈值
        """
        # 基本标识信息
        self.object_id = object_id
        self.start_frame = start_frame
        self.end_frame = end_frame if end_frame is not None else start_frame
        self.features = features

        # 边界框信息
        self.bounding_box = bounding_box  # 初始边界框
        self.current_bounding_box = current_bounding_box or bounding_box  # 当前边界框

        # 特征向量信息
        self.embed_vector = embed_vector  # ReID特征向量

        # 图像信息
        self.image = None  # 当前对象图像
        self.image_base64 = None  # 图像的base64编码
        self.cache_images = []  # 缓存的历史图像
        self.min_image_size = min_image_size  # 最小图像尺寸阈值

        # 线程安全控制
        self.lock = threading.Lock()  # 防止并发修改冲突
        self.is_updating = False  # 更新状态标记

    def update_image(self, image: np.ndarray, reid_model: ReIDModel) -> bool:
        """
        更新对象图像和相关特征

        Args:
            image: 新的对象图像数组

        Returns:
            bool: 更新是否成功
        """
        # 检查图像尺寸是否满足最小要求
        if not self._is_valid_image_size(image):
            return False

        try:
            with self.lock:
                self.is_updating = True

                # 更新图像
                self.image = image.copy()  # 创建副本避免引用问题

                # 提取并更新特征向量
                feature_vector = reid_model.extract_feature(image)
                self.update_embed_vector(feature_vector)

                # 首次设置时生成base64编码
                if self.image_base64 is None:
                    self.image_base64 = numpy_to_base64(image)

                # 缓存图像（限制缓存数量）
                self._cache_image(image)

                self.is_updating = False
                return True

        except Exception as e:
            self.is_updating = False
            logger.warning(f"更新对象 {self.object_id} 图像时发生错误: {e}")
            return False

    def _is_valid_image_size(self, image: np.ndarray) -> bool:
        """
        检查图像尺寸是否有效

        Args:
            image: 待检查的图像

        Returns:
            bool: 图像尺寸是否满足要求
        """
        return (
            image.shape[0] >= self.min_image_size[0]
            and image.shape[1] >= self.min_image_size[1]
        )

    def _cache_image(self, image: np.ndarray, max_cache_size: int = 10) -> None:
        """
        缓存图像，维护固定大小的缓存

        Args:
            image: 要缓存的图像
            max_cache_size: 最大缓存数量
        """
        self.cache_images.append(image.copy())
        # 保持缓存大小在限制范围内
        if len(self.cache_images) > max_cache_size:
            self.cache_images.pop(0)  # 移除最旧的图像

    def update_bounding_box(self, bounding_box: Tuple[int, int, int, int]) -> bool:
        """
        更新当前边界框

        Args:
            bounding_box: 新的边界框坐标 (x1, y1, x2, y2)

        Returns:
            bool: 更新是否成功
        """
        if not self._is_valid_bounding_box(bounding_box):
            return False

        with self.lock:
            self.current_bounding_box = bounding_box
            return True

    def _is_valid_bounding_box(self, bbox: Tuple[int, int, int, int]) -> bool:
        """
        验证边界框的有效性

        Args:
            bbox: 边界框坐标

        Returns:
            bool: 边界框是否有效
        """
        x1, y1, x2, y2 = bbox
        return x1 < x2 and y1 < y2 and x1 >= 0 and y1 >= 0

    def update_end_frame(self, frame: int) -> bool:
        """
        更新对象结束帧号

        Args:
            frame: 新的结束帧号

        Returns:
            bool: 更新是否成功
        """
        if frame < self.start_frame:
            logger.warning(f"结束帧号 {frame} 不能小于开始帧号 {self.start_frame}")
            return False

        with self.lock:
            self.end_frame = frame
            return True

    def update_features(self, features: str) -> None:
        """
        更新对象特征描述

        Args:
            features: 新的特征描述字符串
        """
        with self.lock:
            self.features = features

    def update_embed_vector(self, new_vec, alpha: float = 0.7) -> None:
        """
        使用指数滑动平均融合新的特征向量

        Args:
            new_vec: 新的特征向量
            alpha: 融合系数，取值范围[0,1]
                  - alpha 越大，越依赖历史特征
                  - alpha 越小，越依赖新特征
        """
        if new_vec is None:
            return

        # 规范化新向量
        new_vec = self._normalize_vector(new_vec)

        if self.embed_vector is None:
            # 首次设置向量
            self.embed_vector = new_vec
        else:
            # 融合历史向量和新向量
            old_vec = self.embed_vector
            fused_vec = alpha * old_vec + (1 - alpha) * new_vec
            self.embed_vector = self._normalize_vector(fused_vec)

    def _normalize_vector(self, vector) -> np.ndarray:
        """
        向量归一化

        Args:
            vector: 待归一化的向量

        Returns:
            np.ndarray: 归一化后的向量
        """
        vec = np.asarray(vector, dtype=np.float32)
        norm = np.linalg.norm(vec)
        return vec / (norm + 1e-6) if norm > 1e-6 else vec

    def get_duration(self) -> int:
        """
        获取对象的持续时间（帧数）

        Returns:
            int: 对象存在的帧数
        """
        return self.end_frame - self.start_frame + 1

    def get_bbox_area(self) -> int:
        """
        获取当前边界框的面积

        Returns:
            int: 边界框面积
        """
        x1, y1, x2, y2 = self.current_bounding_box
        return (x2 - x1) * (y2 - y1)

    def is_active(self) -> bool:
        """
        检查对象是否处于活跃状态（非更新状态且有有效数据）

        Returns:
            bool: 对象是否活跃
        """
        return not self.is_updating and self.image is not None

    def get_cached_images_count(self) -> int:
        """
        获取缓存图像的数量

        Returns:
            int: 缓存图像数量
        """
        return len(self.cache_images)

    def __str__(self) -> str:
        """
        返回对象的字符串表示

        Returns:
            str: 对象的详细信息字符串
        """
        image_info = f"{self.image.shape}" if self.image is not None else "None"
        vector_info = (
            f"{self.embed_vector.shape}" if self.embed_vector is not None else "None"
        )

        return (
            f"TrackerObject(id={self.object_id}, "
            f"frames={self.start_frame}-{self.end_frame}, "
            f"duration={self.get_duration()}, "
            f"bbox_initial={self.bounding_box}, "
            f"bbox_current={self.current_bounding_box}, "
            f"area={self.get_bbox_area()}, "
            f"image_shape={image_info}, "
            f"vector_shape={vector_info}, "
            f"cached_images={self.get_cached_images_count()}, "
            f"features='{self.features}')"
        )

    def __repr__(self) -> str:
        """
        返回对象的开发者友好表示

        Returns:
            str: 对象的简洁表示
        """
        return f"TrackerObject(id={self.object_id}, frames={self.start_frame}-{self.end_frame})"


class Algo_1(BasicAlgo):
    def __init__(
        self,
        config: AlgoConfig,
        video_path: str,  # must be a s3 path or rtsp stream, currently only support s3 path
        reid_model_path: str = "resnet50_market1501_aicity156.onnx",
        yolo_model_path: str = "yolo11n.pt",
    ):
        super().__init__()
        self.config = config
        assert self.config.algo_type == AlgoType.video
        self.yolo_model = YOLO(yolo_model_path, verbose=False)
        self.reid_model = ReIDModel(reid_model_path)

        self.tracker = sv.ByteTrack(
            track_activation_threshold=0.5,
            lost_track_buffer=48,
            frame_rate=24,
        )
        self.box_annotator = sv.BoxAnnotator()
        self.label_annotator = sv.LabelAnnotator()

        self.video = cv2.VideoCapture(video_path)
