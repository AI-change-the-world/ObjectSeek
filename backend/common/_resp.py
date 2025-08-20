from typing import Any, Optional

from pydantic import BaseModel


class ApiResponse(BaseModel):
    data: Optional[Any] = None
    message: Optional[str] = None
    code: int = 200
