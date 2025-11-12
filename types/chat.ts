// API 응답 타입 정의
export interface ChatRoomBase {
    chatRoomId: number;
    name: string;
    lastMessageTime?: string; // 마지막 메시지 시간 (정렬용)
    lastReadMessageTime: string;
    unreadCount: number;
    id?: number; // 친구 채팅방의 경우 친구 멤버 id, 스터디 그룹 채팅방은 스터디 그룹 id
    // API 응답에 memberCount가 포함될 수 있으므로 선택적으로 추가
    memberCount?: number;
}

export interface FriendChatRoom extends ChatRoomBase {
    avatar: string;
    status: "online" | "offline";
}

export interface StudyGroupChatRoom extends ChatRoomBase {
    members?: { memberId: number; nickname: string; avatar: string }[];
    memberCount: number; // 스터디 그룹에는 memberCount가 필수
}

// 온라인 상태 관련 타입 정의
export interface OnlineStatus {
    memberId: number;
    isOnline: boolean;
}

export interface OnlineStatusResponse {
    status: number;
    message: string;
    result: OnlineStatus[];
}

// SSE presence 이벤트 타입 정의
export interface PresenceDto {
    memberId: number;
    isOnline: boolean;
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    result: {
        chatRooms?: T[]; // chatRooms는 선택 사항으로 변경 (메시지 API 응답에는 없을 수 있음)
        messages?: ChatMessage[]; // 메시지 목록 추가
        page?: number; // 페이지 정보 선택 사항
        nextCursor?: string | null; // 다음 커서 선택 사항
        hasNext?: boolean; // 다음 페이지 유무 선택 사항
        memberId?: number; // 단일 멤버 정보 조회 시
        nickname?: string; // 단일 멤버 정보 조회 시
        lastReadMessageTime?: string; // 단일 멤버 정보 조회 시
        me?: boolean; // 단일 멤버 정보 조회 시 (내가 본인이면 true)
        mediaIds?: string[]; // 미디어 업로드 응답 시
    };
}

// 채팅 메시지 타입 정의
export interface ChatMessage {
    id: string;
    senderId: number;
    message: string;
    mediaIds?: string[];
    createdAt: string;
}

// 메시지 렌더링 시 mediaId가 있으면 useEffect로 fetch & 표시
// (메시지 리스트 map 내부)
export interface MediaInfo {
  mediaUrl: string;
  fileName: string;
  fileSize: number;
  extension: string;
}

// 채팅방 멤버 정보 타입 정의
export interface MemberInfo {
    memberId: number;
    nickname: string;
    lastReadMessageTime: string;
    me?: boolean;   // 내가 본인이면 true (서버 필드명)
}

// 초기 채팅방 메시지 응답 타입
export interface InitChatRoomResponse {
    memberInfos: MemberInfo[];
    chatMessage: {
        messages: ChatMessage[];
        nextCursor: string | null;
        hasNext: boolean;
    };
}

// 특정 채팅방의 메시지 상태 관리용
export interface ChatRoomMessagesState {
    messages: ChatMessage[];
    nextCursor: string | null;
    hasNext: boolean;
    memberInfos: MemberInfo[];
    isLoadingMessages: boolean; // 메시지 로딩 상태 추가
}

// 업로드 파일 상태 구조 변경
export interface UploadingFile {
    file: File;
    progress: number;
    status: 'uploading' | 'done' | 'error';
    mediaId?: string;
}

// 채팅방 선택 타입
export type SelectedChatRoom = FriendChatRoom | StudyGroupChatRoom | null;

// 탭 타입
export type ChatTab = 'chat' | 'online' | 'groups'; 
