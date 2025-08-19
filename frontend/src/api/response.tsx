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
    pageId: number;
    pageSize: number;
    keyword?: string;

    constructor(pageId: number = 1, pageSize: number = 10, keyword?: string) {
        this.pageId = pageId;
        this.pageSize = pageSize;
        if (keyword) this.keyword = keyword;
    }
}

export { PaginatedRequest };