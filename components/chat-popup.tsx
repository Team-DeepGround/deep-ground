"use client"

import React, {useState, useRef, useEffect, useCallback, useMemo} from "react"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Textarea} from "@/components/ui/textarea"
import {X, Send, ImageIcon, Paperclip, Smile, Users, MessageSquare, ArrowDown} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import {Progress} from "@/components/ui/progress"
import {AvatarGroup as UIAvatarGroup} from "@/components/ui/avatar-group"
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import axios from 'axios'

// apiClient 임포트 경로 변경
import {api, ApiError} from '@/lib/api-client'; // ApiError도 임포트
import {Client, IMessage} from '@stomp/stompjs'; // STOMP 클라이언트 임포트
import {auth} from "@/lib/auth" // auth 임포트
import { useOnlineStatus } from './online-status-provider';
import { Dialog, DialogContent } from "./ui/dialog";


// API 응답 타입 정의
interface ChatRoomBase {
    chatRoomId: number;
    name: string;
    lastReadMessageTime: string;
    unreadCount: number;
    id?: number; // 친구 채팅방의 경우 친구 멤버 id, 스터디 그룹 채팅방은 스터디 그룹 id
    // API 응답에 memberCount가 포함될 수 있으므로 선택적으로 추가
    memberCount?: number;
}

interface FriendChatRoom extends ChatRoomBase {
    avatar: string;
    status: "online" | "offline";
}

interface StudyGroupChatRoom extends ChatRoomBase {
    members: { memberId: number; nickname: string; avatar: string }[];
    memberCount: number; // 스터디 그룹에는 memberCount가 필수
}

// 온라인 상태 관련 타입 정의
interface OnlineStatus {
    memberId: number;
    isOnline: boolean;
}

interface OnlineStatusResponse {
    status: number;
    message: string;
    result: OnlineStatus[];
}

// SSE presence 이벤트 타입 정의
interface PresenceDto {
    memberId: number;
    isOnline: boolean;
}

interface ApiResponse<T> {
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
    };
}

// 채팅 메시지 타입 정의
interface ChatMessage {
    id: string;
    senderId: number;
    message: string;
    mediaIds?: string[];
    media?: MediaInfo | MediaInfo[];
    createdAt: string;
}

// 메시지 렌더링 시 mediaId가 있으면 useEffect로 fetch & 표시
// (메시지 리스트 map 내부)
interface MediaInfo {
  mediaUrl: string;
  fileName: string;
  fileSize: number;
  extension: string;
}

// 채팅방 멤버 정보 타입 정의
interface MemberInfo {
    memberId: number;
    nickname: string;
    lastReadMessageTime: string;
}

// 초기 채팅방 메시지 응답 타입
interface InitChatRoomResponse {
    memberInfos: MemberInfo[];
    chatMessage: {
        messages: ChatMessage[];
        nextCursor: string | null;
        hasNext: boolean;
    };
}

// 특정 채팅방의 메시지 상태 관리용
interface ChatRoomMessagesState {
    messages: ChatMessage[];
    nextCursor: string | null;
    hasNext: boolean;
    memberInfos: MemberInfo[];
    isLoadingMessages: boolean; // 메시지 로딩 상태 추가
}

interface ChatPopupProps {
    isOpen: boolean
    onClose: () => void
}

// 업로드 파일 상태 구조 변경
interface UploadingFile {
    file: File;
    progress: number;
    status: 'uploading' | 'done' | 'error';
    mediaId?: string;
}

// 미디어 URL 보정 함수
function getMediaUrl(url: string) {
  if (url.startsWith('/api/')) return url;
  if (url.startsWith('/')) return `/api/v1${url}`;
  return url;
}

export default function ChatPopup({isOpen, onClose}: ChatPopupProps) {
    const {toast} = useToast()
    const [friendChatRooms, setFriendChatRooms] = useState<FriendChatRoom[]>([])
    const [studyGroupChatRooms, setStudyGroupChatRooms] = useState<StudyGroupChatRoom[]>([])
    const [isLoadingChatRooms, setIsLoadingChatRooms] = useState(true)

    const [friendCurrentPage, setFriendCurrentPage] = useState(0);
    const [friendHasNext, setFriendHasNext] = useState(false);
    const [studyGroupCurrentPage, setStudyGroupCurrentPage] = useState(0);
    const [studyGroupHasNext, setStudyGroupHasNext] = useState(false);

    // 변경: selectedFriend와 selectedGroup 대신 단일 selectedChatRoom 상태 사용
    const [selectedChatRoom, setSelectedChatRoom] = useState<FriendChatRoom | StudyGroupChatRoom | null>(null);

    const [message, setMessage] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadedFiles, setUploadedFiles] = useState<UploadingFile[]>([])
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

    // activeTab 상태: 현재 세션 내에서만 기억되도록 변경
    const [activeTab, setActiveTab] = useState<string>('all'); // 기본값 'all'

    // WebSocket 및 STOMP 관련 상태
    const stompClientRef = useRef<Client | null>(null);
    const [stompClientState, setStompClientState] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null); // JWT 토큰 상태 추가
    // 현재 로그인된 멤버 ID 상태 추가
    const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);
    const [allChatRoomMessages, setAllChatRoomMessages] = useState<Record<number, ChatRoomMessagesState>>({});
    // allChatRoomMessages의 최신 값을 useRef에 저장하여 useCallback 의존성에서 제거
    const allChatRoomMessagesRef = useRef<Record<number, ChatRoomMessagesState>>({});

    // ScrollArea의 Viewport DOM 엘리먼트를 참조하기 위한 Ref -> 일반 div용으로 변경
    const scrollableDivRef = useRef<HTMLDivElement>(null);

    // 새로운 상태: 채팅방 목록이 로드되었는지 여부
    const [isFriendChatRoomsLoaded, setIsFriendChatRoomsLoaded] = useState(false);
    const [isStudyGroupChatRoomsLoaded, setIsStudyGroupChatRoomsLoaded] = useState(false);

    // 전역 온라인 상태 사용
    const { onlineStatuses, isLoading: isOnlineStatusesLoading } = useOnlineStatus();

    // 스크롤 위치 및 새 메시지 버튼 관련 상태
    const [showNewMessageToast, setShowNewMessageToast] = useState(false); // 새 메시지 토스트 상태
    // showNewMessageToast의 최신 값을 항상 참조하기 위한 ref
    const showNewMessageToastStateRef = useRef(showNewMessageToast);
    useEffect(() => {
        showNewMessageToastStateRef.current = showNewMessageToast;
    }, [showNewMessageToast]);

    const isScrolledToBottomRef = useRef(true); // useRef로 변경하여 콜백에서 최신 값 참조
    const [isChatContentVisible, setIsChatContentVisible] = useState(false); // 채팅 내용 표시 여부 (초기 로드 시 부드러운 전환)

    // 특정 채팅방에 대해 초기 /read 메시지가 전송되었는지 추적하는 Set
    const initialReadSent = useRef<Set<number>>(new Set());

    // 현재 멤버 정보를 가져오는 중인지 추적하는 Set (memberId 기준)
    const fetchingMembers = useRef<Set<number>>(new Set());
    // 정보를 가져오는 데 실패한 멤버를 추적하는 Set
    const failedMemberFetches = useRef<Set<number>>(new Set());

    // `allChatRoomMessages` 상태가 변경될 때마다 `allChatRoomMessagesRef`를 업데이트합니다.
    // 이로써 `useCallback` 내부에서 항상 최신 상태를 참조할 수 있게 됩니다.
    useEffect(() => {
        allChatRoomMessagesRef.current = allChatRoomMessages;
    }, [allChatRoomMessages]);


    // 마지막 활성 탭 상태 저장 함수 (localStorage 제거)
    const saveActiveTab = useCallback((tab: string) => {
        // console.log("Active tab changed to (in-session):", tab); // Removed log
    }, []);

    // 탭 변경 핸들러
    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab);
        saveActiveTab(tab); // 탭 변경 시 호출 (하지만 이제 실제 저장은 안함)
    }, [saveActiveTab]);


    // 친구 채팅방 목록을 가져오는 함수 (페이지네이션 적용)
    const fetchFriendChatRooms = useCallback(async (page: number) => {
        setIsLoadingChatRooms(true)
        try {
            const friendResponse: ApiResponse<ChatRoomBase> = await api.get('/chatrooms', {
                params: {
                    type: 'FRIEND',
                    page: String(page)
                }
            })
            const mappedFriends: FriendChatRoom[] = (friendResponse.result.chatRooms || []).map((room) => {
                const isOnline = room.id && onlineStatuses[room.id] === true;
                console.log(`[Friend Chat Room] Room ${room.chatRoomId}, Member ID: ${room.id}, Online Status: ${onlineStatuses[room.id]}, Is Online: ${isOnline}, OnlineStatuses:`, onlineStatuses);
                return {
                    chatRoomId: room.chatRoomId,
                    name: room.name,
                    lastReadMessageTime: room.lastReadMessageTime,
                    unreadCount: room.unreadCount,
                    id: room.id, // 친구 멤버 ID 추가
                    avatar: "/placeholder.svg?height=40&width=40",
                    status: isOnline ? "online" : "offline", // 온라인 상태 적용 (명시적으로 true 체크)
                };
            });

            setFriendChatRooms((prev) => (page === 0 ? mappedFriends : [...prev, ...mappedFriends]))
            setFriendHasNext(friendResponse.result.hasNext || false)
            setFriendCurrentPage(page)
            if (page === 0) { // 초기 페이지 로드 성공 시에만 true로 설정
                setIsFriendChatRoomsLoaded(true);
            }

            // 친구 목록을 가져온 후 온라인 상태를 다시 적용
            if (page === 0) {
                setTimeout(() => {
                    setFriendChatRooms(current => current.map(friend => ({
                        ...friend,
                        status: friend.id && onlineStatuses[friend.id] === true ? "online" : "offline"
                    })));
                }, 100);
            }

        } catch (error) {
            console.error("Failed to fetch friend chatrooms:", error)
            toast({
                title: "친구 채팅방 로드 실패",
                description: "친구 채팅방 목록을 불러오는데 실패했습니다.",
                variant: "destructive",
            })
        } finally {
            setIsLoadingChatRooms(false)
        }
    }, [toast, onlineStatuses]);

    // 스터디 그룹 채팅방 목록을 가져오는 함수 (페이지네이션 적용)
    const fetchStudyGroupChatRooms = useCallback(async (page: number) => {
        setIsLoadingChatRooms(true)
        try {
            const groupResponse: ApiResponse<ChatRoomBase> = await api.get('/chatrooms', {
                params: {
                    type: 'STUDY_GROUP',
                    page: String(page)
                }
            })
            const mappedGroups: StudyGroupChatRoom[] = (groupResponse.result.chatRooms || []).map((room) => ({
                chatRoomId: room.chatRoomId,
                name: room.name,
                lastReadMessageTime: room.lastReadMessageTime,
                unreadCount: room.unreadCount,
                memberCount: room.memberCount || 0, // memberCount 추가
                members: [ // 멤버 정보는 임시로 유지 (실제 API에서 제공될 경우 여기에 매핑)
                    {memberId: 1, nickname: "멤버1", avatar: "/placeholder.svg"},
                    {memberId: 2, nickname: "멤버2", avatar: "/placeholder.svg"},
                    {memberId: 3, nickname: "멤버3", avatar: "/placeholder.svg"},
                ],
            }))

            setStudyGroupChatRooms((prev) => (page === 0 ? mappedGroups : [...prev, ...mappedGroups]))
            setStudyGroupHasNext(groupResponse.result.hasNext || false)
            setStudyGroupCurrentPage(page)
            if (page === 0) { // 초기 페이지 로드 성공 시에만 true로 설정
                setIsStudyGroupChatRoomsLoaded(true);
            }

        } catch (error) {
            console.error("Failed to fetch study group chatrooms:", error)
            toast({
                title: "그룹 채팅방 로드 실패",
                description: "그룹 채팅방 목록을 불러오는데 실패했습니다.",
                variant: "destructive",
            })
        } finally {
            setIsLoadingChatRooms(false)
        }
    }, [toast]);

    // "더 불러오기" 버튼 클릭 핸들러 (채팅방 목록 페이지네이션)
    const handleLoadMoreChatRooms = useCallback(() => {
        if (activeTab === 'all' || activeTab === 'online') {
            if (friendHasNext && !isLoadingChatRooms) {
                fetchFriendChatRooms(friendCurrentPage + 1);
            }
        } else if (activeTab === 'groups') {
            if (studyGroupHasNext && !isLoadingChatRooms) {
                fetchStudyGroupChatRooms(studyGroupCurrentPage + 1);
            }
        }
    }, [activeTab, friendHasNext, studyGroupHasNext, isLoadingChatRooms, friendCurrentPage, studyGroupCurrentPage, fetchFriendChatRooms, fetchStudyGroupChatRooms]);

    // 온라인 상태를 가져오는 함수
    const fetchOnlineStatuses = useCallback(async () => {
        console.log('[Online Status] Starting to fetch online statuses...');
        try {
            const response: OnlineStatusResponse = await api.get('/members/online');
            const statusMap: Record<number, boolean> = {};
            response.result.forEach(status => {
                statusMap[status.memberId] = status.isOnline;
            });
            setOnlineStatuses(statusMap);
            console.log('[Online Status] Successfully fetched online statuses:', statusMap);
            console.log('[Online Status] Online statuses loaded count:', Object.keys(statusMap).length);
        } catch (error) {
            console.error('Failed to fetch online statuses:', error);
        }
    }, []);

    // 멤버 정보를 가져와 상태에 추가하는 함수
    const fetchAndAddMemberInfo = useCallback(async (chatRoomId: number, memberId: number) => {
        // 이미 fetching 중이거나 이미 존재하는 멤버인 경우 중복 호출 방지
        if (fetchingMembers.current.has(memberId)) {
            console.log(`[Member Fetch] Member ${memberId} in room ${chatRoomId} already being fetched.`);
            return;
        }
        // 정보를 가져오는 데 실패한 멤버인 경우 중복 호출 방지
        if (failedMemberFetches.current.has(memberId)) {
            console.log(`[Member Fetch] Member ${memberId} in room ${chatRoomId} previously failed to fetch, skipping.`);
            return;
        }

        // 현재 상태에서 해당 멤버가 이미 있는지 확인 (ref를 통해 최신 값 접근)
        const currentRoomState = allChatRoomMessagesRef.current[chatRoomId];
        if (currentRoomState && currentRoomState.memberInfos.some(m => m.memberId === memberId)) {
            console.log(`[Member Fetch] Member ${memberId} in room ${chatRoomId} already exists in state, skipping fetch.`);
            return;
        }

        fetchingMembers.current.add(memberId); // fetching 중임을 표시

        try {
            console.log(`[Member Fetch] Fetching info for member ${memberId} in chat room ${chatRoomId}.`);
            const response: ApiResponse<any> = await api.get(`/chatrooms/${chatRoomId}/members/${memberId}`);
            const newMemberInfo: MemberInfo = {
                memberId: response.result.memberId ?? 0,
                nickname: response.result.nickname ?? '알 수 없음',
                lastReadMessageTime: response.result.lastReadMessageTime || new Date(0).toISOString()
            };

            setAllChatRoomMessages(prevAllRooms => {
                const roomState = prevAllRooms[chatRoomId];
                if (roomState) {
                    // 이미 있으면 추가하지 않음
                    if (!roomState.memberInfos.some(m => m.memberId === newMemberInfo.memberId)) {
                        return {
                            ...prevAllRooms,
                            [chatRoomId]: {
                                ...roomState,
                                memberInfos: [...roomState.memberInfos, newMemberInfo],
                            }
                        };
                    }
                }
                return prevAllRooms;
            });
            console.log(`[Member Fetch] Successfully fetched and added member ${memberId}:`, newMemberInfo);

        } catch (error) {
            console.error(`Failed to fetch member ${memberId} for room ${chatRoomId}:`, error);
            // API 요청이 실패한 경우 failedMemberFetches에 추가
            if (error instanceof ApiError && (error.status === 404 || error.status === 400)) { // 400 Bad Request도 추가 (백엔드 응답에 따라)
                failedMemberFetches.current.add(memberId);
                console.log(`[Member Fetch] Added member ${memberId} to failedMemberFetches due to API error.`);
            }
            // toast({
            //     title: "멤버 정보 로드 실패",
            //     description: `멤버 ID ${memberId}의 정보를 불러오는데 실패했습니다.`,
            //     variant: "destructive",
            // });
        } finally {
            fetchingMembers.current.delete(memberId); // fetching 완료 (성공/실패 무관)
        }
    }, [toast]);


    // 선택된 채팅방의 메시지 및 멤버 정보를 가져오는 함수
    const loadChatRoomMessages = useCallback(async (chatRoomId: number) => {
        console.log(`[FUNCTION: loadChatRoomMessages] Called for chatRoomId: ${chatRoomId}`);
        setIsChatContentVisible(false); // 메시지 로드 시작 시 내용 숨김
        setAllChatRoomMessages(prev => ({
            ...prev,
            [chatRoomId]: {
                ...prev[chatRoomId],
                isLoadingMessages: true,
                messages: prev[chatRoomId]?.messages || [], // 기존 메시지 유지 또는 빈 배열로 초기화
                memberInfos: prev[chatRoomId]?.memberInfos || [], // 기존 멤버 정보 유지
            }
        }));

        // WebSocket을 통한 초기 메시지 로드 (stompClientState가 연결되어 있을 때만 실행)
        if (stompClientState && isConnected) {
            // 초기 메시지 구독 (destination: /app/chatrooms/{chatRoomId}/init)
            stompClientState.subscribe(`/app/chatrooms/${chatRoomId}/init`, (message: IMessage) => {
                try {
                    const res: InitChatRoomResponse = JSON.parse(message.body);
                    setAllChatRoomMessages(prev => {
                        const newState = {
                            ...prev,
                            [chatRoomId]: {
                                messages: [...res.chatMessage.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
                                nextCursor: res.chatMessage.nextCursor,
                                hasNext: res.chatMessage.hasNext,
                                memberInfos: res.memberInfos,
                                isLoadingMessages: false,
                            }
                        };
                        // latestMessage 계산
                        const sortedMessages = [...res.chatMessage.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                        const latestMessage = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : null;
                        // 최초 1회만 /read 전송
                        if (latestMessage && !initialReadSent.current.has(chatRoomId)) {
                            stompClientState.publish({
                                destination: `/app/chatrooms/${chatRoomId}/read`,
                                body: JSON.stringify({ lastReadMessageTime: latestMessage.createdAt }),
                            });
                            initialReadSent.current.add(chatRoomId);
                        }
                        // 메시지 로드 후 스크롤을 맨 아래로 즉시 이동
                        requestAnimationFrame(() => {
                            if (messagesEndRef.current && scrollableDivRef.current) {
                                scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
                                setIsChatContentVisible(true);
                                isScrolledToBottomRef.current = true;
                            }
                        });
                        return newState;
                    });
                    // setState 이후, 멤버 정보 없는 senderId에 대해 fetchAndAddMemberInfo 호출
                    const allSenderIds = new Set(res.chatMessage.messages.map(msg => msg.senderId));
                    const knownMemberIds = new Set(res.memberInfos.map(m => m.memberId));
                    allSenderIds.forEach(senderId => {
                        if (!knownMemberIds.has(senderId)) {
                            fetchAndAddMemberInfo(chatRoomId, senderId);
                        }
                    });
                } catch (error) {
                    console.error("Error parsing init message in callback:", error);
                    toast({
                        title: "채팅 초기화 실패",
                        description: "채팅 메시지를 불러오는데 실패했습니다.",
                        variant: "destructive",
                    });
                    setAllChatRoomMessages(prev => ({
                        ...prev,
                        [chatRoomId]: {...prev[chatRoomId], isLoadingMessages: false}
                    }));
                    setIsChatContentVisible(true); // 에러 발생 시에도 내용 표시 (로딩 메시지 등)
                }
            }, { 'id': `init-sub-${chatRoomId}` });

            // 새 메시지 수신용 구독 (destination: /topic/chatrooms/{chatRoomId}/message)
            stompClientState.subscribe(`/topic/chatrooms/${chatRoomId}/message`, (message: IMessage) => {
                try {
                    const newMessage: ChatMessage = JSON.parse(message.body);
                    console.log(`[STOMP Receive] /topic/chatrooms/${chatRoomId}/message:`, newMessage);

                    setAllChatRoomMessages(prev => {
                        const currentRoomState = prev[chatRoomId];
                        if (currentRoomState) {
                            // senderId가 memberInfos에 없으면 fetch
                            if (!currentRoomState.memberInfos.some(m => m.memberId === newMessage.senderId)) {
                                fetchAndAddMemberInfo(chatRoomId, newMessage.senderId);
                            }
                            // 중복 메시지 방지
                            if (currentRoomState.messages.some(msg => msg.id === newMessage.id)) {
                                return prev;
                            }
                            // 새 메시지가 추가되기 전의 스크롤 위치 상태를 저장
                            const wasScrolledToBottom = isScrolledToBottomRef.current;
                            // 최신 메시지일 때만 /read 전송 (내가 보낸 메시지가 아니고, 최신 메시지일 때)
                            const isLatest = true; // 실시간 메시지는 항상 최신
                            if (newMessage.senderId !== currentMemberId && isLatest) {
                                stompClientState.publish({
                                    destination: `/app/chatrooms/${chatRoomId}/read`,
                                    body: JSON.stringify({ lastReadMessageTime: newMessage.createdAt }),
                                });
                            }
                            // 메시지 추가
                            const newState = {
                                ...prev,
                                [chatRoomId]: {
                                    ...currentRoomState,
                                    messages: [...currentRoomState.messages, newMessage],
                                }
                            };
                            // DOM 업데이트가 반영될 다음 프레임에서 스크롤 및 토스트 로직 실행
                            setTimeout(() => {
                                const currentScrollableDiv = scrollableDivRef.current;
                                if (currentScrollableDiv) {
                                    const { scrollHeight: newScrollHeight, clientHeight: newClientHeight } = currentScrollableDiv;
                                    const isNowScrollable = newScrollHeight > newClientHeight;
                                    // 내가 보낸 메시지이거나, 스크롤이 맨 아래였으면 자동 스크롤
                                    if (newMessage.senderId === currentMemberId) {
                                        currentScrollableDiv.scrollTo({ top: currentScrollableDiv.scrollHeight, behavior: "smooth" });
                                        setShowNewMessageToast(false);
                                    } else {
                                        if (wasScrolledToBottom || !isNowScrollable) {
                                            currentScrollableDiv.scrollTo({ top: currentScrollableDiv.scrollHeight, behavior: "smooth" });
                                            setShowNewMessageToast(false);
                                        } else {
                                            setShowNewMessageToast(true);
                                        }
                                    }
                                }
                            }, 0);
                            return newState;
                        }
                        return prev;
                    });
                } catch (error) {
                    console.error("Error parsing new message:", error);
                }
            }, { 'id': `live-sub-${chatRoomId}` });

            // --- Add new subscription for /read-receipt ---
            stompClientState.subscribe(`/topic/chatrooms/${chatRoomId}/read-receipt`, (message: IMessage) => {
                try {
                    const readReceipt: { memberId: number; lastReadMessageTime: string } = JSON.parse(message.body);
                    console.log(`[STOMP Receive] /topic/chatrooms/${chatRoomId}/read-receipt:`, readReceipt);

                    setAllChatRoomMessages(prev => {
                        const currentRoomState = prev[chatRoomId];
                        if (currentRoomState) {
                            // memberId가 memberInfos에 없으면 fetch
                            if (!currentRoomState.memberInfos.some(m => m.memberId === readReceipt.memberId)) {
                                fetchAndAddMemberInfo(chatRoomId, readReceipt.memberId);
                            }
                            const updatedMemberInfos = currentRoomState.memberInfos.map(member =>
                                member.memberId === readReceipt.memberId
                                    ? {...member, lastReadMessageTime: readReceipt.lastReadMessageTime}
                                    : member
                            );
                            return {
                                ...prev,
                                [chatRoomId]: {
                                    ...currentRoomState,
                                    memberInfos: updatedMemberInfos,
                                }
                            };
                        }
                        return prev;
                    });
                } catch (error) {
                    console.error("Error parsing read receipt message:", error);
                }
            }, {'id': `read-receipt-sub-${chatRoomId}`});

        }
    }, [stompClientState, isConnected, toast, currentMemberId, fetchAndAddMemberInfo]);


    // 과거 메시지를 불러오는 함수
    const loadOlderMessages = useCallback(async (chatRoomId: number, cursor: string) => {
        // 메시지 로드 전 현재 스크롤 위치와 스크롤 높이 저장
        const viewport = scrollableDivRef.current; // Ref 이름 변경
        const oldScrollHeight = viewport ? viewport.scrollHeight : 0;
        const oldScrollTop = viewport ? viewport.scrollTop : 0;

        setAllChatRoomMessages(prev => ({
            ...prev,
            [chatRoomId]: {
                ...prev[chatRoomId],
                isLoadingMessages: true,
            }
        }));

        try {
            const response: ApiResponse<any> = await api.get(`/chatrooms/${chatRoomId}/messages`, {params: {cursor: cursor}});

            // 'messages' 배열이 'result' 객체 바로 아래에 있다고 가정
            const fetchedMessages = response.result?.messages || [];
            const nextCursor = response.result?.nextCursor || null;
            const hasNext = response.result?.hasNext || false;

            // API 응답이 최신 메시지부터 오므로, createdAt을 기준으로 오름차순 정렬 (오래된 메시지가 위에 오도록)
            const olderMessages = [...fetchedMessages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            setAllChatRoomMessages(prev => {
                const currentRoomState = prev[chatRoomId];
                if (currentRoomState) {
                    // 가져온 이전 메시지의 senderId 중 현재 memberInfos에 없는 멤버 정보 요청
                    olderMessages.forEach(msg => {
                        if (!currentRoomState.memberInfos.some(m => m.memberId === msg.senderId)) {
                            fetchAndAddMemberInfo(chatRoomId, msg.senderId);
                        }
                    });

                    // 기존 메시지의 맨 앞에 새로운 (더 오래된) 메시지들을 추가합니다.
                    const updatedMessages = [...olderMessages, ...currentRoomState.messages];
                    return {
                        ...prev,
                        [chatRoomId]: {
                            ...currentRoomState,
                            messages: updatedMessages,
                            nextCursor: nextCursor,
                            hasNext: hasNext,
                            isLoadingMessages: false,
                        }
                    };
                }
                return prev;
            });

            // DOM 업데이트가 완료된 후 스크롤 위치 조정
            requestAnimationFrame(() => {
                if (viewport) {
                    const newScrollHeight = viewport.scrollHeight;
                    const scrollDiff = newScrollHeight - oldScrollHeight;
                    viewport.scrollTop = oldScrollTop + scrollDiff;
                }
            });

            console.log(`[API Call] Older messages for chatRoom ${chatRoomId}:`, olderMessages);
        } catch (error) {
            console.error("Failed to load older messages:", error);
            toast({
                title: "이전 메시지 로드 실패",
                description: "이전 채팅 메시지를 불러오는데 실패했습니다.",
                variant: "destructive",
            });
        } finally {
            setAllChatRoomMessages(prev => ({
                ...prev,
                [chatRoomId]: {...prev[chatRoomId], isLoadingMessages: false}
            }));
        }
    }, [toast, fetchAndAddMemberInfo]);


    // 팝업이 열릴 때 초기 상태 설정 및 인증 정보 가져오기
    useEffect(() => {
        if (isOpen) {
            setSelectedChatRoom(null);
            setSearchTerm("");
            setIsChatContentVisible(false);

            // 인증 토큰 및 멤버 ID 가져오기
            const fetchAuthDetails = async () => {
                try {
                    const token = await auth.getToken();
                    const memberId = await auth.getMemberId();
                    setAuthToken(token);
                    setCurrentMemberId(memberId);
                    console.log("[Auth] Token fetched:", token ? "exists" : "null", "Member ID:", memberId);
                } catch (error) {
                    console.error("Failed to get auth token or member ID on popup open:", error);
                    toast({
                        title: "인증 정보 로드 실패",
                        description: "로그인 상태를 확인해주세요.",
                        variant: "destructive",
                    });
                }
            };
            fetchAuthDetails();

        } else { // 팝업이 닫힐 때 모든 상태 초기화
            setSelectedChatRoom(null);
            setSearchTerm("");
            setFriendChatRooms([]);
            setStudyGroupChatRooms([]);
            setIsLoadingChatRooms(true);
            setFriendCurrentPage(0);
            setFriendHasNext(false);
            setStudyGroupCurrentPage(0);
            setStudyGroupHasNext(false);
            setAuthToken(null);
            setCurrentMemberId(null);
            setIsFriendChatRoomsLoaded(false);
            setIsStudyGroupChatRoomsLoaded(false);

            setShowNewMessageToast(false);
            isScrolledToBottomRef.current = true;
            setIsChatContentVisible(false);

            if (stompClientRef.current && stompClientRef.current.connected) {
                console.log("[STOMP] WebSocket 연결 해제 (팝업 닫힘)");
                Object.keys(stompClientRef.current.subscriptions || {}).forEach(subId => {
                    stompClientRef.current?.unsubscribe(subId);
                    console.log(`[STOMP] Unsubscribed on popup close: ${subId}`);
                });
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
                setStompClientState(null);
                setIsConnected(false);
            }
            setAllChatRoomMessages({});
            initialReadSent.current.clear(); // 팝업이 닫힐 때 초기 읽음 확인 기록 초기화
            fetchingMembers.current.clear(); // 팝업이 닫힐 때 멤버 fetching 기록 초기화
            failedMemberFetches.current.clear(); // 팝업이 닫힐 때 실패한 멤버 fetching 기록 초기화
        }
    }, [isOpen, toast]);

    // SSE presence 이벤트 처리
    useEffect(() => {
        const handlePresenceUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            const presenceData: PresenceDto = customEvent.detail;
            console.log('[Presence Update] Received:', presenceData);
            console.log('[Presence Update] Current onlineStatuses before update:', onlineStatuses);
            
            // 전역 Context에서 온라인 상태 업데이트 (OnlineStatusProvider에서 처리됨)

            // 해당 친구의 온라인 상태만 즉시 업데이트
            setFriendChatRooms(prev => prev.map(friend => {
                if (friend.id === presenceData.memberId) {
                    const newStatus = presenceData.isOnline === true ? "online" : "offline";
                    console.log(`[Presence Update] Updating friend ${friend.name} (ID: ${friend.id}) status to: ${newStatus}`);
                    return {
                        ...friend,
                        status: newStatus
                    };
                }
                return friend;
            }));

            // 선택된 채팅방이 해당 친구의 채팅방이면 선택된 채팅방의 상태도 업데이트
            setSelectedChatRoom(prev => {
                if (prev && 'status' in prev && prev.id === presenceData.memberId) {
                    const newStatus = presenceData.isOnline === true ? "online" : "offline";
                    console.log(`[Presence Update] Updating selected chat room status to: ${newStatus}`);
                    return {
                        ...prev,
                        status: newStatus
                    };
                }
                return prev;
            });
        };

        // 전역 이벤트 리스너 등록
        window.addEventListener('presence-update', handlePresenceUpdate);

        return () => {
            window.removeEventListener('presence-update', handlePresenceUpdate);
        };
    }, [isOpen, onlineStatuses]);

    // 온라인 상태가 로드된 후 친구 채팅방 목록 로드
    useEffect(() => {
        if (isOpen && authToken && currentMemberId && !isOnlineStatusesLoading) {
            if (activeTab === 'all' || activeTab === 'online') {
                if (!isFriendChatRoomsLoaded) {
                    setFriendCurrentPage(0);
                    setFriendHasNext(false);
                    fetchFriendChatRooms(0);
                }
            }
        }
    }, [isOpen, activeTab, authToken, currentMemberId, isOnlineStatusesLoading, isFriendChatRoomsLoaded, fetchFriendChatRooms]);

    // 인증 정보 및 활성 탭에 따라 채팅방 목록을 처음으로 불러오기 (스터디 그룹용)
    useEffect(() => {
        if (isOpen && authToken !== null && currentMemberId !== null) {
            if (activeTab === 'groups') {
                if (!isStudyGroupChatRoomsLoaded) {
                    setStudyGroupCurrentPage(0);
                    setStudyGroupHasNext(false);
                    fetchStudyGroupChatRooms(0);
                }
            }
        }
    }, [
        isOpen, activeTab, authToken, currentMemberId, // 인증 정보가 준비되면 트리거
        isStudyGroupChatRoomsLoaded,
        fetchStudyGroupChatRooms
    ]);

    // WebSocket 클라이언트 인스턴스 생성/파괴 및 연결 상태 관리
    useEffect(() => {
        const shouldClientExistAndBeConnected = isOpen && authToken !== null && currentMemberId !== null;

        if (shouldClientExistAndBeConnected && (!stompClientRef.current || !stompClientRef.current.connected)) {
            console.log("[STOMP Lifecycle] Initiating new WebSocket connection...");
            const wsUrl = `ws://localhost:8080/api/v1/ws`;

            const client = new Client({
                brokerURL: wsUrl,
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                debug: (str) => console.log(`[STOMP DEBUG] ${str}`), // Debug log for STOMP
                connectHeaders: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            client.onConnect = () => {
                setIsConnected(true);
                stompClientRef.current = client;
                setStompClientState(client);
                console.log('[STOMP Lifecycle] STOMP 연결 성공');
            };

            client.onStompError = (frame) => {
                console.error('[STOMP Lifecycle] Broker reported STOMP error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
                setIsConnected(false);
                stompClientRef.current = null;
                setStompClientState(null);
                toast({
                    title: "채팅 서버 연결 오류",
                    description: "채팅 서버와의 연결에 문제가 발생했습니다.",
                    variant: "destructive",
                });
            };

            client.onWebSocketClose = () => {
                console.log('[STOMP Lifecycle] WebSocket 연결 종료');
                setIsConnected(false);
                stompClientRef.current = null;
                setStompClientState(null);
            };

            client.activate();
            console.log("[STOMP Lifecycle] New STOMP client activated.");

            return () => {
                if (client.connected) {
                    console.log("[STOMP Lifecycle] WebSocket Client Cleanup: Deactivating client on effect re-run/unmount.");
                    Object.keys(client.subscriptions || {}).forEach(subId => client.unsubscribe(subId));
                    client.deactivate();
                }
            };
        } else if (!shouldClientExistAndBeConnected && stompClientRef.current && stompClientRef.current.connected) {
            console.log("[STOMP Lifecycle] Deactivating WebSocket client: Conditions no longer met (popup closed or token/memberId missing).");
            Object.keys(stompClientRef.current.subscriptions || {}).forEach(subId => stompClientRef.current?.unsubscribe(subId));
            stompClientRef.current.deactivate();
            stompClientRef.current = null;
            setStompClientState(null);
            setIsConnected(false);
        }
    }, [isOpen, authToken, currentMemberId, toast]);


    // STOMP 구독 관리 (stompClientState와 isConnected, selectedChatRoom 변경에 반응)
    useEffect(() => {
        const currentChatRoomId = selectedChatRoom?.chatRoomId;

        if (stompClientState && isConnected && currentChatRoomId) {
            console.log(`[STOMP Subscribe Effect] Attempting to subscribe to chat room ${currentChatRoomId}`);

            // 이전 채팅방 구독 해제 (새 채팅방 선택 시)
            Object.keys(stompClientRef.current.subscriptions || {}).forEach(subId => {
                if (subId.startsWith('init-sub-') || subId.startsWith('live-sub-') || subId.startsWith('read-receipt-sub-')) {
                    stompClientRef.current?.unsubscribe(subId);
                    console.log(`[STOMP] Unsubscribed previous room: ${subId}`);
                }
            });

            loadChatRoomMessages(currentChatRoomId); // 새 채팅방 메시지 로드 및 구독 시작

            // Cleanup for this specific subscription (when selectedChatRoom changes or component unmounts)
            return () => {
                if (stompClientRef.current && stompClientRef.current.connected) {
                    console.log(`[STOMP Subscribe Effect] Unsubscribing from chat room ${currentChatRoomId} on cleanup.`);
                    stompClientRef.current.unsubscribe(`init-sub-${currentChatRoomId}`);
                    stompClientRef.current.unsubscribe(`live-sub-${currentChatRoomId}`);
                    stompClientRef.current.unsubscribe(`read-receipt-sub-${currentChatRoomId}`);
                    initialReadSent.current.delete(currentChatRoomId); // 해당 채팅방의 초기 읽음 확인 기록 삭제
                }
            };
        } else {
            // 조건이 충족되지 않으면 모든 채팅방 관련 구독 해제
            if (stompClientRef.current && stompClientRef.current.connected) {
                console.log("[STOMP Subscribe Effect] Conditions not met for subscription. Clearing all specific room subs.");
                Object.keys(stompClientRef.current.subscriptions || {}).forEach(subId => {
                    if (subId.startsWith('init-sub-') || subId.startsWith('live-sub-') || subId.startsWith('read-receipt-sub-')) {
                        stompClientRef.current.unsubscribe(subId);
                    }
                });
                // 초기 읽음 확인 기록도 모두 지워야 할 경우: initialReadSent.current.clear();
            }
        }
    }, [stompClientState, isConnected, selectedChatRoom, loadChatRoomMessages]);


    // 친구 검색 필터링 (친구 이름만으로 검색)
    const filteredFriends = friendChatRooms.filter(
        (friend) =>
            friend.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // 업로드 중 상태 추가
    const [isUploading, setIsUploading] = useState(false);

    async function uploadFiles(chatRoomId: number, files: File[], setUploadProgress: (progress: Record<string, number>) => void): Promise<string[]> {
        setIsUploading(true);
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        const token = await auth.getToken();
        let lastProgress = 0;
        try {
            const response = await axios.post(`/api/v1/chatrooms/${chatRoomId}/media`, formData, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        // 모든 파일에 동일한 진행률을 적용 (단일 요청이므로)
                        const progressObj: Record<string, number> = {};
                        files.forEach((file, idx) => {
                            progressObj[`${file.name}-${idx}`] = percent;
                        });
                        setUploadProgress(progressObj);
                        lastProgress = percent;
                    }
                },
            });
            // 업로드 완료 시 100%로 맞춤
            const progressObj: Record<string, number> = {};
            files.forEach((file, idx) => {
                progressObj[`${file.name}-${idx}`] = 100;
            });
            setUploadProgress(progressObj);
            return response.data.result.mediaIds;
        } finally {
            setIsUploading(false);
        }
    }

    // 메시지 전송 핸들러
    const handleSendMessage = async () => {
        if (!message.trim() && uploadedFiles.length === 0) return;
        if (!stompClientState || !isConnected || currentMemberId === null) {
            toast({
                title: "채팅 서버 연결 끊김",
                description: "채팅 서버에 연결되어 있지 않거나 사용자 정보가 없습니다. 잠시 후 다시 시도해주세요.",
                variant: "destructive",
            });
            return;
        }
        const currentChatRoomId = selectedChatRoom?.chatRoomId;
        if (!currentChatRoomId) return;

        let mediaIds: string[] = [];
        if (uploadedFiles.length > 0) {
            try {
                mediaIds = await uploadFiles(currentChatRoomId, uploadedFiles.map(f => f.file), setUploadProgress);
            } catch (error) {
                toast({
                    title: "파일 업로드 실패",
                    description: "파일 업로드 중 오류가 발생했습니다.",
                    variant: "destructive",
                });
                return;
            }
        }

        const chatMessagePayload = {
            message: message.trim(),
            mediaIds,
        };

        try {
            stompClientState.publish({
                destination: `/app/chatrooms/${currentChatRoomId}/message`,
                body: JSON.stringify(chatMessagePayload),
            });
            setMessage("");
            setUploadedFiles([]);
            setUploadProgress({});
        } catch (error) {
            console.error("메시지 전송 실패:", error);
            toast({
                title: "메시지 전송 실패",
                description: "메시지를 보내는 도중 오류가 발생했습니다.",
                variant: "destructive",
            });
        }
    };

    // 파일 업로드 클릭 핸들러
    const handleFileUpload = () => {
        fileInputRef.current?.click()
    }

    // 파일 변경 핸들러
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            for (const file of newFiles) {
                const uploadingFile: UploadingFile = { file, progress: 0, status: 'uploading' };
                setUploadedFiles(prev => [...prev, uploadingFile]);
                // 업로드 시작
                try {
                    console.log(`[UPLOAD] ${file.name} 업로드 시작`);
                    const formData = new FormData();
                    formData.append('files', file);
                    const token = await auth.getToken();
                    const response = await axios.post(`/api/v1/chatrooms/${selectedChatRoom?.chatRoomId}/media`, formData, {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.total) {
                                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                setUploadedFiles(prev => prev.map(f =>
                                    (f.file.name === file.name && f.file.size === file.size) ? { ...f, progress: percent } : f
                                ));
                                console.log(`[UPLOAD] ${file.name} 진행률: ${percent}%`);
                            }
                        },
                    });
                    const mediaId = response.data.result.mediaIds[0];
                    setUploadedFiles(prev => prev.map(f =>
                        (f.file.name === file.name && f.file.size === file.size) ? { ...f, progress: 100, status: 'done', mediaId } : f
                    ));
                    console.log(`[UPLOAD] ${file.name} 업로드 완료, mediaId: ${mediaId}`);
                } catch (error) {
                    setUploadedFiles(prev => prev.map(f =>
                        (f.file.name === file.name && f.file.size === file.size) ? { ...f, status: 'error' } : f
                    ));
                    console.log(`[UPLOAD] ${file.name} 업로드 실패`, error);
                    toast({
                        title: '파일 업로드 실패',
                        description: `${file.name} 업로드에 실패했습니다.`,
                        variant: 'destructive',
                    });
                }
            }
        }
        if (e.target) {
            e.target.value = "";
        }
    };

    // 파일 제거 핸들러
    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // "더 불러오기" 버튼 클릭 핸들러 (과거 메시지 로드)
    const handleLoadMoreMessages = () => {
        const currentChatRoomId = selectedChatRoom?.chatRoomId;
        if (currentChatRoomId) {
            const chatRoomState = allChatRoomMessages[currentChatRoomId];
            if (chatRoomState?.hasNext && chatRoomState.nextCursor && !chatRoomState.isLoadingMessages) {
                loadOlderMessages(currentChatRoomId, chatRoomState.nextCursor);
            }
        }
    };

    // 날짜 비교 헬퍼 함수
    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    // 날짜 포맷 헬퍼 함수
    const formatDateForSeparator = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (isSameDay(date, today)) {
            return "오늘";
        } else if (isSameDay(date, yesterday)) {
            return "어제";
        } else {
            return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
        }
    };


    // 현재 선택된 채팅방의 메시지 및 상태 가져오기
    const currentChatRoomState = selectedChatRoom
        ? allChatRoomMessages[selectedChatRoom.chatRoomId]
        : undefined;

    // displayMessages useMemo로 최적화
    const displayMessages = useMemo(() => {
      if (!selectedChatRoom) return [];
      const chatRoomId = selectedChatRoom.chatRoomId;
      return allChatRoomMessages[chatRoomId]?.messages || [];
    }, [allChatRoomMessages, selectedChatRoom]);

    const displayMemberInfos = currentChatRoomState?.memberInfos || [];
    const currentChatHasNext = currentChatRoomState?.hasNext || false;
    const currentChatIsLoading = currentChatRoomState?.isLoadingMessages || false;

    // 스크롤 이벤트 핸들러: 스크롤이 맨 아래에 있는지 확인하고 상태 업데이트
    const handleScroll = useCallback(() => {
        if (scrollableDivRef.current) {
            const {scrollTop, scrollHeight, clientHeight} = scrollableDivRef.current;
            // 스크롤이 맨 아래에서 10px 이내이면 'atBottom'으로 간주합니다.
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            const atBottom = distanceFromBottom <= 10;

            isScrolledToBottomRef.current = atBottom;

            // showNewMessageToastStateRef.current를 사용하여 최신 상태에 접근
            if (atBottom && showNewMessageToastStateRef.current) {
                setShowNewMessageToast(false); // setState 함수는 안정적이므로 ref 필요 없음
            }
        }
    }, []); // 빈 배열을 사용하여 handleScroll 콜백을 안정적으로 유지

    // 네이티브 WheelEvent용 핸들러 (addEventListener용)
    const handleWheelNative = useCallback((e: WheelEvent) => {
        const target = e.currentTarget as HTMLDivElement;
        if (!target) return;
        const isAtTop = target.scrollTop === 0;
        const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight;
        // 맨 위/아래에서만 preventDefault, 그 외에는 기본 스크롤 허용
        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
            e.preventDefault();
            e.stopPropagation();
        }
        // 그 외에는 기본 스크롤 허용
    }, []);


    // 스크롤 이벤트 리스너 등록 및 해제
    useEffect(() => {
        const scrollElement = scrollableDivRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', handleScroll, { passive: true });
            scrollElement.addEventListener('wheel', handleWheelNative, { passive: false });
            handleScroll();
            return () => {
                scrollElement.removeEventListener('scroll', handleScroll);
                scrollElement.removeEventListener('wheel', handleWheelNative);
            };
        } else {
            console.warn(`scrollableDivRef.current is null, cannot attach listener. selectedChatRoom: ${selectedChatRoom?.chatRoomId || 'null'}`);
        }
    }, [handleScroll, handleWheelNative, selectedChatRoom]);

    useEffect(() => {
        if (selectedChatRoom) {
            (window as any).currentChatRoomId = selectedChatRoom.chatRoomId
        } else {
            (window as any).currentChatRoomId = null
        }
    }, [selectedChatRoom])

    // SSE unreadCount 이벤트로 채팅방 외부 새 메시지 알림 토스트 표시
    useEffect(() => {
        function handleChatUnreadToast(e: any) {
            const { chatRoomId, unreadCount } = e.detail || {}
            // 친구 채팅방 목록에서 unreadCount 갱신
            setFriendChatRooms(prev => prev.map(room =>
                room.chatRoomId === chatRoomId ? { ...room, unreadCount } : room
            ))
            // 그룹 채팅방 목록에서 unreadCount 갱신
            setStudyGroupChatRooms(prev => prev.map(room =>
                room.chatRoomId === chatRoomId ? { ...room, unreadCount } : room
            ))
            toast({
                title: '새 메시지',
                description: '새 메시지가 도착했습니다.',
                duration: 5000,
            })
        }
        window.addEventListener('chat-unread-toast', handleChatUnreadToast)
        return () => {
            window.removeEventListener('chat-unread-toast', handleChatUnreadToast)
        }
    }, [toast])

    useEffect(() => {
        if (selectedChatRoom) {
            // 진입한 채팅방의 unreadCount를 0으로 갱신
            setFriendChatRooms(prev => prev.map(room =>
                room.chatRoomId === selectedChatRoom.chatRoomId ? { ...room, unreadCount: 0 } : room
            ))
            setStudyGroupChatRooms(prev => prev.map(room =>
                room.chatRoomId === selectedChatRoom.chatRoomId ? { ...room, unreadCount: 0 } : room
            ))
        }
    }, [selectedChatRoom])

    // 상태 추가
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showEmojiPicker) return;
        function handleClickOutside(event: MouseEvent) {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target as Node)
            ) {
                setShowEmojiPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showEmojiPicker]);

    // 모든 훅 선언부 위쪽에 위치
    useEffect(() => {
        if (!isOpen) {
            setUploadedFiles([]);
        }
    }, [isOpen]);

    // 채팅방 UI가 열릴 때 onlineStatuses 정보를 친구 목록에 즉시 반영
    useEffect(() => {
        if (isOpen && friendChatRooms.length > 0) {
            console.log('[Online Status Update] Updating friend chat rooms with online statuses:', onlineStatuses);
            setFriendChatRooms(prev => prev.map(friend => {
                const isOnline = friend.id && onlineStatuses[friend.id] === true;
                console.log(`[Online Status Update] Friend ${friend.name} (ID: ${friend.id}), Online Status: ${onlineStatuses[friend.id]}, Is Online: ${isOnline}`);
                return {
                    ...friend,
                    status: isOnline ? "online" : "offline"
                };
            }));
        }
    }, [isOpen, onlineStatuses, friendChatRooms.length]);

    // 메시지 렌더링 시 mediaId가 있으면 useEffect로 fetch & 표시
    // (메시지 리스트 map 내부)
    const [mediaInfos, setMediaInfos] = useState<Record<string, MediaInfo>>({});

    useEffect(() => {
      if (!selectedChatRoom) return;
      const chatRoomId = selectedChatRoom.chatRoomId;
      allChatRoomMessages[chatRoomId]?.messages.forEach((msg) => {
        if (!msg.mediaIds || !msg.media || !Array.isArray(msg.media) || msg.mediaIds.length !== msg.media.length) return;
        msg.mediaIds.forEach(async (id, idx) => {
          if (!mediaInfos[id]) {
            try {
              const token = await auth.getToken();
              const response = await fetch(`/api/v1/chatrooms/${chatRoomId}/media/${id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              if (!response.ok) throw new Error("미디어 정보 조회 실패");
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              setMediaInfos((prev) => ({
                ...prev,
                [id]: url,
              }));
            } catch (e) {
              // 실패 시 무시
            }
          }
        });
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChatRoom, allChatRoomMessages]);

    // 1. 스크롤 이벤트 핸들러 등록 (최상단 useEffect들 근처에 추가)
    useEffect(() => {
      const handleScroll = () => {
        if (!scrollableDivRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollableDivRef.current;
        isScrolledToBottomRef.current = scrollHeight - scrollTop - clientHeight < 5;
      };
      const div = scrollableDivRef.current;
      if (div) {
        div.addEventListener('scroll', handleScroll);
      }
      return () => {
        if (div) {
          div.removeEventListener('scroll', handleScroll);
        }
      };
    }, []);

    if (!isOpen) return null;

    return (
        <div
            className="fixed bottom-20 right-6 z-50 w-[800px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] shadow-xl rounded-lg overflow-hidden">
            <Card className="border">
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">메시지</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5"/>
                    </Button>
                </CardHeader>
                <CardContent className="p-0 flex" style={{height: "500px"}}>
                    {/* 친구 목록 및 그룹 채팅 목록 사이드바 */}
                    <div className="w-[280px] border-r">
                        <div className="p-3 border-b">
                            <Input
                                placeholder="친구 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <div className="px-3 pt-3">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="all">전체</TabsTrigger>
                                    <TabsTrigger value="online">온라인</TabsTrigger>
                                    <TabsTrigger value="groups">단체</TabsTrigger>
                                </TabsList>
                            </div>

                            {isLoadingChatRooms && (
                                <div className="p-4 text-center text-muted-foreground">채팅방을 불러오는 중...</div>
                            )}

                            <TabsContent value="all" className="m-0">
                                {/* ScrollArea 대신 div와 직접 스크롤 로직 구현 */}
                                <div className="h-full max-h-[420px] overflow-y-auto">
                                    <div className="p-3 space-y-2">
                                        {!isLoadingChatRooms && filteredFriends.length === 0 && (
                                            <div className="text-center text-muted-foreground">친구 채팅방이 없습니다.</div>
                                        )}
                                        {filteredFriends.map((friend) => (
                                            <div
                                                key={friend.chatRoomId}
                                                className={`flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer ${
                                                    selectedChatRoom?.chatRoomId === friend.chatRoomId ? "bg-accent" : ""
                                                }`}
                                                onClick={() => {
                                                    setSelectedChatRoom(friend)
                                                }}
                                            >
                                                <div className="relative">
                                                    <Avatar>
                                                        <AvatarImage src={friend.avatar || "/placeholder.svg"}
                                                                     alt={friend.name}/>
                                                        <AvatarFallback>{friend.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div
                                                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background transition-colors duration-300 ${
                                                            friend.status === "online" ? "bg-green-500" : "bg-gray-400"
                                                        }`}
                                                    />
                                                    {friend.unreadCount > 0 && (
                                                        <div
                                                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                                            {friend.unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium">{friend.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate transition-colors duration-300">
                                                        {friend.status === "online" ? "온라인" : "오프라인"}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {friendHasNext && (
                                            <div className="text-center mt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={handleLoadMoreChatRooms}
                                                    disabled={isLoadingChatRooms}
                                                >
                                                    {isLoadingChatRooms ? "불러오는 중..." : "더 불러오기"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* div 종료 */}
                            </TabsContent>

                            <TabsContent value="online" className="m-0">
                                {/* ScrollArea 대신 div와 직접 스크롤 로직 구현 */}
                                <div className="h-full max-h-[420px] overflow-y-auto">
                                    <div className="p-3 space-y-2">
                                        {!isLoadingChatRooms && filteredFriends.filter((friend) => friend.status === "online").length === 0 && (
                                            <div className="text-center text-muted-foreground">온라인 친구가 없습니다.</div>
                                        )}
                                        {filteredFriends
                                            .filter((friend) => friend.status === "online")
                                            .map((friend) => (
                                                <div
                                                    key={friend.chatRoomId}
                                                    className={`flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer ${
                                                        selectedChatRoom?.chatRoomId === friend.chatRoomId ? "bg-accent" : ""
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedChatRoom(friend)
                                                    }}
                                                >
                                                    <div className="relative">
                                                        <Avatar>
                                                            <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name}/>
                                                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div
                                                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background transition-colors duration-300 ${
                                                                friend.status === "online" ? "bg-green-500" : "bg-gray-400"
                                                            }`}
                                                        />
                                                        {friend.unreadCount > 0 && (
                                                            <div
                                                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                                                {friend.unreadCount}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium">{friend.name}</div>
                                                        <div className="text-xs text-muted-foreground transition-colors duration-300">
                                                            {friend.status === "online" ? "온라인" : "오프라인"}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        {friendHasNext && (
                                            <div className="text-center mt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={handleLoadMoreChatRooms}
                                                    disabled={isLoadingChatRooms}
                                                >
                                                    {isLoadingChatRooms ? "불러오는 중..." : "더 불러오기"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* div 종료 */}
                            </TabsContent>

                            <TabsContent value="groups" className="m-0">
                                {/* ScrollArea 대신 div와 직접 스크롤 로직 구현 */}
                                <div className="h-full max-h-[420px] overflow-y-auto">
                                    <div className="p-3 space-y-2">

                                        {!isLoadingChatRooms && studyGroupChatRooms.length === 0 && (
                                            <div className="text-center text-muted-foreground">그룹 채팅방이 없습니다.</div>
                                        )}

                                        {/* 그룹 채팅 목록 */}
                                        {studyGroupChatRooms.map((group) => (
                                            <div
                                                key={group.chatRoomId}
                                                className={`flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer ${
                                                    selectedChatRoom?.chatRoomId === group.chatRoomId ? "bg-accent" : ""
                                                }`}
                                                onClick={() => {
                                                    setSelectedChatRoom(group)
                                                }}
                                            >
                                                <div className="relative">
                                                    <UIAvatarGroup>
                                                        {group.members.slice(0, 3).map((member, index) => (
                                                            <Avatar key={member.memberId}
                                                                    className={`h-8 w-8 ${index > 0 ? "-ml-3" : ""}`}>
                                                                <AvatarImage src={"/placeholder.svg"}
                                                                             alt={member.nickname || 'Unknown'}/>
                                                                <AvatarFallback>{(member.nickname || 'Unknown')[0]}</AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                    </UIAvatarGroup>
                                                    {group.unreadCount > 0 && (
                                                        <div
                                                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                                            {group.unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium">{group.name}</div>
                                                    {/* members.length 대신 memberCount 표시 */}
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {group.memberCount}명 참여 중
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {studyGroupHasNext && (
                                            <div className="text-center mt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={handleLoadMoreChatRooms}
                                                    disabled={isLoadingChatRooms}
                                                >
                                                    {isLoadingChatRooms ? "불러오는 중..." : "더 불러오기"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* div 종료 */}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* 채팅창 영역 */}
                    <div className="flex-1 flex flex-col relative"> {/* Added relative positioning here */}
                        {selectedChatRoom ? (
                            <>
                                <div className="p-3 border-b flex items-center gap-3">
                                    {(selectedChatRoom as FriendChatRoom).status ? (
                                        <>
                                            <div className="relative">
                                                <Avatar>
                                                    <AvatarImage
                                                        src={(selectedChatRoom as FriendChatRoom).avatar || "/placeholder.svg"}
                                                        alt={selectedChatRoom.name}/>
                                                    <AvatarFallback>{selectedChatRoom.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background transition-colors duration-300 ${
                                                        (selectedChatRoom as FriendChatRoom).status === "online" ? "bg-green-500" : "bg-gray-400"
                                                    }`}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{selectedChatRoom.name}</div>
                                                <div className="text-xs text-muted-foreground transition-colors duration-300">
                                                    {(selectedChatRoom as FriendChatRoom).status === "online" ? "온라인" : "오프라인"}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <UIAvatarGroup>
                                                {displayMemberInfos.slice(0, 3).map((member, index) => (
                                                    <Avatar key={member.memberId}
                                                            className={`h-8 w-8 ${index > 0 ? "-ml-3" : ""}`}>
                                                        <AvatarImage src={"/placeholder.svg"}
                                                                     alt={member.nickname || 'Unknown'}/>
                                                        <AvatarFallback>{(member.nickname || 'Unknown')[0]}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </UIAvatarGroup>
                                            <div className="flex-1">
                                                <div className="font-medium">{selectedChatRoom.name}</div>
                                                {/* memberCount가 있을 경우 사용, 아니면 members.length */}
                                                <div className="text-xs text-muted-foreground">
                                                    {(selectedChatRoom as StudyGroupChatRoom).memberCount !== undefined
                                                        ? `${(selectedChatRoom as StudyGroupChatRoom).memberCount}명 참여 중`
                                                        : `${displayMemberInfos.length}명 참여 중`}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* ScrollArea 대신 div를 사용하고 ref를 직접 연결 */}
                                <div
                                    ref={scrollableDivRef}
                                    className="flex-1 p-4 overflow-y-auto h-full"
                                >
                                    {currentChatIsLoading && displayMessages.length === 0 && (
                                        <div className="text-center text-muted-foreground">메시지를 불러오는 중...</div>
                                    )}
                                    {currentChatRoomState?.hasNext && currentChatRoomState.nextCursor && (
                                        <div className="text-center mt-4">
                                            <Button
                                                variant="outline"
                                                onClick={handleLoadMoreMessages}
                                                disabled={currentChatIsLoading}
                                            >
                                                {currentChatIsLoading ? "이전 메시지 불러오는 중..." : "이전 메시지 불러오기"}
                                            </Button>
                                        </div>
                                    )}
                                    {/* Conditional rendering for actual messages with opacity transition */}
                                    <div
                                        className={`space-y-4 transition-opacity duration-300 ${isChatContentVisible ? 'opacity-100' : 'opacity-0'}`}>
                                        {displayMessages.map((msg, index) => {
                                            const sender = displayMemberInfos.find(m => m.memberId === msg.senderId);
                                            // 내 ID를 currentMemberId로 사용
                                            const isMe = msg.senderId === currentMemberId;
                                            const senderName = isMe ? "나" : sender?.nickname || "알 수 없음";

                                            // 날짜 구분선 로직
                                            const currentDate = new Date(msg.createdAt);
                                            const prevMessage = displayMessages[index - 1];
                                            const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;
                                            const showDateSeparator = !prevDate || !isSameDay(currentDate, prevDate);

                                            // 메시지를 읽지 않은 사람 수를 계산합니다. (senderId를 제외한 모든 멤버에 대해)
                                            const unreadCount = (() => {
                                                if (!currentChatRoomState || !displayMemberInfos || !selectedChatRoom) return 0;

                                                // 현재 메시지를 보낸 사람을 제외한 모든 멤버를 대상으로 읽음 여부를 확인합니다.
                                                const membersToCheckReadStatus = displayMemberInfos.filter(m => m.memberId !== msg.senderId);

                                                // 읽지 않은 멤버의 수를 계산합니다.
                                                const count = membersToCheckReadStatus.filter(m =>
                                                    new Date(m.lastReadMessageTime).getTime() < new Date(msg.createdAt).getTime()
                                                ).length;

                                                return count;
                                            })();

                                            const showUnreadCount = unreadCount > 0;

                                            return (
                                                <React.Fragment key={msg.id}>
                                                    {showDateSeparator && (
                                                        <div className="flex items-center justify-center my-4">
                                                            <div
                                                                className="bg-muted-foreground/10 text-muted-foreground px-3 py-1 rounded-lg text-sm">
                                                                {formatDateForSeparator(msg.createdAt)}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                        {!isMe && (
                                                            <Avatar className="h-8 w-8 mr-2">
                                                                <AvatarImage src={"/placeholder.svg"} alt={senderName}/>
                                                                <AvatarFallback>{senderName[0]}</AvatarFallback>
                                                            </Avatar>
                                                        )}

                                                        {/* 내가 보낸 메시지의 읽지 않은 수 (말풍선 왼쪽) */}
                                                        {isMe && showUnreadCount && (
                                                            <span
                                                                className="text-xs text-muted-foreground mr-1.5 self-end">{unreadCount}</span>
                                                        )}

                                                        <div
                                                            className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                                                isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                                                            } flex flex-col`}
                                                        >
                                                            {!isMe && (
                                                                <p className="text-xs font-medium mb-1">{senderName}</p>
                                                            )}
                                                            <p>{msg.message}</p>

                                                            {msg.mediaIds && msg.media && Array.isArray(msg.media) && msg.mediaIds.length === msg.media.length && (
                                                              <div className="mt-2 space-y-2">
                                                                {msg.mediaIds.map((id, idx) => {
                                                                  const mediaUrl = mediaInfos[id];
                                                                  const info = msg.media[idx];
                                                                  if (!info || !mediaUrl) return <div key={id}>로딩중...</div>;
                                                                  if (info.extension.match(/^jpg|jpeg|png|gif|bmp|webp|svg$/i)) {
                                                                    return (
                                                                      <div key={id} className="mt-2">
                                                                        <img
                                                                          src={mediaUrl}
                                                                          alt={info.fileName}
                                                                          className="max-w-full rounded-md cursor-pointer hover:opacity-90"
                                                                          onLoad={() => {
                                                                            if (isScrolledToBottomRef.current && scrollableDivRef.current) {
                                                                              scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
                                                                            }
                                                                          }}
                                                                        />
                                                                        <div className="text-xs mt-1 flex justify-between">
                                                                          <span>{info.fileName}</span>
                                                                          <span>{(info.fileSize / 1024).toFixed(1)}KB</span>
                                                                        </div>
                                                                      </div>
                                                                    );
                                                                  }
                                                                  // 파일 다운로드 시 확장자 중복 방지
                                                                  let downloadName = info.fileName;
                                                                  if (info.extension && !info.fileName.toLowerCase().endsWith('.' + info.extension.toLowerCase())) {
                                                                    downloadName += '.' + info.extension;
                                                                  }
                                                                  return (
                                                                    <a
                                                                      key={id}
                                                                      href={mediaUrl}
                                                                      download={downloadName}
                                                                      className="flex items-center gap-2 p-2 rounded-md bg-accent text-black border border-gray-300"
                                                                      target="_blank"
                                                                      rel="noopener noreferrer"
                                                                    >
                                                                      <span className="text-sm">{info.fileName}</span>
                                                                      <span className="text-xs">{(info.fileSize / 1024).toFixed(1)}KB</span>
                                                                    </a>
                                                                  );
                                                                })}
                                                              </div>
                                                            )}

                                                            <div
                                                                className={`text-xs mt-1 flex justify-end items-center gap-1 ${
                                                                    isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                                                }`}
                                                            >
                                                                {/* Display time */}
                                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* 상대방이 보낸 메시지의 읽지 않은 수 (말풍선 오른쪽) */}
                                                        {!isMe && showUnreadCount && (
                                                            <span
                                                                className="text-xs text-muted-foreground ml-1.5 self-end">{unreadCount}</span>
                                                        )}
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                    {displayMessages.length === 0 && !currentChatIsLoading && isChatContentVisible && ( // Only show "no messages" if nothing is loading and content visible
                                        <div className="text-center text-muted-foreground">아직 메시지가 없습니다.</div>
                                    )}
                                    <div ref={messagesEndRef}/>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <MessageSquare className="h-8 w-8 text-muted-foreground"/>
                                </div>
                                <h3 className="text-lg font-semibold">메시지를 시작하세요</h3>
                                <p className="text-muted-foreground mt-1">친구나 그룹을 선택하여 대화를 시작하세요.</p>
                            </div>
                        )}

                        {uploadedFiles.length > 0 && (
                            <div className="p-3 border-t border-b max-h-[150px] overflow-y-auto">
                                <div className="text-sm font-medium mb-2">업로드할 파일 ({uploadedFiles.length})</div>
                                <div className="space-y-2">
                                    {uploadedFiles.map((f, index) => (
                                        <div key={index} className="flex items-center justify-between bg-accent/50 p-2 rounded-md">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Paperclip className="h-4 w-4 flex-shrink-0"/>
                                                <span className="text-sm truncate">{f.file.name}</span>
                                                <span className="text-xs text-muted-foreground">{typeof f.file.size === 'number' ? (f.file.size / 1024).toFixed(1) : ''}KB</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {f.status === 'uploading' ? (
                                                    <Progress value={f.progress} className="w-20 h-2"/>
                                                ) : f.status === 'done' ? (
                                                    <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                                                        <X className="h-4 w-4"/>
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-red-500">실패</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedChatRoom && (
                            <div className="p-3 border-t">
                                <div className="flex items-end gap-2">
                                    <div className="flex gap-2 relative">
                                        <Button variant="ghost" size="icon" onClick={handleFileUpload}>
                                            <Paperclip className="h-5 w-5"/>
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            multiple
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(v => !v)}>
                                            <Smile className="h-5 w-5"/>
                                        </Button>
                                        {showEmojiPicker && (
                                            <div
                                                ref={emojiPickerRef}
                                                style={{ position: 'absolute', right: 0, bottom: 48, zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', borderRadius: 12, overflow: 'hidden' }}
                                            >
                                                <Picker
                                                    data={data}
                                                    onEmojiSelect={(emoji: any) => setMessage(message + emoji.native)}
                                                    theme="light"
                                                    previewPosition="none"
                                                    perLine={8}
                                                    maxFrequentRows={1}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <Textarea
                                        placeholder="메시지를 입력하세요..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="flex-1 min-h-[40px] resize-none"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSendMessage()
                                            }
                                        }}
                                    />
                                    <Button size="icon" onClick={handleSendMessage} disabled={isUploading || (uploadedFiles.length > 0 && Object.values(uploadProgress).some(v => v < 100))}>
                                        <Send className="h-5 w-5"/>
                                    </Button>
                                </div>
                            </div>
                        )}
                        {/* 새 메시지 버튼 - 이제 이 위치에 있습니다. */}
                        {showNewMessageToast && (
                            <Button
                                className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-blue-500 text-white rounded-full px-4 py-2 shadow-lg z-10 hover:bg-blue-600 transition-all flex items-center gap-1 text-sm"
                                onClick={() => {
                                    if (scrollableDivRef.current) {
                                        scrollableDivRef.current.scrollTo({
                                            top: scrollableDivRef.current.scrollHeight,
                                            behavior: "smooth"
                                        });
                                    }
                                    setShowNewMessageToast(false);
                                }}
                            >
                                새 메시지 <ArrowDown size={16}/>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
