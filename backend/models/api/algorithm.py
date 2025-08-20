from typing import Optional

from pydantic import BaseModel


class CreateAlgorithmRequest(BaseModel):
    name: str
    description: Optional[str]
    version: str = "1.0.0"
