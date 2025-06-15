import { api } from '../api-client';
import type { ApiResponse, PaginatedResponse } from '../api-types';

// 사용자 타입 정의
export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

// 사용자 생성 요청 타입
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

// 사용자 수정 요청 타입
export interface UpdateUserRequest {
  name?: string;
  profileImage?: string;
  bio?: string;
}

// 사용자 API 클래스
export class UserApi {
  private static readonly BASE_PATH = '/users';

  // 사용자 목록 조회
  static async getUsers(page = 1, pageSize = 10) {
    return api.get<PaginatedResponse<User>>(this.BASE_PATH, {
      params: {
        page: page.toString(),
        pageSize: pageSize.toString(),
      },
    });
  }

  // 특정 사용자 조회
  static async getUser(id: string) {
    return api.get<ApiResponse<User>>(`${this.BASE_PATH}/${id}`);
  }

  // 현재 로그인한 사용자 정보 조회
  static async getCurrentUser() {
    return api.get<ApiResponse<User>>(`${this.BASE_PATH}/me`);
  }

  // 사용자 생성
  static async createUser(data: CreateUserRequest) {
    return api.post<ApiResponse<User>>(this.BASE_PATH, data);
  }

  // 사용자 정보 수정
  static async updateUser(id: string, data: UpdateUserRequest) {
    return api.patch<ApiResponse<User>>(`${this.BASE_PATH}/${id}`, data);
  }

  // 사용자 삭제
  static async deleteUser(id: string) {
    return api.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);
  }

  // 사용자 검색
  static async searchUsers(query: string, page = 1, pageSize = 10) {
    return api.get<PaginatedResponse<User>>(`${this.BASE_PATH}/search`, {
      params: {
        query,
        page: page.toString(),
        pageSize: pageSize.toString(),
      },
    });
  }
} 