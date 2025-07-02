import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup as UIAvatarGroup } from '@/components/ui/avatar-group';
import { FriendChatRoom, StudyGroupChatRoom, MemberInfo } from '@/types/chat';

interface ChatHeaderProps {
  selectedChatRoom: FriendChatRoom | StudyGroupChatRoom | null;
  displayMemberInfos: MemberInfo[];
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedChatRoom,
  displayMemberInfos
}) => {
  if (!selectedChatRoom) return null;

  const isFriendChat = 'status' in selectedChatRoom;

  return (
    <div className="p-3 border-b flex items-center gap-3">
      {isFriendChat ? (
        <>
          <div className="relative">
            <Avatar>
              <AvatarImage
                src={selectedChatRoom.avatar || "/placeholder.svg"}
                alt={selectedChatRoom.name}
              />
              <AvatarFallback>{selectedChatRoom.name[0]}</AvatarFallback>
            </Avatar>
            <div
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background transition-colors duration-300 ${
                selectedChatRoom.status === "online" ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>
          <div className="flex-1">
            <div className="font-medium">{selectedChatRoom.name}</div>
            <div className="text-xs text-muted-foreground transition-colors duration-300">
              {selectedChatRoom.status === "online" ? "온라인" : "오프라인"}
            </div>
          </div>
        </>
      ) : (
        <>
          <UIAvatarGroup>
            {displayMemberInfos.slice(0, 3).map((member, index) => (
              <Avatar key={member.memberId} className={`h-8 w-8 ${index > 0 ? "-ml-3" : ""}`}>
                <AvatarImage src="/placeholder.svg" alt={member.nickname || 'Unknown'} />
                <AvatarFallback>{(member.nickname || 'Unknown')[0]}</AvatarFallback>
              </Avatar>
            ))}
          </UIAvatarGroup>
          <div className="flex-1">
            <div className="font-medium">{selectedChatRoom.name}</div>
            <div className="text-xs text-muted-foreground">
              {selectedChatRoom.memberCount !== undefined
                ? `${selectedChatRoom.memberCount}명 참여 중`
                : `${displayMemberInfos.length}명 참여 중`}
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 