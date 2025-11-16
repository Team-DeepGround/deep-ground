import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/auth';
// --- 수정 --- : fetchMemberInfo를 import합니다. (api.ts에서 가져옴)
import { fetchOlderMessages, downloadMedia, fetchMemberInfo } from '@/lib/api/chat';
import {
  subscribeToInitMessages,
  subscribeToLiveMessages,
  subscribeToReadReceipts,
  sendReadReceipt,
} from '@/lib/api/websocket';
import { Client } from '@stomp/stompjs';
import {
  ChatRoomMessagesState,
  ChatMessage,
  InitChatRoomResponse,
  MemberInfo,
  MediaInfo,
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
  fetchAndAddMemberInfo: ( // 💡 이 인자는 이제 사용되지 않지만, 시그니처는 유지합니다.
    chatRoomId: number,
    memberId: number
  ) => Promise<void>,
  setFriendChatRooms: (updater: (prev: any[]) => any[]) => void,
  setStudyGroupChatRooms: (updater: (prev: any[]) => any[]) => void
) => {
  const { toast } = useToast();

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

        // --- 💡 수정 --- : 누락된 멤버 정보 fetch (Promise.all)
        const currentMemberIds = new Set(
          allChatRoomMessagesRef.current[chatRoomId]?.memberInfos.map(
            (m) => m.memberId
          ) || []
        );
        const missingMemberIds = new Set(
          fetchedMessages
            .map((msg) => msg.senderId)
            .filter((id) => !currentMemberIds.has(id))
        );

        let newMemberInfos: MemberInfo[] = [];
        const myId = myInfoRef.current?.memberId; // 💡 'me' 플래그 보정용

        if (missingMemberIds.size > 0) {
          // 💡 fetchAndAddMemberInfo 대신 fetchMemberInfo 직접 사용
          const fetchedInfos = await Promise.all(
            Array.from(missingMemberIds).map((memberId) =>
              fetchMemberInfo(chatRoomId, memberId)
            )
          );
          // 💡 'me' 플래그 보정
          newMemberInfos = fetchedInfos.map((info) => ({
            ...info,
            me: info.me === true || (myId !== null && info.memberId === myId),
          }));
        }
        // --- 💡 수정 끝 ---

        setAllChatRoomMessages((prev) => {
          const currentRoomState = prev[chatRoomId];
          if (currentRoomState) {
            // 💡 멤버 정보와 메시지를 *동시에* 업데이트
            const updatedMessages = [
              ...fetchedMessages,
              ...currentRoomState.messages,
            ];
            // 💡 중복 방지 (Set을 사용하거나 간단히 합침)
            const allMemberInfosMap = new Map<number, MemberInfo>();
            currentRoomState.memberInfos.forEach(m => allMemberInfosMap.set(m.memberId, m));
            newMemberInfos.forEach(m => allMemberInfosMap.set(m.memberId, m));
            
            return {
              ...prev,
              [chatRoomId]: {
                ...currentRoomState,
                messages: updatedMessages,
                memberInfos: Array.from(allMemberInfosMap.values()), // 💡
                nextCursor: nextCursor,
                hasNext: hasNext,
                isLoadingMessages: false,
              },
            };
          }
          return prev;
        });

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
    [toast, setAllChatRoomMessages, allChatRoomMessagesRef] // 💡 fetchAndAddMemberInfo 의존성 제거
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


  // 1. 구독 및 cleanup useEffect
  useEffect(() => {
    if (!stompClientState || !isConnected || !selectedChatRoom) return;
    const chatRoomId = selectedChatRoom.chatRoomId;
    setIsChatContentVisible(false);
    setShowNewMessageToast(false);
    setMediaInfos({});

    const subsInit = subscribeToInitMessages(
      stompClientState,
      chatRoomId,
      async (res: InitChatRoomResponse) => {
        let myMemberId: number | null = null;
        try {
          myMemberId = await auth.getMemberId();
        } catch {}

        const memberInfosWithIsMe = (res.memberInfos || []).map((m) => ({
          ...m,
          me: m.me === true || (myMemberId !== null && m.memberId === myMemberId),
        }));

        myInfoRef.current = memberInfosWithIsMe.find((m) => m.me);

        const allSenderIds = new Set(
          res.chatMessage.messages.map((msg) => msg.senderId)
        );
        const knownMemberIds = new Set(memberInfosWithIsMe.map((m) => m.memberId));
        const missingMemberIds = Array.from(allSenderIds).filter(
          (senderId) => !knownMemberIds.has(senderId)
        );

        if (missingMemberIds.length > 0) {
          try {
            const newMemberInfos = await Promise.all(
              missingMemberIds.map((memberId) =>
                fetchMemberInfo(chatRoomId, memberId)
              )
            );
            // 💡 'me' 플래그 보정
            memberInfosWithIsMe.push(
              ...newMemberInfos.map((m) => ({
                ...m,
                me: m.me === true || (myMemberId !== null && m.memberId === myMemberId),
              }))
            );
          } catch (e) {
            console.error('초기 로드 시 누락된 멤버 정보 조회 실패:', e);
          }
        }

        setAllChatRoomMessages((prev) => {
          // 💡 레이스 컨디션 방지: /init 이전에 /live가 도착했을 수 있음
          // /init 메시지와 /live로 도착한 메시지를 머지
          const currentMessages = prev[chatRoomId]?.messages || [];
          const initMessages = res.chatMessage.messages || [];
          
          const allMessagesMap = new Map<string, ChatMessage>();
          initMessages.forEach(msg => allMessagesMap.set(msg.id, msg));
          currentMessages.forEach(msg => allMessagesMap.set(msg.id, msg));

          const combinedMessages = Array.from(allMessagesMap.values()).sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
          );

          const newState = {
            ...prev,
            [chatRoomId]: {
              ...prev[chatRoomId],
              messages: combinedMessages, // 💡 수정: 머지된 메시지
              nextCursor: res.chatMessage.nextCursor,
              hasNext: res.chatMessage.hasNext,
              memberInfos: memberInfosWithIsMe,
              isLoadingMessages: false,
            },
          };

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
      // --- 💡 수정 --- : 멤버 fetch 로직 변경
      async (newMessage: ChatMessage) => {
        let newSenderInfo: MemberInfo | null = null;
        const myId = myInfoRef.current?.memberId;

        // 💡 상태 업데이트 전에 멤버 정보가 있는지 확인
        const currentRoomState = allChatRoomMessagesRef.current[chatRoomId];
        const senderExists = currentRoomState?.memberInfos.some(
          (m) => m.memberId === newMessage.senderId
        );

        if (!senderExists) {
          try {
            // 💡 fetchAndAddMemberInfo 대신 fetchMemberInfo 직접 사용
            const fetchedInfo = await fetchMemberInfo(
              chatRoomId,
              newMessage.senderId
            );
            // 💡 'me' 플래그 보정
            newSenderInfo = {
              ...fetchedInfo,
              me:
                fetchedInfo.me === true ||
                (myId !== null && fetchedInfo.memberId === myId),
            };
          } catch (e) {
            console.error('실시간 메시지 멤버 정보 조회 실패:', e);
            // 💡 실패 시 '알 수 없음' 플레이스홀더 생성
            newSenderInfo = {
              memberId: newMessage.senderId,
              nickname: '알 수 없음',
              profileImageUrl: undefined, // 혹은 기본 이미지
              me: false,
            };
          }
        }
        
        setAllChatRoomMessages((prevGlobalState) => {
          // 💡 fetchAndAddMemberInfo가 아닌 로컬에서 가져온 정보로 상태 업데이트
          const currentRoomState = prevGlobalState[chatRoomId];

          if (currentRoomState) {
            // 중복 메시지 방지
            if (
              currentRoomState.messages.some((msg) => msg.id === newMessage.id)
            ) {
              return prevGlobalState; // 변경 없음
            }
            
            let updatedMemberInfos = [...currentRoomState.memberInfos];
            // 💡 새 멤버 정보가 있으면 배열에 추가
            if (newSenderInfo) {
              updatedMemberInfos.push(newSenderInfo);
            }

            const wasScrolledToBottom = isScrolledToBottomRef.current;

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

            // 💡 메시지와 멤버 정보를 *동시에* 업데이트
            const newState = {
              ...prevGlobalState,
              [chatRoomId]: {
                ...currentRoomState,
                messages: [...currentRoomState.messages, newMessage],
                memberInfos: updatedMemberInfos, // 💡
              },
            };

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
          return prevGlobalState; // 변경 없음
        });
      },
      (error) => {}
    );

    const subsRead = subscribeToReadReceipts(
      stompClientState,
      chatRoomId,
      // --- 💡 수정 --- : 멤버 fetch 로직 변경
      async (readReceipt: { memberId: number; lastReadMessageTime: string }) => {
        let newMemberInfo: MemberInfo | null = null;
        const myId = myInfoRef.current?.memberId;

        const currentRoomState = allChatRoomMessagesRef.current[chatRoomId];
        const memberExists = currentRoomState?.memberInfos.some(
          (m) => m.memberId === readReceipt.memberId
        );
        
        if (!memberExists) {
          try {
            // 💡 fetchAndAddMemberInfo 대신 fetchMemberInfo 직접 사용
            const fetchedInfo = await fetchMemberInfo(
              chatRoomId,
              readReceipt.memberId
            );
            // 💡 'me' 플래그 보정
            newMemberInfo = {
              ...fetchedInfo,
              me:
                fetchedInfo.me === true ||
                (myId !== null && fetchedInfo.memberId === myId),
            };
          } catch (e) {
            console.error('읽음 처리 멤버 정보 조회 실패:', e);
            // 💡 실패 시 '알 수 없음' 플레이스홀더 생성
            newMemberInfo = {
              memberId: readReceipt.memberId,
              nickname: '알 수 없음',
              profileImageUrl: undefined,
              me: false,
            };
          }
        }
        
        setAllChatRoomMessages((prevGlobalState) => {
          const currentRoomState = prevGlobalState[chatRoomId];

          if (currentRoomState) {
            let updatedMemberInfos = [...currentRoomState.memberInfos];
            
            // 💡 새 멤버 정보가 있으면 배열에 추가
            if (newMemberInfo) {
              updatedMemberInfos.push(newMemberInfo);
            }

            // 💡 이제 멤버가 존재하므로 map으로 lastReadMessageTime 업데이트
            updatedMemberInfos = updatedMemberInfos.map((member) =>
              member.memberId === readReceipt.memberId
                ? {
                    ...member,
                    lastReadMessageTime: readReceipt.lastReadMessageTime,
                  }
                : member
            );
            
            // 💡 "알 수 없음" 방어 코드 (원본 458라인)가 더 이상 필요 없음

            return {
              ...prevGlobalState,
              [chatRoomId]: {
                ...currentRoomState,
                memberInfos: updatedMemberInfos,
              },
            };
          }
          return prevGlobalState;
        });
      },
      (error) => {}
    );
    
    return () => {
      subsInit.unsubscribe();
      subsLive.unsubscribe();
      subsRead.unsubscribe();
    };
  }, [
    stompClientState, 
    isConnected, 
    selectedChatRoom, 
    // 💡 fetchAndAddMemberInfo는 더 이상 로직에 영향을 주지 않음
    setFriendChatRooms, 
    setStudyGroupChatRooms, 
    initialReadSent, 
    toast, 
    allChatRoomMessagesRef
  ]);

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