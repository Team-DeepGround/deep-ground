import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useOnlineStatus } from '@/components/online-status-provider';
import { auth } from '@/lib/auth';
import { 
  fetchFriendChatRooms, 
  fetchStudyGroupChatRooms, 
  fetchOnlineStatuses,
  fetchMemberInfo 
} from '@/lib/api/chat';
import { 
  createStompClient,
  subscribeToInitMessages,
  subscribeToLiveMessages,
  subscribeToReadReceipts,
  unsubscribeFromChatRoom,
  sendReadReceipt
} from '@/lib/api/websocket';
import { Client } from '@stomp/stompjs';
import {
  FriendChatRoom,
  StudyGroupChatRoom,
  SelectedChatRoom,
  ChatRoomMessagesState,
  ChatTab,
  MemberInfo,
  ChatMessage,
  InitChatRoomResponse,
  PresenceDto
} from '@/types/chat';

export const useChat = (isOpen: boolean) => {
  const { toast } = useToast();
  const { onlineStatuses, isLoading: isOnlineStatusesLoading } = useOnlineStatus();
  
  // 채팅방 목록 상태
  const [friendChatRooms, setFriendChatRooms] = useState<FriendChatRoom[]>([]);
  const [studyGroupChatRooms, setStudyGroupChatRooms] = useState<StudyGroupChatRoom[]>([]);
  const [isLoadingChatRooms, setIsLoadingChatRooms] = useState(true);
  
  // 친구 목록 상태 (채팅방과 분리)
  const [friendList, setFriendList] = useState<FriendChatRoom[]>([]);
  
  // 페이지네이션 상태
  const [friendCurrentPage, setFriendCurrentPage] = useState(0);
  const [friendHasNext, setFriendHasNext] = useState(false);
  const [studyGroupCurrentPage, setStudyGroupCurrentPage] = useState(0);
  const [studyGroupHasNext, setStudyGroupHasNext] = useState(false);
  
  // 선택된 채팅방
  const [selectedChatRoom, setSelectedChatRoom] = useState<SelectedChatRoom>(null);
  
  // 탭 상태
  const [activeTab, setActiveTab] = useState<ChatTab>('chat');
  
  // 로딩 상태
  const [isFriendChatRoomsLoaded, setIsFriendChatRoomsLoaded] = useState(false);
  const [isStudyGroupChatRoomsLoaded, setIsStudyGroupChatRoomsLoaded] = useState(false);
  
  // WebSocket 관련 상태
  const stompClientRef = useRef<Client | null>(null);
  const [stompClientState, setStompClientState] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // 메시지 상태
  const [allChatRoomMessages, setAllChatRoomMessages] = useState<Record<number, ChatRoomMessagesState>>({});
  const allChatRoomMessagesRef = useRef<Record<number, ChatRoomMessagesState>>({});
  
  // 추적용 ref들
  const initialReadSent = useRef<Set<number>>(new Set());
  const fetchingMembers = useRef<Set<number>>(new Set());
  const failedMemberFetches = useRef<Set<number>>(new Set());

  // allChatRoomMessages 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    allChatRoomMessagesRef.current = allChatRoomMessages;
  }, [allChatRoomMessages]);

  // 친구 채팅방 목록 가져오기
  const loadFriendChatRooms = useCallback(async (page: number) => {
    setIsLoadingChatRooms(true);
    try {
      const { chatRooms, hasNext } = await fetchFriendChatRooms(page);
      
      const mappedFriends: FriendChatRoom[] = chatRooms.map((room) => {
        const isOnline = room.id && onlineStatuses[room.id] === true;
        return {
          ...room,
          status: isOnline ? "online" : "offline",
        };
      });

      setFriendChatRooms((prev) => (page === 0 ? mappedFriends : [...prev, ...mappedFriends]));
      setFriendHasNext(hasNext);
      setFriendCurrentPage(page);
      
      // 친구 목록도 함께 업데이트 (채팅방과 분리)
      if (page === 0) {
        setFriendList(mappedFriends);
        setIsFriendChatRoomsLoaded(true);
      }

      // 친구 목록을 가져온 후 온라인 상태를 다시 적용
      if (page === 0) {
        setTimeout(() => {
          setFriendChatRooms(current => current.map(friend => ({
            ...friend,
            status: friend.id && onlineStatuses[friend.id] === true ? "online" : "offline"
          })));
          setFriendList(current => current.map(friend => ({
            ...friend,
            status: friend.id && onlineStatuses[friend.id] === true ? "online" : "offline"
          })));
        }, 100);
      }

    } catch (error) {
      toast({
        title: "친구 채팅방 로드 실패",
        description: "친구 채팅방 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingChatRooms(false);
    }
  }, [toast, onlineStatuses]);

  // 스터디 그룹 채팅방 목록 가져오기
  const loadStudyGroupChatRooms = useCallback(async (page: number) => {
    setIsLoadingChatRooms(true);
    try {
      const { chatRooms, hasNext } = await fetchStudyGroupChatRooms(page);
      
      setStudyGroupChatRooms((prev) => (page === 0 ? chatRooms : [...prev, ...chatRooms]));
      setStudyGroupHasNext(hasNext);
      setStudyGroupCurrentPage(page);
      
      if (page === 0) {
        setIsStudyGroupChatRoomsLoaded(true);
      }

    } catch (error) {
      toast({
        title: "그룹 채팅방 로드 실패",
        description: "그룹 채팅방 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingChatRooms(false);
    }
  }, [toast]);

  // 멤버 정보 가져오기
  const fetchAndAddMemberInfo = useCallback(async (chatRoomId: number, memberId: number) => {
    if (fetchingMembers.current.has(memberId)) {
      return;
    }
    if (failedMemberFetches.current.has(memberId)) {
      return;
    }

    const currentRoomState = allChatRoomMessagesRef.current[chatRoomId];
    if (currentRoomState && currentRoomState.memberInfos.some(m => m.memberId === memberId)) {
      return;
    }

    fetchingMembers.current.add(memberId);

    try {
      const newMemberInfo = await fetchMemberInfo(chatRoomId, memberId);

      setAllChatRoomMessages(prevAllRooms => {
        const roomState = prevAllRooms[chatRoomId];
        if (roomState) {
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

    } catch (error) {
      failedMemberFetches.current.add(memberId);
    } finally {
      fetchingMembers.current.delete(memberId);
    }
  }, []);

  // WebSocket 연결 관리
  useEffect(() => {
    const shouldClientExistAndBeConnected = isOpen && authToken !== null;

    if (shouldClientExistAndBeConnected && (!stompClientRef.current || !stompClientRef.current.connected)) {
      (async () => {
        const client = await createStompClient(
          () => {
            setIsConnected(true);
            stompClientRef.current = client;
            setStompClientState(client);
          },
          (frame) => {
            setIsConnected(false);
            stompClientRef.current = null;
            setStompClientState(null);
          },
          () => {
            setIsConnected(false);
            stompClientRef.current = null;
            setStompClientState(null);
          }
        );
        client.activate();
      })();
      return () => {
        if (stompClientRef.current && stompClientRef.current.connected) {
          stompClientRef.current.deactivate();
        }
      };
    } else if (!shouldClientExistAndBeConnected && stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      setStompClientState(null);
      setIsConnected(false);
    }
  }, [isOpen, authToken, toast]);

  // 팝업 열림/닫힘 시 초기화
  useEffect(() => {
    if (isOpen) {
      // setSelectedChatRoom(null); // 제거: 팝업 열릴 때는 selectedChatRoom을 null로 만들지 않음

      const fetchAuthDetails = async () => {
        try {
          const token = await auth.getToken();
          setAuthToken(token);
        } catch (error) {
          toast({
            title: "인증 정보 로드 실패",
            description: "로그인 상태를 확인해주세요.",
            variant: "destructive",
          });
        }
      };
      fetchAuthDetails();

    } else {
      setSelectedChatRoom(null); // 닫힐 때만 초기화
      setFriendChatRooms([]);
      setStudyGroupChatRooms([]);
      setIsLoadingChatRooms(true);
      setFriendCurrentPage(0);
      setFriendHasNext(false);
      setStudyGroupCurrentPage(0);
      setStudyGroupHasNext(false);
      setAuthToken(null);
      setIsFriendChatRoomsLoaded(false);
      setIsStudyGroupChatRoomsLoaded(false);

      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        setStompClientState(null);
        setIsConnected(false);
      }
      setAllChatRoomMessages({});
      initialReadSent.current.clear();
      fetchingMembers.current.clear();
      failedMemberFetches.current.clear();
    }
  }, [isOpen, toast]);

  // 온라인 상태가 로드된 후 친구 채팅방 목록 로드
  useEffect(() => {
    if (isOpen && authToken && !isOnlineStatusesLoading) { // 'chat' 탭일 때도 친구 목록은 필요
      if (activeTab === 'chat' || activeTab === 'online') {
        if (!isFriendChatRoomsLoaded) {
          setFriendCurrentPage(0);
          setFriendHasNext(false);
          loadFriendChatRooms(0);
        }
      }
    }
  }, [isOpen, activeTab, authToken, isOnlineStatusesLoading, isFriendChatRoomsLoaded, loadFriendChatRooms]);
  
  // 스터디 그룹 채팅방 목록 로드
  useEffect(() => {
    if (isOpen && authToken !== null) {
      if (activeTab === 'chat' || activeTab === 'groups') { // 'chat' 탭일 때도 그룹 목록 필요
        if (!isStudyGroupChatRoomsLoaded) {
          setStudyGroupCurrentPage(0);
          setStudyGroupHasNext(false);
          loadStudyGroupChatRooms(0);
        }
      }
    }
  }, [isOpen, activeTab, authToken, isStudyGroupChatRoomsLoaded, loadStudyGroupChatRooms]);

  // SSE presence 이벤트 처리
  useEffect(() => {
    const handlePresenceUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const presenceData: PresenceDto = customEvent.detail;
      
      setFriendChatRooms(prev => prev.map(friend => {
        if (friend.id === presenceData.memberId) {
          const newStatus = presenceData.isOnline === true ? "online" : "offline";
          return { ...friend, status: newStatus };
        }
        return friend;
      }));

      setSelectedChatRoom(prev => {
        if (prev && 'status' in prev && prev.id === presenceData.memberId) {
          if (prev.status === (presenceData.isOnline === true ? "online" : "offline")) {
            // 상태가 동일하면 기존 객체 반환(참조 유지)
            return prev;
          }
          // 상태만 다르면 새 객체 반환
          const newStatus = presenceData.isOnline === true ? "online" : "offline";
          // id, status만 바뀌는 경우 기존 객체를 최대한 재사용
          return { ...prev, status: newStatus };
        }
        return prev;
      });
    };

    window.addEventListener('presence-update', handlePresenceUpdate);
    return () => {
      window.removeEventListener('presence-update', handlePresenceUpdate);
    };
  }, [isOpen, onlineStatuses]);

  // 채팅방 UI가 열릴 때 onlineStatuses 정보를 친구 목록에 즉시 반영
  useEffect(() => {
    if (isOpen && friendChatRooms.length > 0) {
      setFriendChatRooms(prev => prev.map(friend => {
        const isOnline = friend.id && onlineStatuses[friend.id] === true;
        return { ...friend, status: isOnline ? "online" : "offline" };
      }));
    }
  }, [isOpen, onlineStatuses, friendChatRooms.length]);

  // SSE/WebSocket unreadCount 이벤트 수신 시 채팅방 목록 unreadCount 갱신
  useEffect(() => {
    async function handleUnreadCountEvent(e: any) {
      const { chatRoomId, unreadCount, lastestMessageTime, senderId } = e.detail || {};
      
      // 현재 사용자 ID 가져오기
      const currentUserId = await auth.getMemberId();
      
      // 내가 보낸 메시지로 인한 unreadCount 업데이트는 무시
      if (senderId === currentUserId) return;

      // 현재 보고 있는 채팅방에 대한 unread 이벤트가 오면, 즉시 읽음 처리를 다시 보냄
      if (
        selectedChatRoom &&
        Number(chatRoomId) === selectedChatRoom.chatRoomId &&
        stompClientRef.current &&
        stompClientRef.current.connected
      ) {
        // SSE에서 온 lastestMessageTime을 우선 사용, 없으면 로컬 메시지에서 찾기
        const readTime = lastestMessageTime || 
          (allChatRoomMessagesRef.current[Number(chatRoomId)]?.messages?.length
            ? allChatRoomMessagesRef.current[Number(chatRoomId)].messages[
                allChatRoomMessagesRef.current[Number(chatRoomId)].messages.length - 1
              ].createdAt
            : undefined);
        
        if (readTime && currentUserId !== null) {
          try {
            sendReadReceipt(
              stompClientRef.current,
              Number(chatRoomId),
              currentUserId,
              readTime
            );
          } catch {}
        }
      }
      
      // 채팅방 목록의 unreadCount 업데이트
      setFriendChatRooms((prev) => {
        const updated = prev.map((room) => {
          if (room.chatRoomId === Number(chatRoomId)) {
            return {
              ...room,
              unreadCount:
                selectedChatRoom &&
                selectedChatRoom.chatRoomId === Number(chatRoomId)
                  ? 0
                  : unreadCount,
              lastMessageTime: lastestMessageTime || room.lastMessageTime,
            };
          }
          return room;
        });
        return updated;
      });
      setStudyGroupChatRooms(prev => {
        const updated = prev.map(room => {
          return room.chatRoomId === Number(chatRoomId)
            ? {
                ...room,
                unreadCount:
                  (selectedChatRoom && selectedChatRoom.chatRoomId === Number(chatRoomId))
                    ? 0
                    : unreadCount
              }
            : room;
        });
        return updated;
      });
    }
    window.addEventListener('chat-unread-count', handleUnreadCountEvent);
    return () => window.removeEventListener('chat-unread-count', handleUnreadCountEvent);
  }, [selectedChatRoom]);

  // selectedChatRoom이 바뀔 때마다 해당 방의 unreadCount를 0으로 강제 세팅
  useEffect(() => {
    if (selectedChatRoom) {
      // 즉시 UI에서 unreadCount를 0으로 설정
      setFriendChatRooms(prev =>
        prev.map(room =>
          room.chatRoomId === selectedChatRoom.chatRoomId
            ? { ...room, unreadCount: 0 }
            : room
        )
      );
      setStudyGroupChatRooms(prev =>
        prev.map(room =>
          room.chatRoomId === selectedChatRoom.chatRoomId
            ? { ...room, unreadCount: 0 }
            : room
        )
      );

      // 방 전환 시 최신 메시지 기준으로 즉시 읽음 전송
      if (stompClientRef.current && stompClientRef.current.connected) {
        const roomState = allChatRoomMessagesRef.current[selectedChatRoom.chatRoomId];
        // 메시지가 이미 로드된 경우에만 읽음 처리 전송
        if (roomState?.messages?.length) {
          const latestCreatedAt = roomState.messages[roomState.messages.length - 1].createdAt;
          const sendRead = async () => {
            try {
              const myMemberId = await auth.getMemberId();
              if (myMemberId !== null && stompClientRef.current) {
                sendReadReceipt(
                  stompClientRef.current,
                  selectedChatRoom.chatRoomId,
                  myMemberId,
                  latestCreatedAt
                );
              }
            } catch {}
          };
          sendRead();
        }
      }
    }
  }, [selectedChatRoom]);

  // 채팅방 메시지가 로드된 후 읽음 처리 강화
  useEffect(() => {
    if (selectedChatRoom && stompClientRef.current && stompClientRef.current.connected) {
      const roomState = allChatRoomMessagesRef.current[selectedChatRoom.chatRoomId];
      if (roomState?.messages?.length && !initialReadSent.current.has(selectedChatRoom.chatRoomId)) {
        const sendRead = async () => { // async 함수 선언
          try {
            const latestMessage = roomState.messages[roomState.messages.length - 1];
            const myMemberId = await auth.getMemberId();
            if (myMemberId !== null && stompClientRef.current) {
              sendReadReceipt(
                stompClientRef.current, selectedChatRoom.chatRoomId,myMemberId, latestMessage.createdAt
              );
              initialReadSent.current.add(selectedChatRoom.chatRoomId);
            }
          } catch {}
        };
        sendRead(); // async 함수 호출
      }
    }
  }, [selectedChatRoom, allChatRoomMessages]);

  return {
    // 상태
    friendChatRooms,
    studyGroupChatRooms,
    friendList, // 친구 목록 추가
    selectedChatRoom,
    activeTab,
    isLoadingChatRooms,
    isConnected,
    stompClientState,
    allChatRoomMessages,
    allChatRoomMessagesRef,
    initialReadSent,
    
    // 페이지네이션
    friendCurrentPage,
    friendHasNext,
    studyGroupCurrentPage,
    studyGroupHasNext,
    
    // 로딩 상태
    isFriendChatRoomsLoaded,
    isStudyGroupChatRoomsLoaded,
    
    // 액션
    setSelectedChatRoom,
    setActiveTab,
    loadFriendChatRooms,
    loadStudyGroupChatRooms,
    fetchAndAddMemberInfo,
    setAllChatRoomMessages,
    setFriendChatRooms,
    setStudyGroupChatRooms,
  };
}; 