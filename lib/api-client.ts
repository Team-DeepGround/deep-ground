import { toast } from 'sonner';
import { auth } from '@/lib/auth';

// 환경변수 기반 API 베이스 구성 (fallback: 상대 경로)
const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
export const API_BASE_URL = `${API_ORIGIN}/api/${API_VERSION}`;

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
    // FormData가 아닌 경우에만 Content-Type을 application/json으로 설정
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    // 토큰이 있으면 Authorization 헤더 추가
    const token = await auth.getToken();

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    } else {
    }

    const init: RequestInit = {
        ...fetchOptions,
        headers,
    };

    try {

        const response = await fetch(url, init);
        
        // 응답이 비어있거나 JSON이 아닌 경우 처리
        let data;
        const contentType = response.headers.get('content-type');
        const text = await response.text();
        
        if (text.trim() === '') {
            // 빈 응답인 경우 (DELETE 요청 등)
            data = { success: true };
        } else if (contentType && contentType.includes('application/json')) {
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                throw new ApiError(response.status, '응답을 파싱할 수 없습니다');
            }
        } else {
            // JSON이 아닌 응답인 경우
            data = { message: text };
        }


        if (!response.ok && response.status !== 302) {
            if (response.status === 401) {
                if (!window.location.pathname.startsWith('/auth/')) {
                    toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
                    auth.removeToken();
                    window.location.href = '/auth/login';
                }
            }
            throw new ApiError(response.status, data.message || 'API 요청 실패');
        }
        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, '서버 오류가 발생했습니다');
    }
}

export const api = {
    get: (endpoint: string, options?: RequestOptions) =>
        apiClient(endpoint, { ...options, method: 'GET' }),

    post: (endpoint: string, data?: any, options?: RequestOptions) => {
        // FormData인 경우 JSON.stringify 하지 않음
        if (data instanceof FormData) {
            return apiClient(endpoint, {
                ...options,
                method: 'POST',
                body: data,
                headers: {
                    ...options?.headers,
                    // FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
                }
            });
        }
        return apiClient(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    put: (endpoint: string, data?: any, options?: RequestOptions) =>
        apiClient(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),

    patch: (endpoint: string, data?: any, options?: RequestOptions) =>
        apiClient(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: (endpoint: string, options?: RequestOptions) =>
        apiClient(endpoint, { ...options, method: 'DELETE' }),

    // 파일 업로드 전용 메서드
    upload: (endpoint: string, formData: FormData, options?: RequestOptions) =>
        apiClient(endpoint, {
            ...options,
            method: 'POST',
            body: formData,
        }),
};

export async function apiClientFormData(endpoint: string, data: any, accessToken: string) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers();

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    // FormData가 아닐 때만 Content-Type 세팅
    let body;
    if (data instanceof FormData) {
        body = data;
    } else if (data) {
        headers.set('Content-Type', 'application/json');
        body = JSON.stringify(data);
    }

    const res = await fetch(url, {
        method: 'POST',
        headers,
        body,
    });

    const result = await res.json();

    // 성공 시 status/message/result 구조로 반환
    if (res.ok) {
        return {
            status: 201,
            message: "질문이 성공적으로 생성되었습니다.",
            result,
        };
    }
    // 실패 시 백엔드 응답 그대로 반환
    return result;
} 