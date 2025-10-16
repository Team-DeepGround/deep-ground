"use client"

import { useState, useEffect } from 'react';
import { fetchFriendChatRooms, fetchStudyGroupChatRooms } from '@/lib/api/chat';

export function useUnreadChatCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true);
      
      // 친구 채팅방과 스터디 그룹 채팅방의 읽지 않은 메시지 개수를 모두 가져옴
      const [friendRoomsResult, studyGroupRoomsResult] = await Promise.all([
        fetchFriendChatRooms(1),
        fetchStudyGroupChatRooms(1)
      ]);

      // 모든 채팅방의 unreadCount를 합산
      const totalUnreadCount = 
        friendRoomsResult.chatRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0) +
        studyGroupRoomsResult.chatRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);

      setUnreadCount(totalUnreadCount);
    } catch (error) {
      console.error('읽지 않은 메시지 개수 조회 실패:', error);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // 30초마다 읽지 않은 메시지 개수 업데이트
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { unreadCount, isLoading, refetch: fetchUnreadCount };
}
