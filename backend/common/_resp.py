from typing import Any, Optional

from pydantic import BaseModel


class ApiResponse(BaseModel):
    data: Optional[Any] = None
    message: Optional[str] = None
    code: int = 200


class ListResponse(BaseModel):
    records: Optional[list] = None
    total: int = 0


class ApiPageResponse(BaseModel):
    data: Optional[ListResponse] = None
    message: Optional[str] = None
    code: int = 200
