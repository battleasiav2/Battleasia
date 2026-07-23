import type { Request } from 'express';

export type PaginationQuery = {
  page: number;
  limit: number;
  skip: number;
  search: string;
  startDate?: Date;
  endDate?: Date;
};

export function parsePagination(req: Request): PaginationQuery {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  const search = String(req.query.search || '').trim();

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (req.query.startDate) {
    const parsed = new Date(String(req.query.startDate));
    if (!Number.isNaN(parsed.getTime())) startDate = parsed;
  }
  if (req.query.endDate) {
    const parsed = new Date(String(req.query.endDate));
    if (!Number.isNaN(parsed.getTime())) endDate = parsed;
  }

  return { page, limit, skip, search, startDate, endDate };
}

export function buildSearchFilter(search: string, fields: string[]) {
  if (!search) return {};
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
}

export function paginatedResults<T>(results: T[], count: number) {
  return { status: true, data: { results, count } };
}

export function paginatedWithTotal<T>(results: T[], total: number) {
  return { status: true, data: { results, total, count: total } };
}
