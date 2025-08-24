import os

import cv2
import numpy as np
from moviepy import ImageClip, VideoFileClip, concatenate_videoclips
from PIL import Image, ImageDraw, ImageFont


class BBoxAnnotation:
    """在某一帧上的 BBox 标注"""

    def __init__(self, frame_index: int, x1: int, y1: int, x2: int, y2: int):
        self.frame_index = frame_index
        self.bbox = (x1, y1, x2, y2)


class Segment:
    """视频片段，带可选的 bbox 标注"""

    def __init__(self, start_frame: int, end_frame: int, bboxes=None):
        self.start_frame = start_frame
        self.end_frame = end_frame
        self.bboxes = bboxes or []  # List[BBoxAnnotation]

    def get_bbox_dict(self, fps):
        """转为 {second: bbox} 方便 moviepy 使用"""
        bbox_dict = {}
        for ann in self.bboxes:
            sec = int(ann.frame_index / fps)
            bbox_dict[sec] = ann.bbox
        return bbox_dict


class VideoEditor:
    def __init__(self, video_path: str):
        self.video_path = video_path
        self.clip = VideoFileClip(video_path)
        self.fps = self.clip.fps
        self.width, self.height = self.clip.size

    def _create_transition_image(self, text: str, duration: float = 2.0):
        """创建转场图像"""
        # 使用 PIL 来绘制中文文本，避免乱码
        img = Image.new("RGB", (self.width, self.height), color=(0, 0, 0))
        draw = ImageDraw.Draw(img)

        # 尝试加载中文字体
        try:
            # Windows 系统字体路径
            font_paths = [
                "C:/Windows/Fonts/simhei.ttf",  # 黑体
                "C:/Windows/Fonts/msyh.ttc",  # 微软雅黑
                "C:/Windows/Fonts/simsun.ttc",  # 宋体
                "/System/Library/Fonts/PingFang.ttc",  # macOS
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",  # Linux
            ]

            font = None
            font_size = 60

            for font_path in font_paths:
                if os.path.exists(font_path):
                    try:
                        font = ImageFont.truetype(font_path, font_size)
                        break
                    except:
                        continue

            # 如果没有找到字体，使用默认字体
            if font is None:
                font = ImageFont.load_default()
        except:
            font = ImageFont.load_default()

        # 获取文本大小
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # 计算居中位置
        text_x = (self.width - text_width) // 2
        text_y = (self.height - text_height) // 2

        # 绘制文本
        draw.text((text_x, text_y), text, font=font, fill=(255, 255, 255))

        # 转换为 numpy 数组
        img_array = np.array(img)

        return ImageClip(img_array, duration=duration)

    def _add_bbox_to_clip(self, clip, bbox_dict):
        """给片段加 bbox"""
        from moviepy import VideoClip

        def make_frame_with_bbox(t):
            # 获取原始帧
            frame = clip.get_frame(t)
            frame = frame.copy()

            # 获取当前秒数
            sec = int(t)

            # 如果在该时间点有 bbox，就绘制
            if sec in bbox_dict:
                x1, y1, x2, y2 = bbox_dict[sec]
                h, w = frame.shape[:2]
                # 确保坐标在图像范围内
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w, x2), min(h, y2)
                # 绘制绿色矩形框
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 4)

            return frame

        # 创建新的 VideoClip
        return VideoClip(make_frame_with_bbox, duration=clip.duration)

    def extract_and_concatenate(
        self,
        segments,
        transition_text="第{}个场景",
        transition_duration=2.0,
        output="output.mp4",
    ):
        transition_img = self._create_transition_image(
            transition_text.format(1), transition_duration
        )
        clips = [transition_img]
        for idx, seg in enumerate(segments, 1):
            start_t = seg.start_frame / self.fps
            end_t = seg.end_frame / self.fps

            sub_clip = self.clip.subclipped(start_t, end_t)

            # 如果有 bbox，就画上去
            bbox_dict = seg.get_bbox_dict(self.fps)
            if bbox_dict:
                sub_clip = self._add_bbox_to_clip(sub_clip, bbox_dict)

            clips.append(sub_clip)

            # 转场
            if idx < len(segments):
                transition_img = self._create_transition_image(
                    transition_text.format(idx + 1), transition_duration
                )
                clips.append(transition_img)

        final_clip = concatenate_videoclips(clips, method="compose")
        final_clip.write_videofile(output, fps=self.fps)


if __name__ == "__main__":
    # 定义片段
    seg1 = Segment(
        100,
        300,
        [
            BBoxAnnotation(120, 50, 50, 200, 200),
            BBoxAnnotation(200, 80, 80, 220, 220),
        ],
    )
    seg2 = Segment(
        600,
        900,
        [
            BBoxAnnotation(650, 100, 100, 250, 250),
        ],
    )
    seg3 = Segment(1100, 1200)  # 没有 bbox

    editor = VideoEditor("test.mp4")
    editor.extract_and_concatenate(
        [seg1, seg2, seg3], transition_text="第{}个场景", output="result.mp4"
    )
