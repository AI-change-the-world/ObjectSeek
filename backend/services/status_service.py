import platform
from datetime import datetime
from typing import Dict, List, Optional

import GPUtil
import psutil

from common import logger
from models import (DiskInfo, GPUInfo, MemoryInfo, NetworkInfo, SystemInfo,
                    SystemMeta)

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

    @staticmethod
    def get_disk_usage() -> List[DiskInfo]:
        disks = []
        for part in psutil.disk_partitions():
            if "cdrom" in part.opts or part.fstype == "":
                continue
            usage = psutil.disk_usage(part.mountpoint)
            disks.append(
                DiskInfo(
                    device=part.device,
                    mountpoint=part.mountpoint,
                    total_gb=round(usage.total / (1024**3), 2),
                    used_gb=round(usage.used / (1024**3), 2),
                    percent=usage.percent,
                )
            )
        return disks

    @staticmethod
    def get_network_usage() -> NetworkInfo:
        net = psutil.net_io_counters()
        return NetworkInfo(
            bytes_sent_mb=round(net.bytes_sent / (1024**2), 2),
            bytes_recv_mb=round(net.bytes_recv / (1024**2), 2),
            packets_sent=net.packets_sent,
            packets_recv=net.packets_recv,
        )

    @staticmethod
    def get_system_meta() -> SystemMeta:
        boot_time = datetime.fromtimestamp(psutil.boot_time()).strftime(
            "%Y-%m-%d %H:%M:%S"
        )
        uname = platform.uname()
        return SystemMeta(
            hostname=uname.node,
            os=f"{uname.system} {uname.release}",
            kernel=uname.version,
            architecture=uname.machine,
            boot_time=boot_time,
        )

    @classmethod
    def get_system_info(cls) -> SystemInfo:
        return SystemInfo(
            cpu_percent=cls.get_cpu_usage(),
            cpu_cores=psutil.cpu_count(logical=False),
            cpu_threads=psutil.cpu_count(logical=True),
            load_avg=psutil.getloadavg() if hasattr(psutil, "getloadavg") else None,
            memory=cls.get_memory_usage(),
            gpu=cls.get_gpu_usage(),
            disks=cls.get_disk_usage(),
            network=cls.get_network_usage(),
            system=cls.get_system_meta(),
        )
