export enum NotificationType {
    FRIEND_REQUEST = 'FRIEND_REQUEST',
    FRIEND_ACCEPT = 'FRIEND_ACCEPT',
    STUDY_GROUP_INVITE = 'STUDY_GROUP_INVITE',
    STUDY_GROUP_JOIN = 'STUDY_GROUP_JOIN',
    SCHEDULE_CREATE = 'SCHEDULE_CREATE',
    SCHEDULE_REMINDER = 'SCHEDULE_REMINDER',
    NEW_MESSAGE = 'NEW_MESSAGE',
}

export interface BaseNotificationData {
    type: NotificationType
}

export interface FriendNotificationData extends BaseNotificationData {
    type: NotificationType.FRIEND_REQUEST | NotificationType.FRIEND_ACCEPT
    memberId: number
    nickname: string
}

export interface StudyGroupNotificationData extends BaseNotificationData {
    type: NotificationType.STUDY_GROUP_INVITE | NotificationType.STUDY_GROUP_JOIN
    studyGroupId: number
    title: string
}

export interface ScheduleNotificationData extends BaseNotificationData {
    type: NotificationType.SCHEDULE_CREATE | NotificationType.SCHEDULE_REMINDER
    studyScheduleId: number
    title: string
    startTime: string
}

export interface ChatMessageNotificationData extends BaseNotificationData {
    type: NotificationType.NEW_MESSAGE
    chatRoomId: number
    senderId: number
    sender: string
}

export type NotificationData =
    | FriendNotificationData
    | StudyGroupNotificationData
    | ScheduleNotificationData
    | ChatMessageNotificationData

export interface Notification {
    id: string
    data: NotificationData
    read: boolean
    createdAt: string
}

export interface NotificationListResponse {
    status: number
    message: string
    result: {
        notifications: Notification[]
        nextCursor: string
        hasNext: boolean
    }
}

export interface UnreadCountResponse {
    status: number
    message: string
    result: {
        unreadCount: number
    }
} 