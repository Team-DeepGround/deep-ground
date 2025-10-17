"use client"

import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';

export function useUnreadChatCount(enabled: boolean = true) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      setIsLoading(true);
      
      if (!enabled) {
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }
      
      // 로그인 토큰이 없으면 네트워크 호출을 건너뜀
      const token = await auth.getToken();
      if (!token) {
        setUnreadCount(0);
        setIsLoading(false);
        return;
      }
      
      // 전체 채팅방 API를 사용해서 읽지 않은 메시지 개수 가져오기
      const { api } = await import('@/lib/api-client');
      const allRoomsResponse = await api.get('/chatrooms');
      
      // 모든 채팅방의 unreadCount를 합산
      const rooms = (allRoomsResponse.result.chatRooms || []) as Array<{ unreadCount?: number }>
      const totalUnreadCount = rooms.reduce(
        (sum: number, room: { unreadCount?: number }) => sum + (room.unreadCount || 0), 
        0
      );

      setUnreadCount(totalUnreadCount);
    } catch (error) {
      console.error('읽지 않은 메시지 개수 조회 실패:', error);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    fetchUnreadCount();
    
    // 5초마다 읽지 않은 메시지 개수 업데이트 (더 빠른 반영)
    const interval = setInterval(fetchUnreadCount, 5000);
    
    // SSE 이벤트 리스너 - 새 메시지가 올 때마다 즉시 업데이트
    const handleChatMessage = () => {
      fetchUnreadCount();
    };
    
    // 채팅 관련 이벤트들 리스닝
    window.addEventListener('chat-message-received', handleChatMessage);
    window.addEventListener('chat-unread-updated', handleChatMessage);
    window.addEventListener('chat-unread-count', handleChatMessage); // SSE에서 발생하는 이벤트
    
    // 페이지 포커스 시 업데이트 (사용자가 다른 탭에서 돌아왔을 때)
    const handleFocus = () => {
      fetchUnreadCount();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('chat-message-received', handleChatMessage);
      window.removeEventListener('chat-unread-updated', handleChatMessage);
      window.removeEventListener('chat-unread-count', handleChatMessage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled]);

  return { unreadCount, isLoading, refetch: fetchUnreadCount };
}
