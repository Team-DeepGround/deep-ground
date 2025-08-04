"use client"

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrentChatRoom } from './chat/chat-context';

// 훅들 임포트
import { useChat } from '@/hooks/use-chat';
import { useChatMessages } from '@/hooks/use-chat-messages';
import { useChatUpload } from '@/hooks/use-chat-upload';
import { FriendChatRoom, StudyGroupChatRoom } from '@/types/chat';

// 컴포넌트들 임포트
import { ChatSidebar } from './chat/chat-sidebar';
import { ChatContent } from './chat/chat-content';

// API 함수들 임포트
import { sendMessage } from '@/lib/api/websocket';

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPopup({ isOpen, onClose }: ChatPopupProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = useState(false); // 메시지 전송 중 상태 추가

  // 채팅 관련 훅들
  const {
    friendChatRooms,
    studyGroupChatRooms,
    selectedChatRoom,
    activeTab,
    isLoadingChatRooms,
    isConnected,
    stompClientState,
    allChatRoomMessages,
    allChatRoomMessagesRef,
    initialReadSent,
    friendCurrentPage,
    friendHasNext,
    studyGroupCurrentPage,
    studyGroupHasNext,
    isFriendChatRoomsLoaded,
    isStudyGroupChatRoomsLoaded,
    setSelectedChatRoom,
    setActiveTab,
    loadFriendChatRooms,
    loadStudyGroupChatRooms,
    fetchAndAddMemberInfo,
    setAllChatRoomMessages,
    setFriendChatRooms,
    setStudyGroupChatRooms,
  } = useChat(isOpen);

  // 메시지 관련 훅
  const {
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
  } = useChatMessages(
    stompClientState,
    isConnected,
    selectedChatRoom,
    allChatRoomMessages,
    setAllChatRoomMessages,
    allChatRoomMessagesRef,
    initialReadSent,
    fetchAndAddMemberInfo,
    setFriendChatRooms,
    setStudyGroupChatRooms
  );

  // 파일 업로드 관련 훅
  const {
    fileInputRef,
    uploadedFiles,
    uploadProgress,
    isUploading,
    handleFileUpload,
    handleFileChange,
    removeFile,
    uploadFilesForMessage,
    clearUploadedFiles,
  } = useChatUpload(selectedChatRoom);

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

    // "더 불러오기" 버튼 클릭 핸들러 (채팅방 목록 페이지네이션)
  const handleLoadMoreChatRooms = () => {
        if (activeTab === 'all' || activeTab === 'online') {
            if (friendHasNext && !isLoadingChatRooms) {
        loadFriendChatRooms(friendCurrentPage + 1);
            }
        } else if (activeTab === 'groups') {
            if (studyGroupHasNext && !isLoadingChatRooms) {
        loadStudyGroupChatRooms(studyGroupCurrentPage + 1);
      }
    }
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

  // 새 메시지 버튼 클릭 핸들러
  const handleNewMessageClick = () => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTo({
        top: scrollableDivRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
                                        setShowNewMessageToast(false);
  };

    // 메시지 전송 핸들러
    const handleSendMessage = async () => {
        if (!message.trim() && uploadedFiles.length === 0) return;
        if (isSending) return; // 이미 전송 중이면 중복 전송 방지
        
        if (!stompClientState || !isConnected) {
            toast({
                title: "채팅 서버 연결 끊김",
                description: "채팅 서버에 연결되어 있지 않거나 사용자 정보가 없습니다. 잠시 후 다시 시도해주세요.",
                variant: "destructive",
            });
            return;
        }
        const currentChatRoomId = selectedChatRoom?.chatRoomId;
        if (!currentChatRoomId) return;

        setIsSending(true); // 전송 시작
        const messageToSend = message.trim(); // 전송할 메시지 미리 저장
        setMessage(""); // 입력창 즉시 초기화

        let mediaIds: string[] = [];
        if (uploadedFiles.length > 0) {
            try {
        mediaIds = await uploadFilesForMessage(uploadedFiles.map(f => f.file));
            } catch (error) {
                toast({
                    title: "파일 업로드 실패",
                    description: "파일 업로드 중 오류가 발생했습니다.",
                    variant: "destructive",
                });
                setIsSending(false); // 전송 실패 시 상태 초기화
                return;
            }
        }

        try {
      sendMessage(stompClientState, currentChatRoomId, messageToSend, mediaIds);
      clearUploadedFiles();
        } catch (error) {
            console.error("메시지 전송 실패:", error);
            toast({
                title: "메시지 전송 실패",
                description: "메시지를 보내는 도중 오류가 발생했습니다.",
                variant: "destructive",
            });
        } finally {
            setIsSending(false); // 전송 완료 후 상태 초기화
        }
    };

  // 이미지 로드 시 스크롤 처리
  const handleImageLoad = () => {
    if (isScrolledToBottomRef.current && scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
    }
  };

  // STOMP 구독 관리 (stompClientState와 isConnected, selectedChatRoom 변경에 반응)
  useEffect(() => {
        const currentChatRoomId = selectedChatRoom?.chatRoomId;

    if (stompClientState && isConnected && currentChatRoomId) {
      console.log(`[STOMP Subscribe Effect] Attempting to subscribe to chat room ${currentChatRoomId}`);
      loadChatRoomMessages(currentChatRoomId);
    }
  }, [stompClientState, isConnected, selectedChatRoom, loadChatRoomMessages]);

  // 현재 채팅방 ID 설정
  const { setCurrentChatRoomId } = useCurrentChatRoom();

    useEffect(() => {
        if (selectedChatRoom) {
      setCurrentChatRoomId(selectedChatRoom.chatRoomId);
            // SSE에서 감지할 수 있도록 커스텀 이벤트 발생
            window.dispatchEvent(new CustomEvent('chat-room-changed', {
                detail: { chatRoomId: selectedChatRoom.chatRoomId }
      }));
        } else {
      setCurrentChatRoomId(null);
            // SSE에서 감지할 수 있도록 커스텀 이벤트 발생
            window.dispatchEvent(new CustomEvent('chat-room-changed', {
                detail: { chatRoomId: null }
      }));
        }
  }, [selectedChatRoom, setCurrentChatRoomId]);

    // SSE unreadCount 이벤트로 채팅방 외부 새 메시지 알림 토스트 표시
    useEffect(() => {
        function handleChatUnreadToast(e: any) {
      const { chatRoomId, unreadCount } = e.detail || {};
            // 친구 채팅방 목록에서 unreadCount 갱신
            // 그룹 채팅방 목록에서 unreadCount 갱신
            toast({
                title: '새 메시지',
                description: '새 메시지가 도착했습니다.',
                duration: 5000,
      });
        }
    window.addEventListener('chat-unread-toast', handleChatUnreadToast);
        return () => {
      window.removeEventListener('chat-unread-toast', handleChatUnreadToast);
    };
  }, [toast]);

  // 팝업이 닫힐 때 파일 업로드 초기화
    useEffect(() => {
        if (!isOpen) {
      clearUploadedFiles();
    }
  }, [isOpen, clearUploadedFiles]);

    // 채팅방 변경 시 메시지/업로드 상태 초기화 및 빠른 전환 대응
    const handleSelectChatRoom = (room: FriendChatRoom | StudyGroupChatRoom) => {
      // 현재 선택된 채팅방과 같은 채팅방을 클릭한 경우 아무것도 하지 않음
      if (selectedChatRoom?.chatRoomId === room.chatRoomId) {
        return;
      }

      if (!stompClientState || !isConnected) {
        toast({
          title: "채팅 서버 연결 중...",
          description: "채팅 서버에 연결이 완료된 후 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }
      setAllChatRoomMessages((prev) => ({ ...prev })); // 메시지 상태 강제 리렌더(불필요한 꼬임 방지)
      clearUploadedFiles(); // 업로드 상태 초기화
      setSelectedChatRoom(room);
    };

    if (!isOpen) return null;

    return (
    <div className="fixed bottom-20 right-6 z-50 w-[800px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] shadow-xl rounded-lg overflow-hidden">
            <Card className="border">
                <CardHeader className="p-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">메시지</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
                    </Button>
                </CardHeader>
        <CardContent className="p-0 flex" style={{ height: "500px" }}>
          <ChatSidebar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            friendChatRooms={friendChatRooms}
            studyGroupChatRooms={studyGroupChatRooms}
            selectedChatRoom={selectedChatRoom}
            onChatRoomSelect={handleSelectChatRoom}
            isLoadingChatRooms={isLoadingChatRooms}
            friendHasNext={friendHasNext}
            studyGroupHasNext={studyGroupHasNext}
            onLoadMore={handleLoadMoreChatRooms}
          />
          
          <ChatContent
            selectedChatRoom={selectedChatRoom}
            displayMessages={displayMessages}
            displayMemberInfos={displayMemberInfos}
            currentChatHasNext={currentChatHasNext}
            currentChatIsLoading={currentChatIsLoading}
            isChatContentVisible={isChatContentVisible}
            showNewMessageToast={showNewMessageToast}
            mediaInfos={mediaInfos}
            scrollableDivRef={scrollableDivRef as React.RefObject<HTMLDivElement>}
            messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
            uploadedFiles={uploadedFiles}
            message={message}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
            onLoadMoreMessages={handleLoadMoreMessages}
            onNewMessageClick={handleNewMessageClick}
            onRemoveFile={removeFile}
            onFileUpload={handleFileUpload}
            onFileChange={handleFileChange}
            onMessageChange={setMessage}
            onSendMessage={handleSendMessage}
            onImageLoad={handleImageLoad}
            isSending={isSending}
          />
                </CardContent>
            </Card>
        </div>
  );
}