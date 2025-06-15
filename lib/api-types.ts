// API 응답의 기본 인터페이스
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// 페이지네이션 응답 인터페이스
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API 에러 응답 인터페이스
export interface ApiErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// API 요청 옵션 인터페이스
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  signal?: AbortSignal;
}

// API 엔드포인트 타입
export type ApiEndpoint = string;

// API 메서드 타입
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; 