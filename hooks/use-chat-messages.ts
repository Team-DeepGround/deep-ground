import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
// --- 수정 --- : fetchMemberInfo를 import합니다. (api.ts에서 가져옴)
import { fetchOlderMessages, downloadMedia, fetchMemberInfo } from '@/lib/api/chat'; 
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
import { useChat } from './use-chat'; // 이 파일이 실제로 있다면 그대로 둡니다.

export const useChatMessages = (
  stompClientState: Client | null,
  isConnected: boolean,
  selectedChatRoom: any,
  allChatRoomMessages: Record<number, ChatRoomMessagesState>,
  setAllChatRoomMessages: (
    updater: (
      prev: Record<number, ChatRoomMessagesState>
    ) => Record<number, ChatRoomMessagesState>
  ) => void,
  allChatRoomMessagesRef: React.MutableRefObject<
    Record<number, ChatRoomMessagesState>
  >,
  initialReadSent: React.MutableRefObject<Set<number>>,
  fetchAndAddMemberInfo: (
    chatRoomId: number,
    memberId: number
  ) => Promise<void>,
  setFriendChatRooms: (updater: (prev: any[]) => any[]) => void,
  setStudyGroupChatRooms: (updater: (prev: any[]) => any[]) => void
) => {
  const { toast } = useToast();

  // (스크롤, 미디어 로드 등... 원본 코드와 동일)
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottomRef = useRef(true);
  const [isChatContentVisible, setIsChatContentVisible] = useState(false);
  const [showNewMessageToast, setShowNewMessageToast] = useState(false);
  const showNewMessageToastStateRef = useRef(showNewMessageToast);
  const [mediaInfos, setMediaInfos] = useState<
    Record<
      string,
      { url: string; contentType: string; fileName: string; fileSize: number }
    >
  >({});
  const myInfoRef = useRef<MemberInfo | undefined>(undefined);
  
  useEffect(() => {
    showNewMessageToastStateRef.current = showNewMessageToast;
  }, [showNewMessageToast]);
  
  const selectedChatRoomRef = useRef(selectedChatRoom);
  useEffect(() => {
    selectedChatRoomRef.current = selectedChatRoom;
  }, [selectedChatRoom]);
  
  const loadChatRoomMessages = useCallback(
    async (chatRoomId: number) => {
      // (원본 코드와 동일)
      setIsChatContentVisible(false);
      setAllChatRoomMessages((prev) => ({
        ...prev,
        [chatRoomId]: {
          ...prev[chatRoomId],
          isLoadingMessages: true,
          messages: prev[chatRoomId]?.messages || [],
          memberInfos: prev[chatRoomId]?.memberInfos || [],
        },
      }));
    },
    [setAllChatRoomMessages]
  );

  const loadOlderMessages = useCallback(
    async (chatRoomId: number, cursor: string) => {
      // (원본 코드와 동일 - layout shift 방지)
      const viewport = scrollableDivRef.current;
      const oldScrollHeight = viewport ? viewport.scrollHeight : 0;
      const oldScrollTop = viewport ? viewport.scrollTop : 0;

      setAllChatRoomMessages((prev) => ({
        ...prev,
        [chatRoomId]: {
          ...prev[chatRoomId],
          isLoadingMessages: true,
        },
      }));

      try {
        const {
          messages: fetchedMessages,
          nextCursor,
          hasNext,
        } = await fetchOlderMessages(chatRoomId, cursor);

        // --- 수정 --- : 누락된 멤버 정보 fetch (Promise.all)
        const currentMemberIds = new Set(allChatRoomMessagesRef.current[chatRoomId]?.memberInfos.map(m => m.memberId) || []);
        const missingMemberIds = new Set(
          fetchedMessages
            .map(msg => msg.senderId)
            .filter(id => !currentMemberIds.has(id))
        );
        
        if (missingMemberIds.size > 0) {
          await Promise.all(
            Array.from(missingMemberIds).map(memberId => 
              fetchAndAddMemberInfo(chatRoomId, memberId)
            )
          );
        }
        // --- 수정 끝 ---

        setAllChatRoomMessages((prev) => {
          const currentRoomState = prev[chatRoomId];
          if (currentRoomState) {
            // fetchAndAddMemberInfo가 state를 업데이트했으므로, 여기서는 메시지만 추가
            const updatedMessages = [
              ...fetchedMessages,
              ...currentRoomState.messages,
            ];
            return {
              ...prev,
              [chatRoomId]: {
                ...currentRoomState,
                messages: updatedMessages,
                nextCursor: nextCursor,
                hasNext: hasNext,
                isLoadingMessages: false,
              },
            };
          }
          return prev;
        });

        // (원본 코드와 동일 - 스크롤 위치 조정)
        requestAnimationFrame(() => {
          if (viewport) {
            const newScrollHeight = viewport.scrollHeight;
            const scrollDiff = newScrollHeight - oldScrollHeight;
            viewport.scrollTop = oldScrollTop + scrollDiff;
          }
        });
      } catch (error) {
        toast({
          title: '이전 메시지 로드 실패',
          description: '이전 채팅 메시지를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      } finally {
        setAllChatRoomMessages((prev) => ({
          ...prev,
          [chatRoomId]: { ...prev[chatRoomId], isLoadingMessages: false },
        }));
      }
    },
    [toast, fetchAndAddMemberInfo, setAllChatRoomMessages, allChatRoomMessagesRef]
  );

  // (스크롤 핸들러, 미디어 로드 useEffect... 원본 코드와 동일)
  const handleScroll = useCallback(() => {
    if (scrollableDivRef.current) {
      const atBottom = isScrolledToBottom(scrollableDivRef.current);
      isScrolledToBottomRef.current = atBottom;

      if (atBottom && showNewMessageToastStateRef.current) {
        setShowNewMessageToast(false);
      }
    }
  }, []);

  const handleWheelNative = useCallback((e: WheelEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    if (!target) return;
    const isAtTop = target.scrollTop === 0;
    const isAtBottom =
      target.scrollHeight - target.scrollTop === target.clientHeight;

    if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  useEffect(() => {
    const scrollElement = scrollableDivRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      scrollElement.addEventListener('wheel', handleWheelNative, {
        passive: false,
      });
      handleScroll();
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
        scrollElement.removeEventListener('wheel', handleWheelNative);
      };
    }
  }, [handleScroll, handleWheelNative, selectedChatRoom]);

  useEffect(() => {
    if (!selectedChatRoom) return;
    const chatRoomId = selectedChatRoom.chatRoomId;
    let hasNewMedia = false;

    allChatRoomMessages[chatRoomId]?.messages.forEach((msg) => {
      if (!msg.mediaIds) return;
      msg.mediaIds.forEach(async (id) => {
        if (!mediaInfos[id]) {
          hasNewMedia = true;
          try {
            const { url, contentType, fileName, fileSize } =
              await downloadMedia(chatRoomId, id);
            setMediaInfos((prev) => ({
              ...prev,
              [id]: { url, contentType, fileName, fileSize },
            }));
          } catch (e) {
            // 실패 시 무시
          }
        }
      });
    });

    if (hasNewMedia && isScrolledToBottomRef.current) {
      setTimeout(() => {
        if (scrollableDivRef.current) {
          scrollToBottom(scrollableDivRef.current, false);
        }
      }, 100);
    }
  }, [selectedChatRoom, allChatRoomMessages, mediaInfos]);


  // 1. 구독 및 cleanup useEffect 추가
  useEffect(() => {
    if (!stompClientState || !isConnected || !selectedChatRoom) return;
    const chatRoomId = selectedChatRoom.chatRoomId;
    setIsChatContentVisible(false);
    setShowNewMessageToast(false);
    setMediaInfos({});

    // 구독 객체 저장
    const subsInit = subscribeToInitMessages(
      stompClientState,
      chatRoomId,
      // --- 💡 수정 --- : 콜백을 async로 변경, (async () => {}) 래퍼 제거
      async (res: InitChatRoomResponse) => {
        
        // --- 💡 수정 --- : myMemberId를 먼저 await으로 가져옵니다.
        let myMemberId: number | null = null;
        try {
          myMemberId = await auth.getMemberId();
        } catch {}

        // me 플래그 보정 (api.ts가 수정되었다면 m.me는 정확함)
        const memberInfosWithIsMe = (res.memberInfos || []).map((m) => ({
          ...m,
          me: m.me === true || (myMemberId !== null && m.memberId === myMemberId),
        }));

        // 내 정보 ref에 저장
        myInfoRef.current = memberInfosWithIsMe.find((m) => m.me);

        // --- 💡 수정 --- : 누락된 멤버 정보가 있다면, state 업데이트 전에 미리 fetch
        const allSenderIds = new Set(
          res.chatMessage.messages.map((msg) => msg.senderId)
        );
        const knownMemberIds = new Set(memberInfosWithIsMe.map((m) => m.memberId));
        const missingMemberIds = Array.from(allSenderIds).filter(
          (senderId) => !knownMemberIds.has(senderId)
        );

        // 누락된 멤버 정보 병렬 조회
        if (missingMemberIds.length > 0) {
          try {
            // api.ts의 fetchMemberInfo를 직접 사용 (더 확실함)
            const newMemberInfos = await Promise.all(
              missingMemberIds.map(memberId => 
                fetchMemberInfo(chatRoomId, memberId) // api.ts에서 import한 함수
              )
            );
            // 조회된 멤버 정보 추가 (me 플래그가 포함됨)
            // me가 undefined일 수 있으므로 boolean으로 변환
            memberInfosWithIsMe.push(...newMemberInfos.map(m => ({ ...m, me: m.me === true })));
          } catch (e) {
            console.error("초기 로드 시 누락된 멤버 정보 조회 실패:", e);
          }
        }

        // --- 💡 수정 --- : 모든 멤버 정보가 준비된 후 state 업데이트
        setAllChatRoomMessages((prev) => {
          const newState = {
            ...prev,
            [chatRoomId]: {
              ...prev[chatRoomId], // 로딩 상태 등 유지
              messages: [...res.chatMessage.messages].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              ),
              nextCursor: res.chatMessage.nextCursor,
              hasNext: res.chatMessage.hasNext,
              memberInfos: memberInfosWithIsMe, // 완전한 멤버 정보로 업데이트
              isLoadingMessages: false,
            },
          };
          
          // (읽음 처리 및 스크롤 로직... 원본과 동일)
          const sortedMessages = newState[chatRoomId].messages;
          const latestMessage =
            sortedMessages.length > 0
              ? sortedMessages[sortedMessages.length - 1]
              : null;
          
          if (
            latestMessage &&
            myInfoRef.current &&
            !initialReadSent.current.has(chatRoomId)
          ) {
            console.log(`[useChatMessages] Sending read receipt on init for chatRoomId: ${chatRoomId}, time: ${latestMessage.createdAt}`);
            try {
              sendReadReceipt(
                stompClientState,
                chatRoomId,
                myInfoRef.current.memberId,
                latestMessage.createdAt
              );
              initialReadSent.current.add(chatRoomId);
            } catch (error) {
              toast({
                title: '읽음 처리 실패',
                description:
                  '메시지 읽음 상태를 서버에 전송하는데 실패했습니다.',
                variant: 'destructive',
              });
            }

            const updateUnreadCount = (rooms: any[]) =>
              rooms.map((room: any) =>
                room.chatRoomId === chatRoomId
                  ? { ...room, unreadCount: 0 }
                  : room
              );
            setFriendChatRooms(updateUnreadCount);
            setStudyGroupChatRooms(updateUnreadCount);
          }

          requestAnimationFrame(() => {
            if (messagesEndRef.current && scrollableDivRef.current) {
              scrollToBottom(scrollableDivRef.current, false);
              setIsChatContentVisible(true);
              isScrolledToBottomRef.current = true;
            }
          });

          return newState;
        });
      },
      (error) => {
        // (에러 처리... 원본과 동일)
        toast({
          title: '채팅 초기화 실패',
          description: '채팅 메시지를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
        setAllChatRoomMessages((prev) => ({
          ...prev,
          [chatRoomId]: { ...prev[chatRoomId], isLoadingMessages: false },
        }));
        setIsChatContentVisible(true);
      }
    );

    const subsLive = subscribeToLiveMessages(
      stompClientState,
      chatRoomId,
      // --- 💡 수정 --- : 콜백을 async로 변경 (레이스 컨디션 해결)
      async (newMessage: ChatMessage) => {
        try {
          // ... (console.log)
        } catch {}

        // --- 💡 수정 --- : 메시지를 state에 추가하기 *전에* 멤버 정보를 먼저 확인/가져옵니다.
        // ref를 사용해 최신 state를 읽습니다.
        const currentRoomState = allChatRoomMessagesRef.current[chatRoomId];
        if (currentRoomState) {
          const senderExists = currentRoomState.memberInfos.some(
            (m) => m.memberId === newMessage.senderId
          );
          if (!senderExists) {
            try {
              // await로 멤버 정보가 state에 추가될 때까지 기다림
              await fetchAndAddMemberInfo(chatRoomId, newMessage.senderId);
            } catch (e) {
              console.error("실시간 메시지 멤버 정보 조회 실패:", e);
            }
          }
        }
        
        // --- 💡 수정 --- : Stale state 방지를 위해 ref에서 최신 state를 읽어와서 업데이트
        setAllChatRoomMessages(() => {
          // fetchAndAddMemberInfo가 state를 업데이트했으므로, ref에서 최신 state를 읽어옵니다.
          const currentGlobalState = allChatRoomMessagesRef.current;
          const currentRoomState = currentGlobalState[chatRoomId];

          if (currentRoomState) {
            // 중복 메시지 방지
            if (
              currentRoomState.messages.some((msg) => msg.id === newMessage.id)
            ) {
              return currentGlobalState; // 변경 없음
            }

            const wasScrolledToBottom = isScrolledToBottomRef.current;

            // /read 전송 로직
            if (
              myInfoRef.current &&
              newMessage.senderId !== myInfoRef.current.memberId
            ) {
              sendReadReceipt(
                stompClientState,
                chatRoomId,
                myInfoRef.current.memberId,
                newMessage.createdAt
              );
              
              if (
                selectedChatRoomRef.current &&
                selectedChatRoomRef.current.chatRoomId === chatRoomId
              ) {
                const updateUnreadCount = (rooms: any[]) =>
                  rooms.map((room: any) =>
                    room.chatRoomId === chatRoomId
                      ? { ...room, unreadCount: 0 }
                      : room
                  );
                setFriendChatRooms(updateUnreadCount);
                setStudyGroupChatRooms(updateUnreadCount);
              }
            }

            // 메시지 추가
            const newState = {
              ...currentGlobalState,
              [chatRoomId]: {
                ...currentRoomState,
                messages: [...currentRoomState.messages, newMessage],
              },
            };

            // 스크롤 및 토스트 로직
            setTimeout(() => {
              const currentScrollableDiv = scrollableDivRef.current;
              if (currentScrollableDiv) {
                const {
                  scrollHeight: newScrollHeight,
                  clientHeight: newClientHeight,
                } = currentScrollableDiv;
                const isNowScrollable = newScrollHeight > newClientHeight;

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
          return currentGlobalState; // 변경 없음
        });
      },
      (error) => {}
    );

    const subsRead = subscribeToReadReceipts(
      stompClientState,
      chatRoomId,
      // --- 💡 수정 --- : async 추가 (일관성)
      async (readReceipt: { memberId: number; lastReadMessageTime: string }) => {
        
        // --- 💡 수정 --- : 멤버 정보가 없으면 await로 fetch
        const currentRoomState = allChatRoomMessagesRef.current[chatRoomId];
        if (currentRoomState) {
          const memberExists = currentRoomState.memberInfos.some(
            (m) => m.memberId === readReceipt.memberId
          );
          if (!memberExists) {
            try {
              await fetchAndAddMemberInfo(chatRoomId, readReceipt.memberId);
            } catch (e) {
              console.error("읽음 처리 멤버 정보 조회 실패:", e);
            }
          }
        }

        // --- 💡 수정 --- : ref 기반으로 state 업데이트
        setAllChatRoomMessages(() => {
          const currentGlobalState = allChatRoomMessagesRef.current;
          const currentRoomState = currentGlobalState[chatRoomId];

          if (currentRoomState) {
            let updatedMemberInfos = currentRoomState.memberInfos.map(
              (member) =>
                member.memberId === readReceipt.memberId
                  ? {
                      ...member,
                      lastReadMessageTime: readReceipt.lastReadMessageTime,
                    }
                  : member
            );
            
            // (방어 코드)
            const memberStillMissing = !updatedMemberInfos.some(m => m.memberId === readReceipt.memberId);
            if (memberStillMissing) {
                updatedMemberInfos.push({
                    memberId: readReceipt.memberId,
                    nickname: "알 수 없음", // 어쩔 수 없이 임시 처리
                    lastReadMessageTime: readReceipt.lastReadMessageTime,
                    me: false // 모름
                });
            }

            return {
              ...currentGlobalState,
              [chatRoomId]: {
                ...currentRoomState,
                memberInfos: updatedMemberInfos,
              },
            };
          }
          return currentGlobalState;
        });
      },
      (error) => {}
    );
    return () => {
      subsInit.unsubscribe();
      subsLive.unsubscribe();
      subsRead.unsubscribe();
    };
  }, [stompClientState, isConnected, selectedChatRoom, fetchAndAddMemberInfo, setFriendChatRooms, setStudyGroupChatRooms, initialReadSent, toast, allChatRoomMessagesRef]);

  // (이하 원본 코드와 동일)
  useEffect(() => {}, [selectedChatRoom]);

  return {
    scrollableDivRef,
    messagesEndRef,
    isScrolledToBottomRef,
    isChatContentVisible,
    showNewMessageToast,
    mediaInfos,
    loadChatRoomMessages,
    loadOlderMessages,
    setShowNewMessageToast,
    setIsChatContentVisible,
  };
};