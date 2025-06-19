import { toast } from 'sonner';
import { auth } from '@/lib/auth';

// 상대 경로로 변경
const API_BASE_URL = '/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function apiClient(endpoint: string, options: RequestOptions = {}) {
  const { params, ...fetchOptions } = options;
  
  // Construct URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // 기본 헤더 설정
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 토큰이 있으면 Authorization 헤더 추가
  const token = await auth.getToken();
  console.log('API 요청 - 현재 토큰:', token);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    console.log('API 요청 - Authorization 헤더 추가됨:', headers.get('Authorization'));
  } else {
    console.log('API 요청 - 토큰 없음, Authorization 헤더 미포함');
  }

  const init: RequestInit = {
    ...fetchOptions,
    headers,
  };

  try {
    console.log('API 요청 시작:', {
      url,
      method: init.method,
      headers: Object.fromEntries(headers.entries())
    });
    
    const response = await fetch(url, init);
    const data = await response.json();

    console.log('API 응답:', {
      status: response.status,
      data
    });

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'API 요청 실패');
    }

    return data;
  } catch (error) {
    console.error('API 요청 실패:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, '서버 오류가 발생했습니다');
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiClient(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiClient(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiClient(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient(endpoint, { ...options, method: 'DELETE' }),
}; 