export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

export interface PaginatedResponse<T = any> {
    total: number;
    records: T[];
}

class PaginatedRequest {
    page_num: number;
    page_size: number;
    keyword?: string;

    constructor(page_num: number = 1, page_size: number = 10, keyword?: string) {
        this.page_num = page_num;
        this.page_size = page_size;
        if (keyword) this.keyword = keyword;
    }
}

export { PaginatedRequest };