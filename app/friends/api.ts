import api from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface Friend {
  id: number
  name: string
  email: string
}

export interface FriendRequestResponse {
  status: number
  message: string
  result: number
}

// 친구 요청 보내기
export const sendFriendRequest = async (receiverEmail: string): Promise<{ status: number; message: string; result: number }> => {
  const response = await api.post('/api/v1/friends/request', {
    receiverEmail
  });
  return response.data;
}

// 받은 친구 요청 목록 조회
export const getReceivedFriendRequests = async (): Promise<Friend[]> => {
  const response = await api.get('/api/friends/requests/received');
  return response.data;
}

// 보낸 친구 요청 목록 조회
export const getSentFriendRequests = async (): Promise<Friend[]> => {
  const response = await api.get('/api/friends/requests/sent');
  return response.data;
} 