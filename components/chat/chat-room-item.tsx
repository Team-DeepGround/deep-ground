import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup as UIAvatarGroup } from '@/components/ui/avatar-group';
import { FriendChatRoom, StudyGroupChatRoom } from '@/types/chat';

interface ChatRoomItemProps {
  room: FriendChatRoom | StudyGroupChatRoom;
  isSelected: boolean;
  onClick: () => void;
  isGroup?: boolean;
}

export const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  room,
  isSelected,
  onClick,
  isGroup = false
}) => {
  if (isGroup) {
    const groupRoom = room as StudyGroupChatRoom;
    return (
      <div
        className={`flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer ${
          isSelected ? "bg-accent" : ""
        }`}
        onClick={onClick}
      >
        <div className="relative">
          <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
            <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
              {(groupRoom.name && groupRoom.name.trim().length > 0)
                ? groupRoom.name.trim()[0]
                : "?"}
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
      className={`flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer ${
        isSelected ? "bg-accent" : ""
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            {(friendRoom.name && friendRoom.name.trim().length > 0)
              ? friendRoom.name.trim()[0]
              : "?"}
          </span>
        </span>
        <div
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background transition-colors duration-300 ${
            friendRoom.status === "online" ? "bg-green-500" : "bg-gray-400"
          }`}
        />
        {friendRoom.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {friendRoom.unreadCount}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{friendRoom.name}</div>
        <div className="text-xs text-muted-foreground truncate transition-colors duration-300">
          {friendRoom.status === "online" ? "온라인" : "오프라인"}
        </div>
      </div>
    </div>
  );
}; 