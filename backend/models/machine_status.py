# ================== Pydantic Models ==================

from typing import Dict, Optional

from pydantic import BaseModel


class MemoryInfo(BaseModel):
    total_gb: float
    used_gb: float
    percent: float


class GPUInfo(BaseModel):
    id: int
    name: str
    load_percent: float
    memory_used_gb: float
    memory_total_gb: float
    memory_percent: float
    temperature_c: Optional[float] = None


class SystemInfo(BaseModel):
    cpu: float
    memory: MemoryInfo
    gpu: Optional[Dict[str, GPUInfo]] 
