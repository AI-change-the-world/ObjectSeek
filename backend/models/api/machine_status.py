from typing import Dict, List, Optional

from pydantic import BaseModel

# ================== Data Models ==================


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


class DiskInfo(BaseModel):
    device: str
    mountpoint: str
    total_gb: float
    used_gb: float
    percent: float


class NetworkInfo(BaseModel):
    bytes_sent_mb: float
    bytes_recv_mb: float
    packets_sent: int
    packets_recv: int


class SystemMeta(BaseModel):
    hostname: str
    os: str
    kernel: str
    architecture: str
    boot_time: str


class SystemInfo(BaseModel):
    cpu_percent: float
    cpu_cores: int
    cpu_threads: int
    load_avg: Optional[List[float]]
    memory: MemoryInfo
    gpu: Optional[Dict[str, GPUInfo]]
    disks: List[DiskInfo]
    network: NetworkInfo
    system: SystemMeta
