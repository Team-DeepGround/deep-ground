import { api, ApiError } from '@/lib/api-client';
import { auth } from '@/lib/auth';
import axios from 'axios';
import {
  ApiResponse,
  ChatRoomBase,
  FriendChatRoom,
  StudyGroupChatRoom,
  OnlineStatusResponse,
  ChatMessage,
  MemberInfo,
  InitChatRoomResponse,
  UploadingFile
} from '@/types/chat';

// 채팅방 목록 조회 (친구)
export const fetchFriendChatRooms = async (page: number): Promise<{
  chatRooms: FriendChatRoom[];
  hasNext: boolean;
}> => {
  const response: ApiResponse<ChatRoomBase> = await api.get('/chatrooms', {
    params: {
      type: 'FRIEND',
      page: String(page)
    }
  });
  
  console.log('fetchFriendChatRooms 원본 응답:', response);
  console.log('fetchFriendChatRooms result:', response.result);
  
  const mappedFriends: FriendChatRoom[] = (response.result.chatRooms || []).map((room) => {
    console.log('친구 채팅방 원본 데이터:', room);
    return {
      chatRoomId: room.chatRoomId,
      name: room.name,
      lastReadMessageTime: room.lastReadMessageTime,
      unreadCount: room.unreadCount,
      id: room.id,
      avatar: "/placeholder.svg?height=40&width=40",
      status: "offline", // 기본값, 온라인 상태는 별도로 업데이트
    };
  });

  return {
    chatRooms: mappedFriends,
    hasNext: response.result.hasNext || false
  };
};

// 채팅방 목록 조회 (스터디 그룹)
export const fetchStudyGroupChatRooms = async (page: number): Promise<{
  chatRooms: StudyGroupChatRoom[];
  hasNext: boolean;
}> => {
  const response: ApiResponse<ChatRoomBase> = await api.get('/chatrooms', {
    params: {
      type: 'STUDY_GROUP',
      page: String(page)
    }
  });
  
  console.log('fetchStudyGroupChatRooms 원본 응답:', response);
  console.log('fetchStudyGroupChatRooms result:', response.result);
  
  const mappedGroups: StudyGroupChatRoom[] = (response.result.chatRooms || []).map((room) => {
    console.log('스터디 그룹 채팅방 원본 데이터:', room);
    return {
      chatRoomId: room.chatRoomId,
      name: room.name,
      lastReadMessageTime: room.lastReadMessageTime,
      unreadCount: room.unreadCount,
      memberCount: room.memberCount || 0,
    };
  });

  return {
    chatRooms: mappedGroups,
    hasNext: response.result.hasNext || false
  };
};

// 온라인 상태 조회
export const fetchOnlineStatuses = async (): Promise<Record<number, boolean>> => {
  const response: OnlineStatusResponse = await api.get('/members/online');
  const statusMap: Record<number, boolean> = {};
  response.result.forEach(status => {
    statusMap[status.memberId] = status.isOnline;
  });
  return statusMap;
};

// 채팅방 멤버 정보 조회
export const fetchMemberInfo = async (chatRoomId: number, memberId: number): Promise<MemberInfo> => {
  const response: ApiResponse<any> = await api.get(`/chatrooms/${chatRoomId}/members/${memberId}`);
  return {
    memberId: response.result.memberId ?? 0,
    nickname: response.result.nickname ?? '알 수 없음',
    lastReadMessageTime: response.result.lastReadMessageTime || new Date(0).toISOString()
  };
};

// 과거 메시지 조회
export const fetchOlderMessages = async (chatRoomId: number, cursor: string): Promise<{
  messages: ChatMessage[];
  nextCursor: string | null;
  hasNext: boolean;
}> => {
  const response: ApiResponse<any> = await api.get(`/chatrooms/${chatRoomId}/messages`, {
    params: { cursor: cursor }
  });

  const fetchedMessages = response.result?.messages || [];
  const nextCursor = response.result?.nextCursor || null;
  const hasNext = response.result?.hasNext || false;

  // API 응답이 최신 메시지부터 오므로, createdAt을 기준으로 오름차순 정렬
  const olderMessages = [...fetchedMessages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return {
    messages: olderMessages,
    nextCursor,
    hasNext
  };
};

// 미디어 업로드
export const uploadFiles = async (
  chatRoomId: number, 
  files: File[], 
  onProgress?: (progress: Record<string, number>) => void
): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const token = await auth.getToken();
  
  const response = await axios.post(`/api/v1/chatrooms/${chatRoomId}/media`, formData, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        const progressObj: Record<string, number> = {};
        files.forEach((file, idx) => {
          progressObj[`${file.name}-${idx}`] = percent;
        });
        onProgress(progressObj);
      }
    },
  });
  
  return response.data.result.mediaIds;
};

// 미디어 다운로드
export const downloadMedia = async (chatRoomId: number, mediaId: string): Promise<{ url: string, contentType: string, fileName: string, fileSize: number }> => {
  const token = await auth.getToken();
  const response = await fetch(`/api/v1/chatrooms/${chatRoomId}/media/${mediaId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  if (!response.ok) {
    throw new Error("미디어 정보 조회 실패");
  }
  
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const contentType = response.headers.get('Content-Type') || '';

  // 파일명 추출
  const disposition = response.headers.get('Content-Disposition') || '';
  let fileName = '파일';
  const matchStar = disposition.match(/filename\*=UTF-8''([^;\n]*)/);
  const matchNormal = disposition.match(/filename="([^"]+)"/);
  if (matchStar) {
    fileName = decodeURIComponent(matchStar[1]);
  } else if (matchNormal) {
    fileName = matchNormal[1];
  }

  // 파일 크기 추출
  const fileSize = Number(response.headers.get('Content-Length') || '0');

  return { url, contentType, fileName, fileSize };
};
