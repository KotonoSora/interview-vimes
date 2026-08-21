export interface BaseApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  requestId: string;
  data?: T;
}

export interface ApiPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedApiResponse<T> extends BaseApiResponse<T[]> {
  pagination: ApiPagination;
}

export interface ApiValidationError {
  path: string;
  message: string;
}

export interface ApiErrorResponse extends BaseApiResponse {
  errors?: ApiValidationError[];
}
