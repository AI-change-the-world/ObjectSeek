from enum import Enum

from pydantic import BaseModel

from common import chat_client, chat_model, chat_vlm_model, s3_operator


class AlgoType(Enum):
    video = "video"
    image = "image"
    text = "text"
    audio = "audio"


class AlgoConfig(BaseModel):
    algo_type: AlgoType = AlgoType.video
    duration_in_sec: int = 60  # 每过60秒保存一次结果，对音视频类数据处理有效


class BasicAlgo:

    def __init__(self):
        self.chat_client = chat_client
        self.chat_vlm_model = chat_vlm_model
        self.chat_model = chat_model
        self.s3_client = s3_operator
