import { api } from '@/lib/api-client'
import { NotificationListResponse, UnreadCountResponse } from '@/types/notification'

export const fetchNotificationsApi = async (cursor?: string, limit: number = 10): Promise<NotificationListResponse> => {
    try {
        const params: Record<string, string> = {}
        if (cursor) params.cursor = cursor
        params.limit = limit.toString()
        return await api.get('/notifications', { params })
    } catch (error) {
        throw error
    }
}

export const fetchUnreadCountApi = async (): Promise<UnreadCountResponse> => {
    try {
        return await api.get('/notifications/unread-count')
    } catch (error) {
        throw error
    }
}

export const markAsReadApi = async (notificationId: string) => {
    try {
        return await api.patch(`/notifications/${notificationId}/read`)
    } catch (error) {
        throw error
    }
}

export const markAllAsReadApi = async () => {
    try {
        return await api.patch('/notifications/read-all')
    } catch (error) {
        throw error
    }
}

export const deleteNotificationApi = async (notificationId: string) => {
    try {
        return await api.delete(`/notifications/${notificationId}`)
    } catch (error) {
        throw error
    }
} 