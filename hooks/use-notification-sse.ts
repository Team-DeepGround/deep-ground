"use client"

import {useEffect, useRef, useState, useCallback} from 'react'
import {auth} from '@/lib/auth'
import {useToast} from '@/hooks/use-toast'
import {api} from '@/lib/api-client'
// @ts-expect-error: no types for event-source-polyfill
import {EventSourcePolyfill} from 'event-source-polyfill'
import {useAuth} from "@/components/auth-provider"

// 전역 SSE 연결 관리
let globalEventSource: any = null
let globalConnectionCount = 0
let globalListeners: Array<{
    onConnected: (isConnected: boolean) => void
    onNotification: (notification: any) => void
    onError: (error: any) => void
}> = []

// 빈 객체 체크 함수
const isTrulyEmptyError = (err: any) => {
    if (!err) return true;
    if (typeof err === 'object') {
        // ErrorEvent 체크: error 속성이 undefined인 경우
        if (err.type === 'error' && err.error === undefined) return true;
    }
    return false;
};

// 전역 SSE 연결 함수
const createGlobalSSEConnection = async () => {
    if (globalEventSource) {
        console.log('이미 전역 SSE 연결이 존재합니다.')
        return globalEventSource
    }

    let hasReceivedMessage = false;

    try {
        const token = await auth.getToken()
        if (!token) {
            console.log('토큰이 없어 SSE 연결을 건너뜁니다.')
            return null
        }

        console.log('토큰 존재 여부:', !!token)
        console.log('토큰 길이:', token.length)
        console.log('토큰 시작 부분:', token.substring(0, 20) + '...')
        console.log('토큰 전체:', token) // 토큰 전체를 로그로 확인

        // 토큰 형식 검증
        if (!token.startsWith('eyJ')) {
            console.error('토큰이 JWT 형식이 아닙니다:', token)
            return null
        }

        console.log('전역 SSE 연결 생성 중...')

        // URL 파라미터와 헤더 모두 사용 (안전한 방식)
        const sseUrl = `http://localhost:8080/api/v1/sse/subscribe`
        console.log('SSE URL:', sseUrl)
        console.log('SSE 연결 시도 중...')
        console.log('Authorization 헤더:', `Bearer ${token}`)

        const eventSource = new EventSourcePolyfill(sseUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
            heartbeatTimeout: 60000,
            connectionTimeout: 10000,
            reconnectInterval: 5000,
        })

        console.log('EventSourcePolyfill 인스턴스 생성 완료')

        globalEventSource = eventSource

        // 연결 시도 중
        eventSource.onopen = (event: any) => {
            console.log('전역 SSE onopen 이벤트 발생:', event)
            console.log('SSE 연결 성공 - 상태:', eventSource.readyState)
            console.log('SSE 연결 성공 - URL:', eventSource.url)
        }

        // 연결 성공
        eventSource.addEventListener('connected', (event: any) => {
            console.log('전역 SSE connected 이벤트 수신:', event.data)
            globalListeners.forEach(listener => listener.onConnected(true))
        })

        // 새 알림 수신
        eventSource.addEventListener('notification', (event: any) => {
            try {
                hasReceivedMessage = true;
                const notification = JSON.parse(event.data)
                console.log('전역 SSE 새 알림 수신:', notification)
                globalListeners.forEach(listener => listener.onNotification(notification))
            } catch (error) {
                console.error('알림 데이터 파싱 오류:', error)
            }
        })

        // unreadCount 이벤트 수신 (채팅방 외부에서 새 메시지 알림)
        eventSource.addEventListener('unreadCount', (event: any) => {
            try {
                hasReceivedMessage = true;
                const {chatRoomId, unreadCount, lastestMessageTime} = JSON.parse(event.data)
                // 현재 열려있는 채팅방 id와 다를 때만 알림
                const currentChatRoomId = (window as any).currentChatRoomId
                if (!currentChatRoomId || currentChatRoomId !== chatRoomId) {
                    // 토스트 알림 표시
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('chat-unread-toast', {
                            detail: {chatRoomId, unreadCount, lastestMessageTime}
                        }))
                    }
                }
            } catch (error) {
                console.error('unreadCount 이벤트 파싱 오류:', error)
            }
        })

        // presence 이벤트 수신 (온라인/오프라인 상태 변경)
        eventSource.addEventListener('presence', (event: any) => {
            try {
                hasReceivedMessage = true;
                const presenceData = JSON.parse(event.data)
                console.log('전역 SSE presence 이벤트 수신:', presenceData)
                // 전역 이벤트로 presence 상태 변경 알림
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('presence-update', {
                        detail: presenceData
                    }))
                }
            } catch (error) {
                console.error('presence 이벤트 파싱 오류:', error)
            }
        })

        // 연결 오류 처리
        eventSource.onerror = async (error: any) => {
            console.log('SSE onerror 이벤트 발생:', error)
            console.log('SSE error 타입:', typeof error)
            console.log('SSE error 객체:', error)

            if (!hasReceivedMessage) {
                // type/readyState만 문자열로 출력 (객체 출력 X)
                if (typeof window !== 'undefined' && (error instanceof window.Event || error instanceof window.ProgressEvent)) {
                    const type = error.type;
                    const readyState = (error.target && (error.target as any).readyState) || 'unknown';
                    console.error(`전역 SSE 연결 오류 발생: type=${type}, readyState=${readyState}`);
                } else {
                    if (isTrulyEmptyError(error)) {
                        console.error('전역 SSE 연결 오류 발생: [no error object]')
                    } else {
                        console.error('전역 SSE 연결 오류 발생:', error)
                    }
                }
            }
            globalListeners.forEach(listener => listener.onError(error))

            // 연결 해제
            globalEventSource = null
            globalListeners.forEach(listener => listener.onConnected(false))
        }

        // 연결 종료 처리
        eventSource.onclose = (event: any) => {
            console.log('전역 SSE 연결 종료:', event)
            globalEventSource = null
            globalListeners.forEach(listener => listener.onConnected(false))
        }

        console.log('전역 SSE 연결 설정 완료')
        return eventSource

    } catch (error) {
        console.error('전역 SSE 연결 실패:', error)
        return null
    }
}

// 전역 SSE 연결 해제 함수
const closeGlobalSSEConnection = () => {
    if (globalEventSource) {
        console.log('전역 SSE 연결 해제 시작...')
        console.log('현재 전역 리스너 개수:', globalListeners.length)

        try {
            if (globalEventSource.close) {
                console.log('EventSourcePolyfill 연결 해제 중...')
                globalEventSource.close()
                console.log('EventSourcePolyfill 연결 해제 완료')
            }
        } catch (error) {
            console.error('SSE 연결 해제 중 오류 (무시됨):', error)
            // 연결 해제 오류는 무시하고 계속 진행
        }

        globalEventSource = null
        globalListeners.forEach(listener => listener.onConnected(false))
        console.log('전역 SSE 연결 해제 완료')
    } else {
        console.log('해제할 전역 SSE 연결이 없습니다.')
    }
}

// 알림 타입 enum
export enum NotificationType {
    FRIEND_REQUEST = 'FRIEND_REQUEST',
    FRIEND_ACCEPT = 'FRIEND_ACCEPT',
    STUDY_GROUP_INVITE = 'STUDY_GROUP_INVITE',
    STUDY_GROUP_JOIN = 'STUDY_GROUP_JOIN',
    SCHEDULE_CREATE = 'SCHEDULE_CREATE',
    SCHEDULE_REMINDER = 'SCHEDULE_REMINDER',
    NEW_MESSAGE = 'NEW_MESSAGE',
}

// 기본 알림 데이터 인터페이스
export interface BaseNotificationData {
    type: NotificationType
}

// 친구 관련 알림 데이터
export interface FriendNotificationData extends BaseNotificationData {
    type: NotificationType.FRIEND_REQUEST | NotificationType.FRIEND_ACCEPT
    memberId: number
    nickname: string
}

// 스터디 그룹 관련 알림 데이터
export interface StudyGroupNotificationData extends BaseNotificationData {
    type: NotificationType.STUDY_GROUP_INVITE | NotificationType.STUDY_GROUP_JOIN
    studyGroupId: number
    title: string
}

// 일정 관련 알림 데이터
export interface ScheduleNotificationData extends BaseNotificationData {
    type: NotificationType.SCHEDULE_CREATE | NotificationType.SCHEDULE_REMINDER
    studyScheduleId: number
    title: string
    startTime: string
}

// 채팅 메시지 알림 데이터
export interface ChatMessageNotificationData extends BaseNotificationData {
    type: NotificationType.NEW_MESSAGE
    chatRoomId: number
    senderId: number
    sender: string
}

// 유니온 타입으로 모든 알림 데이터 타입 정의
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

export const useNotificationSSE = () => {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [hasNext, setHasNext] = useState(false)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const listenerId = useRef<string>(Math.random().toString(36).substr(2, 9))
    const {toast} = useToast()
    const {isAuthenticated} = useAuth()

    // 최초 조회 여부
    const isFetchedRef = useRef(false)

    // 알림 목록 조회 (최초 1회 또는 더 보기에서만 호출)
    const fetchNotifications = useCallback(async (cursor?: string, limit: number = 10) => {
        // 이미 받아온 적 있으면(최초가 아니면) 아무것도 하지 않음 (cursor 있을 때는 더 보기이므로 항상 호출)
        if (isFetchedRef.current && !cursor) return
        try {
            const params: Record<string, string> = {}
            if (cursor) params.cursor = cursor
            params.limit = limit.toString()
            const data: NotificationListResponse = await api.get('/notifications', {params})
            if (cursor) {
                // 더 보기: 기존 목록 뒤에 붙임
                setNotifications(prev => [...prev, ...data.result.notifications])
            } else {
                // 최초 조회: 목록 전체 교체
                setNotifications(data.result.notifications)
                isFetchedRef.current = true
            }
            setNextCursor(data.result.nextCursor)
            setHasNext(data.result.hasNext)
        } catch (error) {
            console.error('알림 목록 조회 오류:', error)
        }
    }, [])

    // 더 많은 알림 로드 (더 보기)
    const loadMoreNotifications = useCallback(async () => {
        if (!hasNext || !nextCursor || isLoading) return
        setIsLoading(true)
        try {
            await fetchNotifications(nextCursor, 10)
        } catch (error) {
            console.error('더 많은 알림 로드 오류:', error)
        } finally {
            setIsLoading(false)
        }
    }, [hasNext, nextCursor, isLoading, fetchNotifications])

    // 읽지 않은 알림 개수 조회 (기존대로)
    const fetchUnreadCount = useCallback(async () => {
        const token = await auth.getToken();
        if (!token) return;
        try {
            const data: UnreadCountResponse = await api.get('/notifications/unread-count')
            setUnreadCount(data.result?.unreadCount || 0)
        } catch (error) {
            console.error('읽지 않은 알림 개수 조회 오류:', error)
        }
    }, [])

    // SSE 연결 시작
    const connectSSE = useCallback(async () => {
        globalConnectionCount++
        console.log(`SSE 연결 요청 (${listenerId.current}) - 총 ${globalConnectionCount}개 연결 요청`)

        // 전역 리스너에 등록
        const listener = {
            onConnected: (connected: boolean) => {
                console.log(`리스너 ${listenerId.current} 연결 상태 변경:`, connected)
                setIsConnected(connected)
            },
            onNotification: (notification: Notification) => {
                console.log(`리스너 ${listenerId.current} 알림 수신:`, notification.id)
                console.log(`리스너 ${listenerId.current} 알림 데이터:`, notification.data)
                console.log(`리스너 ${listenerId.current} 현재 unreadCount:`, unreadCount)

                // 알림 데이터 안전성 검사
                if (!notification || !notification.data) {
                    console.error(`리스너 ${listenerId.current} 잘못된 알림 데이터:`, notification)
                    return
                }

                setNotifications(prev => [notification, ...prev]) // 새 알림만 prepend
                setUnreadCount(prev => {
                    const newCount = prev + 1
                    console.log(`리스너 ${listenerId.current} unreadCount 업데이트: ${prev} -> ${newCount}`)
                    return newCount
                })

                // 알림 타입에 따른 토스트 메시지
                const getNotificationMessage = (notification: Notification) => {
                    if (!notification.data || !notification.data.type) {
                        console.error('알림 데이터 또는 타입이 없습니다:', notification)
                        return "새로운 알림이 도착했습니다."
                    }

                    switch (notification.data.type) {
                        case 'FRIEND_REQUEST':
                            return `${notification.data.nickname || '알 수 없는 사용자'}님이 친구 요청을 보냈습니다.`
                        case 'FRIEND_ACCEPT':
                            return `${notification.data.nickname || '알 수 없는 사용자'}님이 친구 요청을 수락했습니다.`
                        case 'STUDY_GROUP_INVITE':
                            return `${notification.data.title || '알 수 없는 스터디'} 스터디 그룹에 초대되었습니다.`
                        case 'STUDY_GROUP_JOIN':
                            return `새로운 멤버가 ${notification.data.title || '알 수 없는 스터디'} 스터디 그룹에 가입했습니다.`
                        case 'SCHEDULE_CREATE':
                            return `새로운 스터디 일정이 생성되었습니다: ${notification.data.title || '알 수 없는 일정'}`
                        case 'SCHEDULE_REMINDER':
                            return `스터디 일정 알림: ${notification.data.title || '알 수 없는 일정'}`
                        case 'NEW_MESSAGE':
                            return `${notification.data.sender || '알 수 없는 사용자'}님이 새 메시지를 보냈습니다.`
                        default:
                            console.warn('알 수 없는 알림 타입:', notification.data.type)
                            return "새로운 알림이 도착했습니다."
                    }
                }

                toast({
                    title: "🔔 새로운 알림",
                    description: getNotificationMessage(notification),
                    duration: 5000,
                })
            },
            onError: (error: any) => {
                if (isTrulyEmptyError(error)) {
                    console.error(`리스너 ${listenerId.current} 오류: [no error object]`)
                } else {
                    console.error(`리스너 ${listenerId.current} 오류:`, error)
                }
                setIsConnected(false)
            }
        }

        globalListeners.push(listener)

        // 전역 SSE 연결 생성 또는 기존 연결 사용
        await createGlobalSSEConnection()

        return () => {
            // 리스너 제거
            const index = globalListeners.findIndex(l => l === listener)
            if (index > -1) {
                globalListeners.splice(index, 1)
            }
            globalConnectionCount--
            console.log(`SSE 연결 해제 (${listenerId.current}) - 남은 연결 ${globalConnectionCount}개`)
            // 모든 연결이 해제되면 전역 연결도 닫기
            if (globalConnectionCount === 0) {
                closeGlobalSSEConnection()
            }
        }
    }, [])

    // SSE 연결 해제 (기존대로)
    const disconnectSSE = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }
        setIsConnected(false)
    }, [])

    // 알림 읽음 처리 (읽음 처리 시에도 최초 조회 플래그 해제)
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`)
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? {...notification, read: true}
                        : notification
                )
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
            isFetchedRef.current = false // 읽음 처리 후 다음에 패널 열면 다시 조회
        } catch (error) {
            console.error('알림 읽음 처리 오류:', error)
        }
    }, [])

    // 전체 알림 읽음 처리 (읽음 처리 시에도 최초 조회 플래그 해제)
    const markAllAsRead = useCallback(async () => {
        try {
            await api.patch('/notifications/read-all')
            setNotifications(prev => prev.map(notification => ({...notification, read: true})))
            setUnreadCount(0)
            isFetchedRef.current = false // 읽음 처리 후 다음에 패널 열면 다시 조회
        } catch (error) {
            console.error('전체 알림 읽음 처리 오류:', error)
        }
    }, [])

    // 컴포넌트 마운트 시 초기 데이터 로드 및 SSE 연결
    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            connectSSE();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    return {
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        hasNext,
        markAsRead,
        markAllAsRead,
        loadMoreNotifications,
        reconnect: connectSSE,
        fetchNotifications,
    }
} 