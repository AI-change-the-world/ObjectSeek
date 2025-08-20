import { toast } from "react-toastify";
import type { ApiResponse, PaginatedRequest, PaginatedResponse } from "../../api/response";
import apiClient from "../../api/client";

interface AlgorithmProps {
    id: number;
    created_at: number;
    updated_at: number;
    is_deleted: number;
    name: string;
    description: string | null;
    version: string | null;
}


const getAlgorithmList = async (params: PaginatedRequest) => {
    try {
        const response = await apiClient.post('/algorithm/list', {
            data: params
        });
        const result: ApiResponse<PaginatedResponse<AlgorithmProps>> = await response.data;
        return result;
    } catch (error) {
        console.log(error);
        toast.error('获取算法列表失败');
        return null;
    }
};

export { getAlgorithmList };
export type { AlgorithmProps };