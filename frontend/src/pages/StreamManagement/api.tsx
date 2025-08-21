import { toast } from "react-toastify";
import apiClient from "../../api/client";
import { PaginatedRequest, type ApiResponse, type PaginatedResponse } from "../../api/response";

interface VideoProps {
    id: number;
    title: string;
    type: string;
    category: number;
    url: string;
    thumbnail: string | null;
}

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

export type { VideoProps, StreamProps }

export { fetchData };