"use client"

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { auth } from '@/lib/auth';

export function useUnreadChatCount(enabled: boolean = true) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!enabled) return;
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
      const allRoomsResponse = await api.get('/chatrooms');
      
      // 모든 채팅방의 unreadCount를 합산
      const rooms = (allRoomsResponse.result.chatRooms || []) as Array<{ unreadCount?: number }>
      const totalUnreadCount = rooms.reduce(
        (sum: number, room: { unreadCount?: number }) => sum + (room.unreadCount || 0), 
        0
      );
      
      setUnreadCount(totalUnreadCount);
    } catch (error) {
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const handleUnreadCountEvent = useCallback(async (e: any) => {
    if (!enabled) return;
    
    const { chatRoomId, unreadCount, senderId } = e.detail || {};
    const currentUserId = await auth.getMemberId();

    // 내가 보낸 메시지로 인한 이벤트는 무시
    if (senderId === currentUserId) {
      return;
    }

    // 현재 보고 있는 채팅방에 대한 이벤트는 무시 (useChat 훅에서 처리)
    const currentChatRoomId = window.globalCurrentChatRoomId;
    if (currentChatRoomId === chatRoomId) {
      return;
    }

    // 전체 unreadCount를 다시 fetch하는 대신, 증감분을 계산하여 상태 업데이트
    // 이 방식은 정확하지 않을 수 있으므로, 전체를 다시 fetch하는 것이 더 안정적일 수 있음
    // 여기서는 기존 로직대로 전체 fetch를 호출
    fetchUnreadCount();

  }, [enabled, fetchUnreadCount]);

  // 페이지 포커스 시 업데이트 (사용자가 다른 탭에서 돌아왔을 때)
  const handleFocus = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!enabled) {
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    fetchUnreadCount();

    window.addEventListener('chat-unread-count', handleUnreadCountEvent);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('chat-unread-count', handleUnreadCountEvent);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, handleUnreadCountEvent, handleFocus]);

  return { unreadCount, isLoading, refetch: fetchUnreadCount };
}
