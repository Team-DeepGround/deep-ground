"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { auth } from '@/lib/auth'
import { useAuth } from "@/components/auth-provider"

// 온라인 상태 관련 타입 정의
interface OnlineStatus {
  memberId: number;
  isOnline: boolean;
}

interface OnlineStatusResponse {
  status: number;
  message: string;
  result: OnlineStatus[];
}

interface PresenceDto {
  memberId: number;
  isOnline: boolean;
}

interface OnlineStatusContextType {
  onlineStatuses: Record<number, boolean>;
  setOnlineStatus: (memberId: number, isOnline: boolean) => void;
  isLoading: boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | null>(null)

export function useOnlineStatus() {
  const context = useContext(OnlineStatusContext)
  if (!context) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider')
  }
  return context
}

interface OnlineStatusProviderProps {
  children: React.ReactNode
}

export default function OnlineStatusProvider({ children }: OnlineStatusProviderProps) {
  const [onlineStatuses, setOnlineStatuses] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth();

  const setOnlineStatus = (memberId: number, isOnline: boolean) => {
    setOnlineStatuses(prev => ({
      ...prev,
      [memberId]: isOnline
    }))
  }

  // 초기 온라인 상태를 가져오는 함수
  const fetchInitialOnlineStatuses = async () => {
    try {
      setIsLoading(true)
      const token = await auth.getToken()
      if (!token) {
        console.log('[OnlineStatusProvider] No token available, skipping initial fetch')
        return
      }

      console.log('[OnlineStatusProvider] Fetching initial online statuses...')
      const response: OnlineStatusResponse = await api.get('/members/online')
      const statusMap: Record<number, boolean> = {}
      response.result.forEach(status => {
        statusMap[status.memberId] = status.isOnline
      })
      setOnlineStatuses(statusMap)
      console.log('[OnlineStatusProvider] Initial online statuses loaded:', statusMap)
    } catch (error) {
      console.error('[OnlineStatusProvider] Failed to fetch initial online statuses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 로그인 상태 확인 및 초기 온라인 상태 로드
  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialOnlineStatuses();
    }
  }, [isAuthenticated]);

  // SSE presence 이벤트 처리
  useEffect(() => {
    const handlePresenceUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const presenceData = customEvent.detail;
      console.log('[OnlineStatusProvider] Presence Update:', presenceData);
      
      setOnlineStatus(presenceData.memberId, presenceData.isOnline);
    };

    window.addEventListener('presence-update', handlePresenceUpdate);

    return () => {
      window.removeEventListener('presence-update', handlePresenceUpdate);
    };
  }, []);

  return (
    <OnlineStatusContext.Provider value={{ onlineStatuses, setOnlineStatus, isLoading }}>
      {children}
    </OnlineStatusContext.Provider>
  );
} 