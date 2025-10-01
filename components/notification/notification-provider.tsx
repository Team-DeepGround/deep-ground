"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useNotificationSSE } from "./use-notification-sse"
import { Notification } from '@/types/notification'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  isLoading: boolean
  hasNext: boolean
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  loadMoreNotifications: () => Promise<void>
  reconnect: () => Promise<(() => void) | undefined>
  fetchNotifications: (cursor?: string, limit?: number) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationData = useNotificationSSE()

  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  )
} 