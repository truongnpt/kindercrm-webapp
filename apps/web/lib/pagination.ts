export function createPagination(page: number, limit: number) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    return {
        from,
        to
    }
}