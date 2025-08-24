import { toast } from "react-toastify";
import apiClient from "../../api/client";
import { PaginatedRequest, type ApiResponse, type PaginatedResponse } from "../../api/response";


interface StreamProps {
    id: number;
    name: string;
    stream_path: string;
    stream_type: string;
    description: string | null;
    created_at: number;
    scenario_id: number | null;
    scenario_name: string | null;
}

interface CatalogProps {
    scenario_id: number;
    scenario_name: string;
    scenario_count: number;
}

interface CreateStreamRequest {
    name: string;
    description?: string;
    algo_id?: number;
    scenario_id?: number;
    stream_type: string;
    stream_path: string;
}


const fetchCatalog = async () => {

    try {
        const res = await apiClient.get("/stream/catalog");

        const result: ApiResponse<CatalogProps[]> = await res.data;

        return result.data;
    } catch (err) {
        console.error("加载数据失败", err);
        toast.error("加载数据失败");
        return null;
    }
};



const uploadFile = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await apiClient.post("/stream/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const result: ApiResponse<string> = await res.data;

        return result.data;
    } catch (err) {
        toast.error("上传失败");
    }
};

const createStream = async (data: CreateStreamRequest) => {
    try {
        const res = await apiClient.post("/stream/create", data);

        const result: ApiResponse<StreamProps> = await res.data;

        return result.data;
    } catch (err) {
        console.error("创建流失败", err);
        toast.error("创建流失败");
        return null;
    }
};

const fetchStreamView = async (streamId: number) => {
    try {
        const res = await apiClient.get(`/stream/view/${streamId}`);

        const result: ApiResponse<string> = await res.data;

        return result.data;
    } catch (err) {
        console.error("获取视频流失败", err);
        toast.error("获取视频流失败");
        return null;
    }
};

const fetchData = async (page: number, size: number, type_id: number) => {
    try {
        const res = await apiClient.post("/stream/list-by-scenario/" + type_id, new PaginatedRequest(page, size));

        const result: ApiResponse<PaginatedResponse<StreamProps>> = await res.data;

        return result.data;
    } catch (err) {
        console.error("加载数据失败", err);
        toast.error("加载数据失败");
        return null;
    }
};

const analyzeStream = async (streamId: number, onMessage: (data: string) => void, onComplete?: () => void, onError?: (error: string) => void) => {
    try {
        const eventSource = new EventSource(import.meta.env.VITE_API_BASE_URL + `/stream/analyze/${streamId}`);

        eventSource.onmessage = (event) => {
            const data = event.data;
            if (data.includes("[DONE]")) {
                eventSource.close();
                onComplete?.();
            } else {
                onMessage(data);
            }
        };

        eventSource.onerror = (error) => {
            if (eventSource.readyState === EventSource.CLOSED) {
                console.warn("SSE 已关闭（可能是正常结束）");
                eventSource.close();
            } else {
                console.error("SSE 出现错误:", error);
                eventSource.close();
                onError?.("分析过程中出现错误");
            }
        };

        return eventSource;
    } catch (err) {
        console.error("启动分析失败", err);
        onError?.("启动分析失败");
        return null;
    }
};

export type { StreamProps, CatalogProps, CreateStreamRequest }

export { fetchData, fetchCatalog, uploadFile, createStream, fetchStreamView, analyzeStream };