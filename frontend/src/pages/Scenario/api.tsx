import { toast } from "react-toastify";
import apiClient from "../../api/client";
import type { ApiResponse, PaginatedRequest, PaginatedResponse } from "../../api/response";

interface ScenarioProps {
    id: number;
    created_at: number;
    updated_at: number;
    is_deleted: number;
    name: string;
    description: string | null;
}

class CreateScenarioProps {
    name: string;
    description: string | null;

    constructor(name: string, description: string | null) {
        this.name = name;
        this.description = description;
    }
}

class UpdateScenarioProps {
    name: string;
    description: string | null;
    id: number;

    constructor(id: number, name: string, description: string | null) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}

const getScenarioList = async (params: PaginatedRequest) => {
    try {
        const res = await apiClient.post("/scenario/list", {
            data: params,
        });
        return res.data as ApiResponse<PaginatedResponse<ScenarioProps>>;
    } catch (error) {
        console.log(error);
        toast.error("获取场景列表失败");
        return null;
    }
};

const createScenario = async (data: CreateScenarioProps) => {
    try {
        const res = await apiClient.post("/scenario/create", data);
        return res.data as ApiResponse<ScenarioProps>;
    } catch (error) {
        console.log(error);
        toast.error("创建场景失败");
        return null;
    }
};

const updateScenario = async (data: UpdateScenarioProps) => {
    try {
        const res = await apiClient.post("/scenario/update", data);
        return res.data as ApiResponse;
    } catch (error) {
        console.log(error);
        toast.error("更新场景失败");
        return null;
    }
};

const deleteScenario = async (id: number) => {
    try {
        const res = await apiClient.get("/scenario/delete/" + id);
        return res.data as ApiResponse;
    } catch (error) {
        console.log(error);
        toast.error("删除场景失败");
        return null;
    }
};

export { getScenarioList, createScenario, updateScenario, deleteScenario, UpdateScenarioProps, CreateScenarioProps };
export type { ScenarioProps };