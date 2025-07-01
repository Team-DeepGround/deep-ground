import React from 'react'
import { Notification, NotificationType } from '@/types/notification'
import { UserPlus, UserCheck, BookOpen, Users, Calendar, Clock, MessageSquare, Bell } from 'lucide-react'

export function getNotificationTitle(type: NotificationType) {
    switch (type) {
        case NotificationType.FRIEND_REQUEST:
            return '친구 요청'
        case NotificationType.FRIEND_ACCEPT:
            return '친구 요청 수락'
        case NotificationType.STUDY_GROUP_INVITE:
            return '스터디 그룹 초대'
        case NotificationType.STUDY_GROUP_JOIN:
            return '스터디 그룹 가입'
        case NotificationType.SCHEDULE_CREATE:
            return '스터디 일정 생성'
        case NotificationType.SCHEDULE_REMINDER:
            return '스터디 일정 알림'
        case NotificationType.NEW_MESSAGE:
            return '새 메시지'
        default:
            return '알림'
    }
}

export function getNotificationMessage(notification: Notification) {
    switch (notification.data.type) {
        case NotificationType.FRIEND_REQUEST:
            return `${notification.data.nickname}님이 친구 요청을 보냈습니다.`
        case NotificationType.FRIEND_ACCEPT:
            return `${notification.data.nickname}님이 친구 요청을 수락했습니다.`
        case NotificationType.STUDY_GROUP_INVITE:
            return `${notification.data.title} 스터디 그룹에 초대되었습니다.`
        case NotificationType.STUDY_GROUP_JOIN:
            return `새로운 멤버가 ${notification.data.title} 스터디 그룹에 가입했습니다.`
        case NotificationType.SCHEDULE_CREATE:
            return `새로운 스터디 일정이 생성되었습니다: ${notification.data.title}`
        case NotificationType.SCHEDULE_REMINDER:
            return `스터디 일정 알림: ${notification.data.title}`
        case NotificationType.NEW_MESSAGE:
            return `${notification.data.sender}님이 새 메시지를 보냈습니다.`
        default:
            return '새로운 알림이 있습니다.'
    }
}

export function getNotificationIcon(type: NotificationType): React.ReactNode {
    switch (type) {
        case NotificationType.FRIEND_REQUEST:
            return <UserPlus className="h-5 w-5 text-blue-500" />
        case NotificationType.FRIEND_ACCEPT:
            return <UserCheck className="h-5 w-5 text-green-500" />
        case NotificationType.STUDY_GROUP_INVITE:
            return <BookOpen className="h-5 w-5 text-purple-500" />
        case NotificationType.STUDY_GROUP_JOIN:
            return <Users className="h-5 w-5 text-indigo-500" />
        case NotificationType.SCHEDULE_CREATE:
            return <Calendar className="h-5 w-5 text-orange-500" />
        case NotificationType.SCHEDULE_REMINDER:
            return <Clock className="h-5 w-5 text-red-500" />
        case NotificationType.NEW_MESSAGE:
            return <MessageSquare className="h-5 w-5 text-teal-500" />
        default:
            return <Bell className="h-5 w-5 text-gray-500" />
    }
}

export function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60)
        return `${diffInMinutes}분 전`
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}시간 전`
    } else {
        return date.toLocaleDateString('ko-KR')
    }
}

export function formatNotificationDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60)
        return `${diffInMinutes}분 전`
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}시간 전`
    } else if (diffInHours < 168) { // 7일
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays}일 전`
    } else {
        return date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric'
        })
    }
} 