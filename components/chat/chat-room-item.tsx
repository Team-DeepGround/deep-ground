import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup as UIAvatarGroup } from '@/components/ui/avatar-group';
import { FriendChatRoom, StudyGroupChatRoom } from '@/types/chat';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatRoomItemProps {
  room: FriendChatRoom | StudyGroupChatRoom;
  isSelected: boolean;
  onClick: () => void;
  isGroup?: boolean;
  onStartChat?: (friend: FriendChatRoom) => void;
  isFriendList?: boolean; // 친구목록 탭인지 구분
}

export const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  room,
  isSelected,
  onClick,
  isGroup = false,
  onStartChat,
  isFriendList = false,
}) => {
  const [showChatButton, setShowChatButton] = useState(false);
  if (isGroup) {
    const groupRoom = room as StudyGroupChatRoom;
    return (
      <div
        className={`flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer ${
          isSelected ? 'bg-accent' : ''
        }`}
        onClick={onClick}
      >
        <div className="relative">
          <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
              {groupRoom.name && groupRoom.name.trim().length > 0
                ? groupRoom.name.trim()[0]
                : '?'}
            </span>
          </span>
          {groupRoom.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {groupRoom.unreadCount}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{groupRoom.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {groupRoom.memberCount}명 참여 중
          </div>
        </div>
      </div>
    );
  }

  const friendRoom = room as FriendChatRoom;
  return (
    <div
      className={`group flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer ${
        isSelected ? 'bg-accent' : ''
      }`}
      onClick={() => {
        if (isFriendList) {
          setShowChatButton(!showChatButton);
        } else {
          onClick();
        }
      }}
    >
      <div className="relative">
        <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            {friendRoom.name && friendRoom.name.trim().length > 0
              ? friendRoom.name.trim()[0]
              : '?'}
          </span>
        </span>
        <div
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background transition-colors duration-300 ${
            friendRoom.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        {friendRoom.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {friendRoom.unreadCount}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex justify-between items-center">
        <div className="min-w-0">
          {' '}
          <div className="font-medium truncate">{friendRoom.name}</div>
          <div className="text-xs text-muted-foreground truncate ...">
            {friendRoom.status === 'online' ? '온라인' : '오프라인'}
          </div>
        </div>
        
        {/* 친구목록 탭에서만 대화하기 버튼 표시 */}
        {isFriendList ? (
          showChatButton ? (
            <div className="flex gap-1">
              {onStartChat && (
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartChat(friendRoom);
                    setShowChatButton(false);
                  }}
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  대화하기
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChatButton(false);
                }}
              >
                취소
              </Button>
            </div>
          ) : (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-muted-foreground">클릭하여 대화하기</span>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};