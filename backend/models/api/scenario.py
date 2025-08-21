from typing import Optional

from pydantic import BaseModel


class CreateScenarioRequest(BaseModel):
    name: str
    description: str = ""
    keypoints: str = ""


class UpdateScenarioRequest(BaseModel):
    name: str = None
    description: str = None
    id: int
    keypoints: Optional[str] = None
