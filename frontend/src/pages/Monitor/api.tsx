import { toast } from "react-toastify";
import apiClient from "../../api/client";
import type { ApiResponse } from "../../api/response";

interface MemoryInfo {
    total_gb: number;
    used_gb: number;
    percent: number;
}

interface DiskInfo {
    device: string;
    mountpoint: string;
    total_gb: number;
    used_gb: number;
    percent: number;
}

interface NetworkInfo {
    bytes_sent_mb: number;
    bytes_recv_mb: number;
    packets_sent: number;
    packets_recv: number;
}

interface GPUInfo {
    id: number;
    name: string;
    load_percent: number;
    memory_used_gb: number;
    memory_total_gb: number;
    memory_percent: number;
    temperature_c?: number;
}

interface SystemDetailInfo {
    hostname: string;
    os: string;
    kernel: string;
    architecture: string;
    boot_time: string;
}

interface SystemInfo {
    cpu_percent: number;             // CPU 使用率（%）
    cpu_cores: number;               // CPU 核心数
    cpu_threads: number;             // CPU 线程数
    load_avg: number[];              // 负载平均值 [1分钟, 5分钟, 15分钟]
    memory: MemoryInfo;              // 内存信息
    gpu: Record<string, GPUInfo>;    // GPU 信息，key 是 GPU ID（字符串）
    disks: DiskInfo[];               // 磁盘信息数组
    network: NetworkInfo;            // 网络信息
    system: SystemDetailInfo;        // 系统详细信息
}

const getMonitorStatus = async (): Promise<ApiResponse<SystemInfo> | null> => {
    try {
        const response = await apiClient.get<ApiResponse<SystemInfo>>(
            "/system-monitor/system/info"
        );
        return response.data;
    } catch (error) {
        console.error(error);
        toast.error("获取监控信息失败");
        return null;
    }
};

export default getMonitorStatus;
export type { MemoryInfo, DiskInfo, NetworkInfo, GPUInfo, SystemDetailInfo, SystemInfo };
