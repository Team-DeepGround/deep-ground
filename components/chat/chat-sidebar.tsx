import React from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChatRoomItem } from './chat-room-item';
import { FriendChatRoom, StudyGroupChatRoom, ChatTab } from '@/types/chat';

interface ChatSidebarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeTab: ChatTab;
  onTabChange: (tab: ChatTab) => void;
  friendChatRooms: FriendChatRoom[];
  studyGroupChatRooms: StudyGroupChatRoom[];
  selectedChatRoom: FriendChatRoom | StudyGroupChatRoom | null;
  onChatRoomSelect: (room: FriendChatRoom | StudyGroupChatRoom) => void;
  isLoadingChatRooms: boolean;
  friendHasNext: boolean;
  studyGroupHasNext: boolean;
  onLoadMore: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  friendChatRooms,
  studyGroupChatRooms,
  selectedChatRoom,
  onChatRoomSelect,
  isLoadingChatRooms,
  friendHasNext,
  studyGroupHasNext,
  onLoadMore
}) => {
  // 친구 검색 필터링
  const filteredFriends = friendChatRooms.filter(
    (friend) => friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-[280px] border-r">
      <div className="p-3 border-b">
        <Input
          placeholder="친구 검색..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => onTabChange(value as ChatTab)} className="w-full">
        <div className="px-3 pt-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="online">온라인</TabsTrigger>
            <TabsTrigger value="groups">스터디그룹</TabsTrigger>
          </TabsList>
        </div>

        {isLoadingChatRooms && (
          <div className="p-4 text-center text-muted-foreground">채팅방을 불러오는 중...</div>
        )}

        <TabsContent value="all" className="m-0">
          <div className="h-full max-h-[420px] overflow-y-auto">
            <div className="p-3 space-y-2">
              {!isLoadingChatRooms && filteredFriends.length === 0 && (
                <div className="text-center text-muted-foreground">친구 채팅방이 없습니다.</div>
              )}
              {filteredFriends.map((friend) => (
                <ChatRoomItem
                  key={friend.chatRoomId}
                  room={friend}
                  isSelected={selectedChatRoom?.chatRoomId === friend.chatRoomId}
                  onClick={() => onChatRoomSelect(friend)}
                  isGroup={false}
                />
              ))}
              {friendHasNext && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    onClick={onLoadMore}
                    disabled={isLoadingChatRooms}
                  >
                    {isLoadingChatRooms ? "불러오는 중..." : "더 불러오기"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="online" className="m-0">
          <div className="h-full max-h-[420px] overflow-y-auto">
            <div className="p-3 space-y-2">
              {!isLoadingChatRooms && filteredFriends.filter((friend) => friend.status === "online").length === 0 && (
                <div className="text-center text-muted-foreground">온라인 친구가 없습니다.</div>
              )}
              {filteredFriends
                .filter((friend) => friend.status === "online")
                .map((friend) => (
                  <ChatRoomItem
                    key={friend.chatRoomId}
                    room={friend}
                    isSelected={selectedChatRoom?.chatRoomId === friend.chatRoomId}
                    onClick={() => onChatRoomSelect(friend)}
                    isGroup={false}
                  />
                ))}
              {friendHasNext && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    onClick={onLoadMore}
                    disabled={isLoadingChatRooms}
                  >
                    {isLoadingChatRooms ? "불러오는 중..." : "더 불러오기"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="m-0">
          <div className="h-full max-h-[420px] overflow-y-auto">
            <div className="p-3 space-y-2">
              {!isLoadingChatRooms && studyGroupChatRooms.length === 0 && (
                <div className="text-center text-muted-foreground">스터디그룹 채팅방이 없습니다.</div>
              )}
              {studyGroupChatRooms.map((group) => (
                <ChatRoomItem
                  key={group.chatRoomId}
                  room={group}
                  isSelected={selectedChatRoom?.chatRoomId === group.chatRoomId}
                  onClick={() => onChatRoomSelect(group)}
                  isGroup={true}
                />
              ))}
              {studyGroupHasNext && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    onClick={onLoadMore}
                    disabled={isLoadingChatRooms}
                  >
                    {isLoadingChatRooms ? "불러오는 중..." : "더 불러오기"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 