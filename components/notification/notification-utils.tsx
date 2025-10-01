import React from 'react'
import { Notification, NotificationType } from '@/types/notification'
import { UserPlus, UserCheck, BookOpen, Users, Calendar, Clock, MessageSquare, Bell } from 'lucide-react'

export function getNotificationTitle(type: NotificationType) {
    switch (type) {
        case NotificationType.FRIEND_REQUEST:
            return '친구 요청'
        case NotificationType.FRIEND_ACCEPT:
            return '친구 요청 수락'
        case NotificationType.STUDY_GROUP_JOIN:
            return '스터디 그룹 가입'
        case NotificationType.STUDY_GROUP_KICK:
            return '스터디 그룹 강퇴'
        case NotificationType.STUDY_GROUP_ACCEPT:
            return '스터디 그룹 가입 승인'
        case NotificationType.SCHEDULE_CREATE:
            return '스터디 일정 생성'
        case NotificationType.SCHEDULE_REMINDER:
            return '스터디 일정 알림'
        case NotificationType.FEED_COMMENT:
            return '피드 댓글'
        case NotificationType.QNA_ANSWER:
            return 'Q&A 답변'
        case NotificationType.QNA_COMMENT:
            return 'Q&A 댓글'
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
        case NotificationType.STUDY_GROUP_JOIN:
            return `${notification.data.title} 스터디 그룹에 새로운 가입 신청이 있습니다.`
        case NotificationType.STUDY_GROUP_KICK:
            return `${notification.data.title} 스터디 그룹에서 강퇴되었습니다.`
        case NotificationType.STUDY_GROUP_ACCEPT:
            return `${notification.data.title} 스터디 그룹 가입이 승인되었습니다.`
        case NotificationType.SCHEDULE_CREATE:
            return `새로운 스터디 일정이 생성되었습니다: ${notification.data.title}`
        case NotificationType.SCHEDULE_REMINDER:
            return `스터디 일정 알림: ${notification.data.title}`
        case NotificationType.FEED_COMMENT:
            return `피드에 새로운 댓글이 달렸습니다.`
        case NotificationType.QNA_ANSWER:
            return `Q&A에 답변이 달렸습니다.`
        case NotificationType.QNA_COMMENT:
            return `Q&A에 댓글이 달렸습니다.`
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
        case NotificationType.STUDY_GROUP_JOIN:
            return <Users className="h-5 w-5 text-indigo-500" />
        case NotificationType.STUDY_GROUP_KICK:
            return <Users className="h-5 w-5 text-red-500" />
        case NotificationType.STUDY_GROUP_ACCEPT:
            return <UserCheck className="h-5 w-5 text-green-500" />
        case NotificationType.SCHEDULE_CREATE:
            return <Calendar className="h-5 w-5 text-orange-500" />
        case NotificationType.SCHEDULE_REMINDER:
            return <Clock className="h-5 w-5 text-red-500" />
        case NotificationType.FEED_COMMENT:
            return <MessageSquare className="h-5 w-5 text-violet-500" />
        case NotificationType.QNA_ANSWER:
        case NotificationType.QNA_COMMENT:
            return <BookOpen className="h-5 w-5 text-blue-500" />
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