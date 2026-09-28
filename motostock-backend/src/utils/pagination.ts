export interface PaginationQuery {
  page?: string;
  perPage?: string;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  perPage: number;
}

export function parsePagination(query: PaginationQuery): PaginationResult {
  const page = Math.max(1, Number(query.page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(query.perPage) || 10));
  return { skip: (page - 1) * perPage, take: perPage, page, perPage };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number
) {
  return {
    data,
    pagination: {
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    },
  };
}
