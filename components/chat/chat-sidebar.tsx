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
  onLeaveChatRoom: (chatRoomId: number, chatRoomName: string) => void;
  onStartChat?: (friend: FriendChatRoom) => void;
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
  onLoadMore,
  onLeaveChatRoom,
  onStartChat
}) => {
  // 친구 검색 필터링
  const filteredFriends = friendChatRooms.filter(
    (friend) => friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // '채팅' 탭을 위한 데이터: 친구 + 그룹 채팅방을 합치고 최신 메시지 순으로 정렬
  const allChatRooms = [...friendChatRooms, ...studyGroupChatRooms]
    .sort((a, b) => {
      // lastMessageTime이 없으면 lastReadMessageTime을 사용하고, 그것도 없으면 아주 오래된 시간으로 간주
      const timeA = new Date(a.lastMessageTime || a.lastReadMessageTime || 0).getTime();
      const timeB = new Date(b.lastMessageTime || b.lastReadMessageTime || 0).getTime();
      return timeB - timeA; // 내림차순 정렬 (최신이 위로)
    })
    .filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()));


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
            <TabsTrigger value="chat">채팅</TabsTrigger>
            <TabsTrigger value="online">친구목록</TabsTrigger>
            <TabsTrigger value="groups">스터디그룹</TabsTrigger>
          </TabsList>
        </div>

        {isLoadingChatRooms && (
          <div className="p-4 text-center text-muted-foreground">채팅방을 불러오는 중...</div>
        )}

        <TabsContent value="chat" className="m-0">
          <div className="h-full max-h-[420px] overflow-y-auto">
            <div className="p-3 space-y-2">
              {!isLoadingChatRooms && allChatRooms.length === 0 && (
                <div className="text-center text-muted-foreground">채팅방이 없습니다.</div>
              )}
              {allChatRooms.map((room) => (
                <ChatRoomItem
                  key={room.chatRoomId}
                  room={room}
                  isSelected={selectedChatRoom?.chatRoomId === room.chatRoomId}
                  onClick={() => onChatRoomSelect(room)}
                  // 'status' 속성 유무로 친구/그룹 채팅방 구분
                  isGroup={!('status' in room)}
                  onLeaveChatRoom={onLeaveChatRoom}
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
              {!isLoadingChatRooms && filteredFriends.length === 0 && (
                <div className="text-center text-muted-foreground">친구가 없습니다.</div>
              )}
              {filteredFriends
                .map((friend) => (
                  <ChatRoomItem
                    key={friend.chatRoomId}
                    room={friend}
                    isSelected={selectedChatRoom?.chatRoomId === friend.chatRoomId}
                    onClick={() => onChatRoomSelect(friend)}
                    isGroup={false}
                    onLeaveChatRoom={onLeaveChatRoom} // 친구 채팅방에서도 나가기 기능 사용
                    onStartChat={onStartChat} // 대화하기 기능 추가
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
                  onLeaveChatRoom={onLeaveChatRoom}
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