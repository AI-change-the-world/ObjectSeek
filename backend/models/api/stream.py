from typing import Optional

from openai import BaseModel


class CreateStreamRequest(BaseModel):
    name: str
    description: Optional[str]
    algo_id: Optional[int]
    scenario_id: Optional[int]
    stream_type: str
    stream_path: str
