import { toast } from "react-toastify";
import apiClient from "../../api/client";
import type { ApiResponse } from "../../api/response";

interface MemoryInfo {
    total_gb: number;
    used_gb: number;
    percent: number;
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

interface SystemInfo {
    cpu: number;
    memory: MemoryInfo;
    gpu: Record<number, GPUInfo>;
}


const getMonitorStatus = async () => {
    try {
        const response = await apiClient.get('/system-monitor/system/info');
        const result: ApiResponse<SystemInfo> = await response.data;
        return result;
    } catch (error) {
        console.log(error);
        toast.error('获取监控信息失败');
        return null;
    }

}

export default getMonitorStatus;
export type { MemoryInfo, GPUInfo, SystemInfo }