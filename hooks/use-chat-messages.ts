import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
import { fetchOlderMessages, downloadMedia } from '@/lib/api/chat';
import { 
  subscribeToInitMessages,
  subscribeToLiveMessages,
  subscribeToReadReceipts,
  sendReadReceipt
} from '@/lib/api/websocket';
import { Client } from '@stomp/stompjs';
import {
  ChatRoomMessagesState,
  ChatMessage,
  InitChatRoomResponse,
  MemberInfo,
  MediaInfo
} from '@/types/chat';
import { isScrolledToBottom, scrollToBottom } from '@/lib/chat-utils';
import { useChat } from './use-chat';

export const useChatMessages = (
  stompClientState: Client | null,
  isConnected: boolean,
  selectedChatRoom: any,
  allChatRoomMessages: Record<number, ChatRoomMessagesState>,
  setAllChatRoomMessages: (updater: (prev: Record<number, ChatRoomMessagesState>) => Record<number, ChatRoomMessagesState>) => void,
  allChatRoomMessagesRef: React.MutableRefObject<Record<number, ChatRoomMessagesState>>,
  initialReadSent: React.MutableRefObject<Set<number>>,
  fetchAndAddMemberInfo: (chatRoomId: number, memberId: number) => Promise<void>,
  setFriendChatRooms: (updater: (prev: any[]) => any[]) => void,
  setStudyGroupChatRooms: (updater: (prev: any[]) => any[]) => void
) => {
  const { toast } = useToast();
  
  // 스크롤 관련 상태
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottomRef = useRef(true);
  const [isChatContentVisible, setIsChatContentVisible] = useState(false);
  
  // 새 메시지 토스트 상태
  const [showNewMessageToast, setShowNewMessageToast] = useState(false);
  const showNewMessageToastStateRef = useRef(showNewMessageToast);
  
  // 미디어 정보 상태
  const [mediaInfos, setMediaInfos] = useState<Record<string, string>>({});

  // 내 memberInfo를 ref로 관리
  const myInfoRef = useRef<MemberInfo | undefined>(undefined);

  // showNewMessageToast의 최신 값을 항상 참조하기 위한 ref
  useEffect(() => {
    showNewMessageToastStateRef.current = showNewMessageToast;
  }, [showNewMessageToast]);

  // 선택된 채팅방의 메시지 및 멤버 정보를 가져오는 함수
  const loadChatRoomMessages = useCallback(async (chatRoomId: number) => {
    console.log(`[FUNCTION: loadChatRoomMessages] Called for chatRoomId: ${chatRoomId}`);
    setIsChatContentVisible(false);
    setAllChatRoomMessages(prev => ({
      ...prev,
      [chatRoomId]: {
        ...prev[chatRoomId],
        isLoadingMessages: true,
        messages: prev[chatRoomId]?.messages || [],
        memberInfos: prev[chatRoomId]?.memberInfos || [],
      }
    }));
  }, [setAllChatRoomMessages]);

  // 과거 메시지를 불러오는 함수
  const loadOlderMessages = useCallback(async (chatRoomId: number, cursor: string) => {
    // 메시지 로드 전 현재 스크롤 위치와 스크롤 높이 저장
    const viewport = scrollableDivRef.current;
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
      const { messages: fetchedMessages, nextCursor, hasNext } = await fetchOlderMessages(chatRoomId, cursor);

      setAllChatRoomMessages(prev => {
        const currentRoomState = prev[chatRoomId];
        if (currentRoomState) {
          // 가져온 이전 메시지의 senderId 중 현재 memberInfos에 없는 멤버 정보 요청
          fetchedMessages.forEach(msg => {
            if (!currentRoomState.memberInfos.some(m => m.memberId === msg.senderId)) {
              fetchAndAddMemberInfo(chatRoomId, msg.senderId);
            }
          });

          // 기존 메시지의 맨 앞에 새로운 (더 오래된) 메시지들을 추가
          const updatedMessages = [...fetchedMessages, ...currentRoomState.messages];
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

      console.log(`[API Call] Older messages for chatRoom ${chatRoomId}:`, fetchedMessages);
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
  }, [toast, fetchAndAddMemberInfo, setAllChatRoomMessages]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (scrollableDivRef.current) {
      const atBottom = isScrolledToBottom(scrollableDivRef.current);
      isScrolledToBottomRef.current = atBottom;

      if (atBottom && showNewMessageToastStateRef.current) {
        setShowNewMessageToast(false);
      }
    }
  }, []);

  // 네이티브 WheelEvent용 핸들러
  const handleWheelNative = useCallback((e: WheelEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    if (!target) return;
    const isAtTop = target.scrollTop === 0;
    const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight;
    
    if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
      e.preventDefault();
      e.stopPropagation();
    }
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
    }
  }, [handleScroll, handleWheelNative, selectedChatRoom]);

  // 미디어 정보 로드
  useEffect(() => {
    if (!selectedChatRoom) return;
    const chatRoomId = selectedChatRoom.chatRoomId;
    allChatRoomMessages[chatRoomId]?.messages.forEach((msg) => {
      if (!msg.mediaIds || !msg.media || !Array.isArray(msg.media) || msg.mediaIds.length !== msg.media.length) return;
      msg.mediaIds.forEach(async (id, idx) => {
        if (!mediaInfos[id]) {
          try {
            const url = await downloadMedia(chatRoomId, id);
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
  }, [selectedChatRoom, allChatRoomMessages, mediaInfos]);

  // 1. 구독 및 cleanup useEffect 추가
  useEffect(() => {
    if (!stompClientState || !isConnected || !selectedChatRoom) return;
    const chatRoomId = selectedChatRoom.chatRoomId;
    console.log('[DEBUG] useChatMessages effect: SUBSCRIBE chatRoomId', chatRoomId);
    setIsChatContentVisible(false);
    setShowNewMessageToast(false);
    setMediaInfos({});

    // 구독 객체 저장
    const subsInit = subscribeToInitMessages(
      stompClientState,
      chatRoomId,
      (res: InitChatRoomResponse) => {
        const memberInfosWithIsMe = res.memberInfos;
        // 내 정보 ref에 저장 (isMe → me)
        myInfoRef.current = memberInfosWithIsMe.find(m => m.me);

        setAllChatRoomMessages(prev => {
          const newState = {
            ...prev,
            [chatRoomId]: {
              messages: [...res.chatMessage.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
              nextCursor: res.chatMessage.nextCursor,
              hasNext: res.chatMessage.hasNext,
              memberInfos: memberInfosWithIsMe,
              isLoadingMessages: false,
            }
          };
          
          // 최신 메시지 계산
          const sortedMessages = [...res.chatMessage.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          const latestMessage = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : null;
          
          // 최초 1회만 /read 전송 (내 memberId가 있을 때만)
          if (latestMessage && myInfoRef.current && !initialReadSent.current.has(chatRoomId)) {
            sendReadReceipt(stompClientState, chatRoomId, latestMessage.createdAt);
            initialReadSent.current.add(chatRoomId);
            // 목록에서 unreadCount를 0으로
            setFriendChatRooms((prev: any[]) => prev.map((room: any) =>
              room.chatRoomId === chatRoomId ? { ...room, unreadCount: 0 } : room
            ));
            setStudyGroupChatRooms((prev: any[]) => prev.map((room: any) =>
              room.chatRoomId === chatRoomId ? { ...room, unreadCount: 0 } : room
            ));
          }
          
          // 메시지 로드 후 스크롤을 맨 아래로 즉시 이동
          requestAnimationFrame(() => {
            if (messagesEndRef.current && scrollableDivRef.current) {
              scrollToBottom(scrollableDivRef.current, false);
              setIsChatContentVisible(true);
              isScrolledToBottomRef.current = true;
            }
          });
          
          return newState;
        });
        
        // 멤버 정보 없는 senderId에 대해 fetchAndAddMemberInfo 호출
        const allSenderIds = new Set(res.chatMessage.messages.map(msg => msg.senderId));
        const knownMemberIds = new Set(res.memberInfos.map(m => m.memberId));
        allSenderIds.forEach(senderId => {
          if (!knownMemberIds.has(senderId)) {
            fetchAndAddMemberInfo(chatRoomId, senderId);
          }
        });
      },
      (error) => {
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
        setIsChatContentVisible(true);
      }
    );
    const subsLive = subscribeToLiveMessages(
      stompClientState,
      chatRoomId,
      (newMessage: ChatMessage) => {
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
            const isLatest = true;
            if (newMessage.senderId !== myInfoRef.current?.memberId && isLatest) {
              sendReadReceipt(stompClientState, chatRoomId, newMessage.createdAt);
              // 내가 현재 보고 있는 채팅방이면 unreadCount를 0으로 직접 갱신
              if (selectedChatRoom && selectedChatRoom.chatRoomId === chatRoomId) {
                setFriendChatRooms((prev: any[]) => prev.map((room: any) =>
                  room.chatRoomId === chatRoomId ? { ...room, unreadCount: 0 } : room
                ));
                setStudyGroupChatRooms((prev: any[]) => prev.map((room: any) =>
                  room.chatRoomId === chatRoomId ? { ...room, unreadCount: 0 } : room
                ));
              }
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
                if (newMessage.senderId === myInfoRef.current?.memberId) {
                  scrollToBottom(currentScrollableDiv);
                  setShowNewMessageToast(false);
                } else {
                  if (wasScrolledToBottom || !isNowScrollable) {
                    scrollToBottom(currentScrollableDiv);
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
      },
      (error) => {
        console.error("Error parsing new message:", error);
      }
    );
    const subsRead = subscribeToReadReceipts(
      stompClientState,
      chatRoomId,
      (readReceipt: { memberId: number; lastReadMessageTime: string }) => {
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
      },
      (error) => {
        console.error("Error parsing read receipt message:", error);
      }
    );
    return () => {
      console.log('[DEBUG] useChatMessages cleanup: UNSUBSCRIBE chatRoomId', chatRoomId);
      subsInit.unsubscribe();
      subsLive.unsubscribe();
      subsRead.unsubscribe();
    };
  }, [stompClientState, isConnected, selectedChatRoom]);

  // selectedChatRoom 변화 추적
  useEffect(() => {
    console.log('[DEBUG] selectedChatRoom changed:', selectedChatRoom);
  }, [selectedChatRoom]);

  return {
    // refs
    scrollableDivRef,
    messagesEndRef,
    isScrolledToBottomRef,
    
    // 상태
    isChatContentVisible,
    showNewMessageToast,
    mediaInfos,
    
    // 액션
    loadChatRoomMessages,
    loadOlderMessages,
    setShowNewMessageToast,
    setIsChatContentVisible,
  };
}; 