export enum NotificationType {
    FRIEND_REQUEST = 'FRIEND_REQUEST',
    FRIEND_ACCEPT = 'FRIEND_ACCEPT',
    STUDY_GROUP_JOIN = 'STUDY_GROUP_JOIN',
    STUDY_GROUP_KICK = 'STUDY_GROUP_KICK',
    STUDY_GROUP_ACCEPT = 'STUDY_GROUP_ACCEPT',
    SCHEDULE_CREATE = 'SCHEDULE_CREATE',
    SCHEDULE_REMINDER = 'SCHEDULE_REMINDER',
    FEED_COMMENT = 'FEED_COMMENT',
    QNA_ANSWER = 'QNA_ANSWER',
    QNA_COMMENT = 'QNA_COMMENT',
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
    type: NotificationType.STUDY_GROUP_JOIN | NotificationType.STUDY_GROUP_KICK | NotificationType.STUDY_GROUP_ACCEPT
    studyGroupId: number
    title: string
}

export interface ScheduleNotificationData extends BaseNotificationData {
    type: NotificationType.SCHEDULE_CREATE | NotificationType.SCHEDULE_REMINDER
    studyScheduleId: number
    title: string
    startTime: string
}

export interface FeedCommentNotificationData extends BaseNotificationData {
    type: NotificationType.FEED_COMMENT
    feedId: number
    content: string
}

export interface QnaNotificationData extends BaseNotificationData {
    type: NotificationType.QNA_ANSWER | NotificationType.QNA_COMMENT
    questionId: number
    content: string
}

export type NotificationData =
    | FriendNotificationData
    | StudyGroupNotificationData
    | ScheduleNotificationData
    | FeedCommentNotificationData
    | QnaNotificationData

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