import { api, ApiError, API_BASE_URL } from '../api-client';
import type { File } from 'buffer'; // File 타입이 필요할 경우(환경에 따라 조정)
import { auth } from '@/lib/auth';

// ====== Feed DTO ======
export interface FeedCreateRequest {
  content: string;
  images?: File[];
}

export interface FeedUpdateRequest {
  content: string;
  images?: File[];
}

export interface FeedResponse {
  id: number;
  content: string;
  memberName: string;
  createdAt: string;
  imageIds: number[];
}

export interface FetchFeedResponse {
  memberId: number;
  feedId: number;
  memberName: string;
  content: string;
  likeCount: number;
  liked: boolean;
  commentCount: number;
  shareCount: number;
  profileId: number;
  profileImageUrl?: string; // ✅ 프로필 이미지 URL 필드 추가
  createdAt: string;
  mediaIds: number[];
  isShared: boolean;
  sharedFeed?: FetchFeedResponse;
  sharedBy?: {
    memberId: number;
    memberName: string;
    profileImageUrl?: string; // ✅ 프로필 이미지 URL 필드 추가
  };
}

export interface FetchFeedsResponse {
  status: number;
  message: string;
  result: {
    feeds: FetchFeedResponse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
}

export interface FetchFeedSummaryResponse {
  feedId: number;
  memberName: string;
  content: string;
  createdAt: string;
}

export interface FetchFeedSummariesResponse {
  status: number;
  message: string;
  result: {
    feedSummaries: FetchFeedSummaryResponse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
}

export interface FeedMediaResponse {
  image: any;
  extension: string;
}

// ====== Feed Comment DTO ======
export interface FetchFeedCommentResponse {
  memberId: number;
  feedCommentId: number;
  memberName: string;
  content: string;
  replyCount: number;
  likeCount: number;
  liked: boolean;
  profileId: number;
  profileImageUrl?: string; // ✅ 댓글 작성자 프로필 이미지 URL 추가
  createdAt: string;
  mediaIds: number[];
}

export interface FetchFeedCommentsResponse {
  status: number;
  message: string;
  result: {
    feedComments: FetchFeedCommentResponse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
}

// ====== Feed Reply DTO ======
export interface FetchFeedReplyResponse {
  memberId: number;
  feedReplyId: number;
  memberName: string;
  content: string;
  likeCount: number;
  liked: boolean;
  profileId: number;
  profileImageUrl?: string; // ✅ 답글 작성자 프로필 이미지 URL 추가
  createdAt: string;
  mediaIds: number[];
}

export interface FetchFeedRepliesResponse {
  status: number;
  message: string;
  result: {
    feedReplies: FetchFeedReplyResponse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null;
}

export interface ShareFeedRequest {
  content: string;
  originFeedId: number;
}

export interface ShareFeedResponse {
  status: number;
  message: string;
  result: null;
}

// ====== Feed API 함수 ======
export async function fetchFeeds({ page = 0, size = 10, sort = 'createdAt,desc' }: { page?: number; size?: number; sort?: string } = {}): Promise<FetchFeedsResponse> {
  return await api.get('/feed/list', {
    params: { page: String(page), size: String(size), sort },
  });
}

export async function fetchFeedSummaries({ page = 0, size = 10, sort = 'createdAt,desc' }: { page?: number; size?: number; sort?: string } = {}): Promise<FetchFeedSummariesResponse> {
  return await api.get('/feed/summaries', {
    params: { page: String(page), size: String(size), sort },
  });
}

export async function fetchFeedById(feedId: number): Promise<{ status: number; message: string; result: FetchFeedResponse | null }> {
  return await api.get(`/feed/${feedId}`);
}

export async function createFeed(formData: FormData): Promise<any> {
  return await api.post('/feed', formData);
}

export async function shareFeed(content: string, originFeedId: number): Promise<any> {
  return await api.post('/feed/share', { content, originFeedId });
}

export async function likeFeed(feedId: number): Promise<any> {
  return await api.post(`/feed/${feedId}/like`);
}

export async function unlikeFeed(feedId: number): Promise<any> {
  return await api.delete(`/feed/${feedId}/like`);
}

export async function deleteFeed(feedId: number): Promise<any> {
  return await api.delete(`/feed/${feedId}`);
}

export function getFeedMediaUrl(mediaId: number): string {
  return `${API_BASE_URL}/api/v1/feed/media/${mediaId}`;
}

export function getProfileMediaUrl(mediaId: number): string {
  return `${API_BASE_URL}/api/v1/profile/media/${mediaId}`;
}

// ====== Feed Comment DTO 및 API ======
export async function fetchFeedComments(feedId: number): Promise<FetchFeedCommentsResponse> {
  return await api.get(`/feed/comment/list/${feedId}`);
}

export async function createFeedComment(formData: FormData): Promise<any> {
  return await api.post('/feed/comment', formData);
}

export function getFeedCommentMediaUrl(mediaId: number): string {
  return `${API_BASE_URL}/api/v1/feed/comment/media/${mediaId}`;
}

export async function updateFeedComment(feedCommentId: number, formData: FormData): Promise<any> {
  return await api.put(`/feed/comment/${feedCommentId}`, formData, { method: 'PUT' });
}

export async function deleteFeedComment(feedCommentId: number): Promise<any> {
  return await api.delete(`/feed/comment/${feedCommentId}`);
}

export async function likeFeedComment(feedCommentId: number): Promise<any> {
  return await api.post(`/feed/comment/${feedCommentId}/like`);
}

export async function unlikeFeedComment(feedCommentId: number): Promise<any> {
  return await api.delete(`/feed/comment/${feedCommentId}/like`);
}

// ====== Feed Reply DTO 및 API ======
export async function fetchFeedReplies(feedCommentId: number): Promise<FetchFeedRepliesResponse> {
  return await api.get(`/feed/comment/reply/list/${feedCommentId}`);
}

export async function createFeedReply(formData: FormData): Promise<any> {
  return await api.post('/feed/comment/reply', formData);
}

export async function updateFeedReply(feedReplyId: number, formData: FormData): Promise<any> {
  return await api.put(`/feed/comment/reply/${feedReplyId}`, formData);
}

export async function deleteFeedReply(feedReplyId: number): Promise<any> {
  return await api.delete(`/feed/comment/reply/${feedReplyId}`);
}

export async function likeFeedReply(feedReplyId: number): Promise<any> {
  return await api.post(`/feed/comment/reply/${feedReplyId}/like`);
}

export async function unlikeFeedReply(feedReplyId: number): Promise<any> {
  return await api.delete(`/feed/comment/reply/${feedReplyId}/like`);
}

export function getFeedReplyMediaUrl(mediaId: number): string {
  return `${API_BASE_URL}/feed/reply/media/${mediaId}`;
}

// ====== 이미지 Blob 가져오기 함수들 ======
export async function getFeedMediaBlob(mediaId: number): Promise<Blob> {
  const token = await auth.getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`/api/v1/feed/media/${mediaId}`, { headers });
  if (!response.ok) {
    throw new ApiError(response.status, '피드 이미지를 가져올 수 없습니다');
  }
  return await response.blob();
}

export async function getProfileMediaBlob(mediaId: number): Promise<Blob> {
  const token = await auth.getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`/api/v1/profile/media/${mediaId}`, { headers });
  if (!response.ok) {
    throw new ApiError(response.status, '프로필 이미지를 가져올 수 없습니다');
  }
  return await response.blob();
}

export async function getFeedCommentMediaBlob(mediaId: number): Promise<Blob> {
  const token = await auth.getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/feed/comment/media/${mediaId}`, { headers });
  if (!response.ok) {
    throw new ApiError(response.status, '이미지를 가져올 수 없습니다');
  }
  return await response.blob();
}

export async function getFeedReplyMediaBlob(mediaId: number): Promise<Blob> {
  const token = await auth.getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/feed/reply/media/${mediaId}`, { headers });
  if (!response.ok) {
    throw new ApiError(response.status, '이미지를 가져올 수 없습니다');
  }
  return await response.blob();
} 
