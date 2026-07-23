export function parsePagination(req) {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    let startDate;
    let endDate;
    if (req.query.startDate) {
        const parsed = new Date(String(req.query.startDate));
        if (!Number.isNaN(parsed.getTime()))
            startDate = parsed;
    }
    if (req.query.endDate) {
        const parsed = new Date(String(req.query.endDate));
        if (!Number.isNaN(parsed.getTime()))
            endDate = parsed;
    }
    return { page, limit, skip, search, startDate, endDate };
}
export function buildSearchFilter(search, fields) {
    if (!search)
        return {};
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return {
        $or: fields.map((field) => ({ [field]: regex })),
    };
}
export function paginatedResults(results, count) {
    return { status: true, data: { results, count } };
}
export function paginatedWithTotal(results, total) {
    return { status: true, data: { results, total, count: total } };
}
