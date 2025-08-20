from typing import Any, Optional

from pydantic import BaseModel


class PaginatedRequest(BaseModel):
    page_size: int = 10
    page_num: int = 1
    order_by: Optional[str] = None
    keyword: Optional[Any] = None
