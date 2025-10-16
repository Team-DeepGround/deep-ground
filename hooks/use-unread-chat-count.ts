"use client"

import { useState, useEffect } from 'react';
import { fetchFriendChatRooms, fetchStudyGroupChatRooms } from '@/lib/api/chat';

export function useUnreadChatCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true);
      console.log('fetchUnreadCount 시작');
      
      // 친구 채팅방과 스터디 그룹 채팅방의 읽지 않은 메시지 개수를 모두 가져옴
      const [friendRoomsResult, studyGroupRoomsResult] = await Promise.all([
        fetchFriendChatRooms(1),
        fetchStudyGroupChatRooms(1)
      ]);
      
      // 혹시 다른 API 엔드포인트가 있는지 확인
      try {
        const { api } = await import('@/lib/api-client');
        const allRoomsResponse = await api.get('/chatrooms');
        console.log('전체 채팅방 API 응답:', allRoomsResponse);
      } catch (error) {
        console.log('전체 채팅방 API 호출 실패:', error);
      }

      console.log('친구 채팅방 결과:', friendRoomsResult);
      console.log('스터디 그룹 채팅방 결과:', studyGroupRoomsResult);
      
      // 각 채팅방의 unreadCount 상세 확인
      friendRoomsResult.chatRooms.forEach((room, index) => {
        console.log(`친구 채팅방 ${index}:`, room.name, 'unreadCount:', room.unreadCount);
      });
      studyGroupRoomsResult.chatRooms.forEach((room, index) => {
        console.log(`스터디 그룹 채팅방 ${index}:`, room.name, 'unreadCount:', room.unreadCount);
      });

      // 모든 채팅방의 unreadCount를 합산
      const totalUnreadCount = 
        friendRoomsResult.chatRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0) +
        studyGroupRoomsResult.chatRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);

      console.log('총 읽지 않은 메시지 개수:', totalUnreadCount);
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
