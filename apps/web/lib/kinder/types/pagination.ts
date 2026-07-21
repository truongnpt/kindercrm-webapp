export type PaginationParams = {
    page?: number;
    limit?: number;
    search?: string;
};

export type Pagination = {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
};

export type PaginatedResponse<T> = {
    data: T[];
    pagination: Pagination;
};