import { toast } from "react-toastify";
import apiClient from "../../api/client";
import type { ApiResponse } from "../../api/response";

interface DashboardData {
    total_scenario: number;
    scenario_wordcloud: string[];
    total_video: number;
    total_algorithm: number;
    algorithm_wordcloud: string[];
    stream_details: any;
}

const fetchDashboardData = async () => {
    try {
        const response = await apiClient.get('/dashboard');
        const result: ApiResponse<DashboardData> = await response.data;
        return result;
    } catch (error) {
        console.log(error);
        toast.error('获取监控信息失败');
        return null;
    }
};

export type { DashboardData };
export { fetchDashboardData };