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

        const result: ApiResponse<String> = await res.data;

        return result.data;
    } catch (err) {
        toast.error("上传失败");
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

export type { StreamProps, CatalogProps }

export { fetchData, fetchCatalog, uploadFile };