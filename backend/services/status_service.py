from typing import Dict, Optional

import GPUtil
import psutil

from common import logger
from models import GPUInfo, MemoryInfo, SystemInfo

# ================== Monitor Class ==================


class SystemMonitor:
    @staticmethod
    def get_cpu_usage() -> float:
        return psutil.cpu_percent(interval=0.5)

    @staticmethod
    def get_memory_usage() -> MemoryInfo:
        mem = psutil.virtual_memory()
        return MemoryInfo(
            total_gb=round(mem.total / (1024**3), 2),
            used_gb=round(mem.used / (1024**3), 2),
            percent=mem.percent,
        )

    @staticmethod
    def get_gpu_usage() -> Optional[Dict[str, GPUInfo]]:
        try:
            gpus = GPUtil.getGPUs()
            gpu_info = {}
            for gpu in gpus:
                __id = str(gpu.id)
                gpu_info[__id] = GPUInfo(
                    id=gpu.id,
                    name=gpu.name,
                    load_percent=round(gpu.load * 100, 2),
                    memory_used_gb=round(gpu.memoryUsed / 1024, 2),
                    memory_total_gb=round(gpu.memoryTotal / 1024, 2),
                    memory_percent=round(gpu.memoryUtil * 100, 2),
                    temperature_c=gpu.temperature,
                )
            return gpu_info
        except Exception as e:
            logger.warning(e)
            return None

    @classmethod
    def get_system_info(cls) -> SystemInfo:
        return SystemInfo(
            cpu=cls.get_cpu_usage(),
            memory=cls.get_memory_usage(),
            gpu=cls.get_gpu_usage(),
        )
