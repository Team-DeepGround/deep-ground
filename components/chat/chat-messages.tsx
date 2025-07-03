import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, MessageSquare } from 'lucide-react';
import { ChatMessageItem } from './chat-message-item';
import { ChatMessage, MemberInfo, FriendChatRoom, StudyGroupChatRoom } from '@/types/chat';
import { isSameDay, formatDateForSeparator } from '@/lib/chat-utils';

interface ChatMessagesProps {
  selectedChatRoom: FriendChatRoom | StudyGroupChatRoom | null;
  displayMessages: ChatMessage[];
  displayMemberInfos: MemberInfo[];
  currentChatHasNext: boolean;
  currentChatIsLoading: boolean;
  isChatContentVisible: boolean;
  showNewMessageToast: boolean;
  mediaInfos: Record<string, { url: string; contentType: string; fileName: string; fileSize: number; }>;
  scrollableDivRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onLoadMoreMessages: () => void;
  onNewMessageClick: () => void;
  onImageLoad?: () => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  selectedChatRoom,
  displayMessages,
  displayMemberInfos,
  currentChatHasNext,
  currentChatIsLoading,
  isChatContentVisible,
  showNewMessageToast,
  mediaInfos,
  scrollableDivRef,
  messagesEndRef,
  onLoadMoreMessages,
  onNewMessageClick,
  onImageLoad
}) => {
  // 메시지 렌더링을 위한 메모이제이션
  const messageElements = useMemo(() => {
    return displayMessages.map((msg, index) => {
      const sender = displayMemberInfos.find(m => m.memberId === msg.senderId);
      // isMe만 사용
      const isMe = sender?.me === true;
      const senderName = isMe ? "나" : sender?.nickname || "알 수 없음";

      // 날짜 구분선 로직
      const currentDate = new Date(msg.createdAt);
      const prevMessage = displayMessages[index - 1];
      const prevDate = prevMessage ? new Date(prevMessage.createdAt) : null;
      const showDateSeparator = !prevDate || !isSameDay(currentDate, prevDate);

      return (
        <ChatMessageItem
          key={msg.id}
          message={msg}
          memberInfos={displayMemberInfos}
          currentMemberId={null}
          isMe={isMe}
          senderName={senderName}
          showDateSeparator={showDateSeparator}
          dateSeparatorText={formatDateForSeparator(msg.createdAt)}
          mediaInfos={mediaInfos}
          onImageLoad={onImageLoad}
        />
      );
    });
  }, [displayMessages, displayMemberInfos, mediaInfos, onImageLoad]);

  if (!selectedChatRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">메시지를 시작하세요</h3>
        <p className="text-muted-foreground mt-1">친구나 그룹을 선택하여 대화를 시작하세요.</p>
      </div>
    );
  }

  return (
    <>
      <div ref={scrollableDivRef} className="flex-1 p-4 overflow-y-auto h-full">
        {currentChatIsLoading && displayMessages.length === 0 && (
          <div className="text-center text-muted-foreground">메시지를 불러오는 중...</div>
        )}
        
        {currentChatHasNext && (
          <div className="text-center mt-4">
            <Button
              variant="outline"
              onClick={onLoadMoreMessages}
              disabled={currentChatIsLoading}
            >
              {currentChatIsLoading ? "이전 메시지 불러오는 중..." : "이전 메시지 불러오기"}
            </Button>
          </div>
        )}
        
        {/* Conditional rendering for actual messages with opacity transition */}
        <div
          className={`space-y-4 transition-opacity duration-300 ${isChatContentVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          {messageElements}
        </div>
        
        {displayMessages.length === 0 && !currentChatIsLoading && isChatContentVisible && (
          <div className="text-center text-muted-foreground">아직 메시지가 없습니다.</div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* 새 메시지 버튼 */}
      {showNewMessageToast && (
        <Button
          className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-blue-500 text-white rounded-full px-4 py-2 shadow-lg z-10 hover:bg-blue-600 transition-all flex items-center gap-1 text-sm"
          onClick={onNewMessageClick}
        >
          새 메시지 <ArrowDown size={16} />
        </Button>
      )}
    </>
  );
}; 