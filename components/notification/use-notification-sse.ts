"use client"

import {useEffect, useRef, useState, useCallback} from 'react'
import {auth} from '@/lib/auth'
import {useToast} from '@/hooks/use-toast'
// @ts-expect-error: no types for event-source-polyfill
import {EventSourcePolyfill} from 'event-source-polyfill'
import {useAuth} from "@/components/auth-provider"
import { Notification } from '@/types/notification'
import { fetchNotificationsApi, fetchUnreadCountApi, markAsReadApi, markAllAsReadApi, deleteNotificationApi } from '@/lib/api/notification'
import { getNotificationMessage } from './notification-utils'
import { API_BASE_URL } from "@/lib/api-client"

const API_BASE = `${API_BASE_URL}/sse/subscribe`

// SSE 설정 상수 (운영 환경 최적화)
const SSE_CONFIG = {
    URL: API_BASE,
    HEARTBEAT_TIMEOUT: 300000,  // 5분으로 대폭 증가
    CONNECTION_TIMEOUT: 20000,  // 연결 타임아웃 증가
    RECONNECT_INTERVAL: 1000,   // 재연결 간격 단축 (1초)
    MAX_RECONNECT_ATTEMPTS: 50, // 최대 재연결 시도 횟수 대폭 증가
    HEALTH_CHECK_INTERVAL: 15000, // 15초마다 헬스체크
    CONNECTION_RETRY_DELAY: 500, // 초기 재연결 지연
    MAX_RETRY_DELAY: 30000,      // 최대 재연결 지연 (30초)
} as const

// 전역 SSE 연결 관리
let globalEventSource: EventSourcePolyfill | null = null
let globalConnectionCount = 0
let globalListeners: Array<{
    onConnected: (isConnected: boolean) => void
    onNotification: (notification: Notification) => void
    onError: (error: Event) => void
}> = []
let lastHeartbeatTime = Date.now()
let heartbeatIntervalId: NodeJS.Timeout | null = null
let globalCurrentChatRoomId: number | null = null
let reconnectAttempts = 0
let isReconnecting = false
let healthCheckIntervalId: NodeJS.Timeout | null = null
let lastSuccessfulConnection = Date.now()
let connectionQuality = 'good' // 'good', 'poor', 'critical'

// 전역 채팅방 ID 설정 함수
const setGlobalCurrentChatRoomId = (chatRoomId: number | null): void => {
    globalCurrentChatRoomId = chatRoomId
}

// 채팅방 ID 변경 이벤트 리스너
if (typeof window !== 'undefined') {
    window.addEventListener('chat-room-changed', (event: Event) => {
        const customEvent = event as CustomEvent
        const { chatRoomId } = customEvent.detail || {}
        setGlobalCurrentChatRoomId(chatRoomId)
    })
}

// 빈 객체 체크 함수
const isTrulyEmptyError = (err: Event | null): boolean => {
    if (!err) return true
    if (err instanceof Event && err.type === 'error') {
        return true
    }
    return false
}

// 토큰 만료 에러 감지 함수
const isTokenExpiredError = (error: Event): boolean => {
    // EventSourcePolyfill에서 401 에러를 감지하는 방법
    // 일반적으로 error 객체에 status나 statusCode 정보가 포함됨
    if (error instanceof Event) {
        // @ts-ignore: EventSourcePolyfill의 추가 속성에 접근
        const status = (error as any).status || (error as any).statusCode
        return status === 401
    }
    return false
}

// 상태 업데이트 유틸 함수 (중복 체크 포함)
const updateNotificationState = (
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>,
    setUnreadCount: React.Dispatch<React.SetStateAction<number>>,
    notification: Notification
) => {
    setNotifications(prev => {
        // 중복 알림 체크
        const isDuplicate = prev.some(existing => existing.id === notification.id)
        if (isDuplicate) {
            return prev
        }
        return [notification, ...prev]
    })
    setUnreadCount(prev => prev + 1)
}

// 전역 SSE 연결 함수
const createGlobalSSEConnection = async (): Promise<boolean> => {
    if (globalEventSource) {
        return true
    }

    let hasReceivedMessage = false

    try {
        const token = await auth.getToken()
        if (!token) {
            return false
        }

        if (!token.startsWith('eyJ')) {
            return false
        }

        
        const eventSource = new EventSourcePolyfill(SSE_CONFIG.URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
            heartbeatTimeout: SSE_CONFIG.HEARTBEAT_TIMEOUT,
            connectionTimeout: SSE_CONFIG.CONNECTION_TIMEOUT,
            reconnectInterval: SSE_CONFIG.RECONNECT_INTERVAL,
        })
        

        globalEventSource = eventSource

        eventSource.onopen = () => {
            lastHeartbeatTime = Date.now() // 하트비트 시간 초기화
            lastSuccessfulConnection = Date.now() // 성공적인 연결 시간 기록
            reconnectAttempts = 0 // 재연결 시도 횟수 리셋
            isReconnecting = false // 재연결 상태 리셋
            connectionQuality = 'good' // 연결 품질 리셋
            startHeartbeatMonitoring() // 하트비트 모니터링 시작
            
            // 연결 성공 시 모든 리스너에게 알림
            globalListeners.forEach((listener, index) => {
                listener.onConnected(true)
            })
        }

        eventSource.addEventListener('connected', () => {
            lastHeartbeatTime = Date.now() // 하트비트 시간 업데이트
            lastSuccessfulConnection = Date.now() // 성공적인 연결 시간 업데이트
            connectionQuality = 'good' // 연결 품질 개선
            globalListeners.forEach(listener => listener.onConnected(true))
        })

        eventSource.addEventListener('notification', (event: MessageEvent) => {
            try {
                hasReceivedMessage = true
                lastHeartbeatTime = Date.now() // 하트비트 시간 업데이트
                lastSuccessfulConnection = Date.now() // 성공적인 연결 시간 업데이트
                connectionQuality = 'good' // 연결 품질 개선
                const notification = JSON.parse(event.data)
                globalListeners.forEach(listener => {
                    listener.onNotification(notification)
                })
            } catch (error) {
            }
        })

        eventSource.addEventListener('unreadCount', (event: MessageEvent) => {
            try {
                hasReceivedMessage = true
                lastHeartbeatTime = Date.now() // 하트비트 시간 업데이트
                lastSuccessfulConnection = Date.now() // 성공적인 연결 시간 업데이트
                connectionQuality = 'good' // 연결 품질 개선
                const {chatRoomId, unreadCount, lastestMessageTime} = JSON.parse(event.data)
                if (typeof window !== 'undefined') {
                    if (!globalCurrentChatRoomId || globalCurrentChatRoomId !== chatRoomId) {
                        window.dispatchEvent(new CustomEvent('chat-unread-toast', {
                            detail: {chatRoomId, unreadCount, lastestMessageTime}
                        }))
                        window.dispatchEvent(new CustomEvent('chat-unread-count', {
                            detail: {chatRoomId, unreadCount, lastestMessageTime}
                        }))
                    }
                }
            } catch (error) {
            }
        })

        eventSource.addEventListener('presence', (event: MessageEvent) => {
            try {
                hasReceivedMessage = true
                lastHeartbeatTime = Date.now() // 하트비트 시간 업데이트
                lastSuccessfulConnection = Date.now() // 성공적인 연결 시간 업데이트
                connectionQuality = 'good' // 연결 품질 개선
                const presenceData = JSON.parse(event.data)
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('presence-update', {
                        detail: presenceData
                    }))
                }
            } catch (error) {
            }
        })

        eventSource.addEventListener('heartbeat', () => {
            lastHeartbeatTime = Date.now();
            lastSuccessfulConnection = Date.now(); // 성공적인 연결 시간 업데이트
            connectionQuality = 'good'; // 연결 품질 개선
        });

        eventSource.onerror = async (error: Event) => {
            
            if (isTokenExpiredError(error)) {
                // 내장 재연결 중단
                eventSource.close()
                // 수동 재연결 (새 토큰으로)
                await createGlobalSSEConnection()
                return
            }
            
            // 빈 에러는 무시 (일반적인 연결 끊김)
            if (isTrulyEmptyError(error)) {
                return
            }
            
            // 재연결 시도 횟수 증가
            reconnectAttempts++
            
            // 최대 재연결 시도 횟수 초과 시 로그 출력
            if (reconnectAttempts > SSE_CONFIG.MAX_RECONNECT_ATTEMPTS) {
                globalListeners.forEach(listener => listener.onError(error))
                return
            }
            
            // 에러 리스너에게 알림
            globalListeners.forEach(listener => listener.onError(error))
            globalListeners.forEach(listener => listener.onConnected(false))
            
        }

        eventSource.onclose = () => {
            globalListeners.forEach(listener => listener.onConnected(false))
            // 내장 재연결 기능 사용하므로 수동 재연결 제거
        }

        return true

    } catch (error) {
        return false
    }
}

// 전역 SSE 연결 해제 함수
const closeGlobalSSEConnection = (): void => {
    // 하트비트 모니터링 중단
    stopHeartbeatMonitoring()
    
    if (globalEventSource) {
        try {
            globalEventSource.close()
        } catch (error) {
        }

        globalEventSource = null
        globalListeners.forEach(listener => listener.onConnected(false))
    }
}

// 연결 상태 검증 함수 (운영 환경 강화)
const validateConnection = (): boolean => {
    if (!globalEventSource) {
        return false
    }
    
    // EventSource의 readyState 확인
    if (globalEventSource.readyState === EventSource.CLOSED) {
        return false
    }
    
    // 하트비트 타임아웃 체크 (5분 이상 응답 없으면 연결 끊어진 것으로 간주)
    const now = Date.now()
    const timeSinceLastHeartbeat = now - lastHeartbeatTime
    const timeSinceLastConnection = now - lastSuccessfulConnection
    
    // 연결 품질 평가
    if (timeSinceLastHeartbeat > 60000) { // 1분 이상
        connectionQuality = 'poor'
    }
    if (timeSinceLastHeartbeat > 180000) { // 3분 이상
        connectionQuality = 'critical'
    }
    
    // 하트비트 타임아웃 체크
    if (timeSinceLastHeartbeat > SSE_CONFIG.HEARTBEAT_TIMEOUT) {
        return false
    }
    
    // 연결 품질이 critical이면 강제 재연결
    if (connectionQuality === 'critical' && timeSinceLastConnection > 300000) { // 5분 이상
        return false
    }
    
    return true
}

// 하트비트 모니터링 시작 (운영 환경 강화)
const startHeartbeatMonitoring = (): void => {
    if (heartbeatIntervalId) {
        clearInterval(heartbeatIntervalId)
    }
    if (healthCheckIntervalId) {
        clearInterval(healthCheckIntervalId)
    }
    
    // 하트비트 모니터링 (30초마다)
    heartbeatIntervalId = setInterval(() => {
        if (globalConnectionCount > 0 && !validateConnection()) {
            if (globalEventSource) {
                globalEventSource.close();
                // 지수 백오프로 재연결 시도
                scheduleReconnection();
            }
        }
    }, 30000)
    
    // 헬스체크 모니터링 (15초마다)
    healthCheckIntervalId = setInterval(() => {
        if (globalConnectionCount > 0) {
            performHealthCheck();
        }
    }, SSE_CONFIG.HEALTH_CHECK_INTERVAL)
}

// 지수 백오프 재연결 스케줄링 (개선된 버전)
const scheduleReconnection = (): void => {
    if (isReconnecting) return;
    
    isReconnecting = true;
    
    // 재연결 시도 횟수에 따른 지연 시간 계산
    let delay;
    if (reconnectAttempts === 0) {
        delay = 1000; // 첫 번째 재연결은 1초 후
    } else if (reconnectAttempts < 5) {
        delay = 2000; // 2-5번째는 2초 후
    } else if (reconnectAttempts < 10) {
        delay = 5000; // 6-10번째는 5초 후
    } else {
        delay = 10000; // 10번째 이후는 10초 후
    }
    
    
    setTimeout(async () => {
        try {
            await createGlobalSSEConnection();
            isReconnecting = false;
        } catch (error) {
            isReconnecting = false;
            if (reconnectAttempts < SSE_CONFIG.MAX_RECONNECT_ATTEMPTS) {
                scheduleReconnection();
            }
        }
    }, delay);
}

// 헬스체크 수행
const performHealthCheck = (): void => {
    if (!globalEventSource) return;
    
    const now = Date.now();
    const timeSinceLastHeartbeat = now - lastHeartbeatTime;
    
    // 연결 상태가 좋지 않으면 경고
    if (timeSinceLastHeartbeat > 30000) { // 30초 이상
    }
    
    // 연결 품질에 따른 조치
    if (connectionQuality === 'critical') {
        if (globalEventSource) {
            globalEventSource.close();
            scheduleReconnection();
        }
    }
}

// 하트비트 모니터링 중단
const stopHeartbeatMonitoring = (): void => {
    if (heartbeatIntervalId) {
        clearInterval(heartbeatIntervalId)
        heartbeatIntervalId = null
    }
    if (healthCheckIntervalId) {
        clearInterval(healthCheckIntervalId)
        healthCheckIntervalId = null
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

    const isFetchedRef = useRef(false)
    const reconnectDebounceRef = useRef<NodeJS.Timeout | null>(null)

    const fetchNotifications = useCallback(async (cursor?: string, limit: number = 10) => {
        // 이미 로딩 중이면 중복 호출 방지
        if (isFetchedRef.current && !cursor) return
        if (isLoading) return
        
        try {
            setIsLoading(true)
            const data = await fetchNotificationsApi(cursor, limit)
            
            if (cursor) {
                setNotifications(prev => [...prev, ...data.result.notifications])
            } else {
                setNotifications(data.result.notifications)
                isFetchedRef.current = true
            }
            setNextCursor(data.result.nextCursor)
            setHasNext(data.result.hasNext)
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }, [isLoading])

    const loadMoreNotifications = useCallback(async () => {
        if (!hasNext || !nextCursor || isLoading) return
        setIsLoading(true)
        try {
            await fetchNotifications(nextCursor, 10)
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }, [hasNext, nextCursor, isLoading, fetchNotifications])

    const fetchUnreadCount = useCallback(async () => {
        const token = await auth.getToken()
        if (!token) return
        try {
            const data = await fetchUnreadCountApi()
            setUnreadCount(data.result?.unreadCount || 0)
        } catch (error) {
        }
    }, [])

    const connectSSE = useCallback(async () => {
        globalConnectionCount++

        const listener = {
            onConnected: (connected: boolean) => {
                
                setIsConnected(connected)
            },
            onNotification: (notification: Notification) => {
                
                if (!notification || !notification.data) {
                    
                    return
                }
                
                
                updateNotificationState(setNotifications, setUnreadCount, notification)
                
                toast({
                    title: "🔔 새로운 알림",
                    description: getNotificationMessage(notification),
                    duration: 5000,
                })
            },
            onError: (error: Event) => {
                
                // 에러가 발생해도 즉시 연결 상태를 false로 설정하지 않음
                // SSE 연결 자체는 유지되고 있을 수 있음
            }
        }

        globalListeners.push(listener)
        const success = await createGlobalSSEConnection()
        
        // 연결 성공 시 즉시 상태 업데이트
        if (success && globalEventSource && globalEventSource.readyState === EventSource.OPEN) {
            
            setIsConnected(true)
        }

        return () => {
            const index = globalListeners.findIndex(l => l === listener)
            if (index > -1) {
                globalListeners.splice(index, 1)
            }
            globalConnectionCount--
            if (globalConnectionCount === 0) {
                closeGlobalSSEConnection()
            }
        }
    }, [toast, setNotifications, setUnreadCount])

    const disconnectSSE = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }
        setIsConnected(false)
    }, [])

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await markAsReadApi(notificationId)
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? {...notification, read: true}
                        : notification
                )
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
            // isFetchedRef.current = false 제거 - SSE 연결에 영향 주지 않도록
        } catch (error) {
        }
    }, [])

    const markAllAsRead = useCallback(async () => {
        try {
            await markAllAsReadApi()
            setNotifications(prev => prev.map(notification => ({...notification, read: true})))
            setUnreadCount(0)
            // isFetchedRef.current = false 제거 - SSE 연결에 영향 주지 않도록
        } catch (error) {
        }
    }, [])

    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            
            
            
            await deleteNotificationApi(notificationId)
            setNotifications(prev => prev.filter(notification => notification.id !== notificationId))
            // 삭제된 알림이 읽지 않은 알림이었다면 unreadCount 감소
            const deletedNotification = notifications.find(n => n.id === notificationId)
            if (deletedNotification && !deletedNotification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            throw error
        }
    }, [notifications])

    // 디바운스된 재연결 함수
    const debouncedConnectSSE = useCallback(() => {
        if (reconnectDebounceRef.current) {
            clearTimeout(reconnectDebounceRef.current)
        }

        reconnectDebounceRef.current = setTimeout(() => {
            if (isAuthenticated && !isConnected) {
                
                connectSSE()
            }
        }, 1000) // 1초 디바운스 (더 안정적으로)
    }, [isAuthenticated, isConnected, connectSSE])

    // 네트워크 상태 변화 감지 및 자동 재연결 (운영 환경 강화)
    useEffect(() => {
        const handleOnline = () => {
            if (isAuthenticated && !isConnected) {
                
                debouncedConnectSSE()
            }
        }

        const handleOffline = () => {
            
            setIsConnected(false)
            connectionQuality = 'critical'
        }

        // 페이지 가시성 변화 감지 (절전 모드, 탭 전환 등)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                
                if (isAuthenticated && !isConnected) {
                    
                    debouncedConnectSSE()
                } else if (isAuthenticated && isConnected) {
                    // 연결이 유지되고 있다면 하트비트 확인
                    
                    // 연결 품질 체크
                    if (connectionQuality === 'poor' || connectionQuality === 'critical') {
                        
                        debouncedConnectSSE()
                    }
                }
            } else {
                
            }
        }

        // 페이지 포커스/블러 감지
        const handleFocus = () => {
            
            if (isAuthenticated && !isConnected) {
                
                debouncedConnectSSE()
            } else if (isAuthenticated && isConnected) {
                // 연결 품질 체크
                if (connectionQuality === 'poor' || connectionQuality === 'critical') {
                    
                    debouncedConnectSSE()
                }
            }
        }

        const handleBlur = () => {
            
        }

        // 주기적인 연결 상태 체크 (운영 환경용)
        const periodicConnectionCheck = setInterval(() => {
            if (isAuthenticated && isConnected) {
                const now = Date.now()
                const timeSinceLastHeartbeat = now - lastHeartbeatTime
                
                // 3분 이상 응답이 없으면 재연결 시도 (더 관대하게)
                if (timeSinceLastHeartbeat > 180000) {
                    
                    debouncedConnectSSE()
                }
            }
        }, 120000) // 2분마다 체크 (더 여유롭게)

        // 이벤트 리스너 등록
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', handleFocus)
        window.addEventListener('blur', handleBlur)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('focus', handleFocus)
            window.removeEventListener('blur', handleBlur)
            clearInterval(periodicConnectionCheck)

            // 디바운스 타이머 정리
            if (reconnectDebounceRef.current) {
                clearTimeout(reconnectDebounceRef.current)
                reconnectDebounceRef.current = null
            }
        }
    }, [isAuthenticated, isConnected, connectSSE, debouncedConnectSSE])

    // 메인 SSE 연결 관리 (메모리 누수 방지)
    useEffect(() => {
        let cleanup: (() => void) | undefined

        if (isAuthenticated) {
            fetchUnreadCount() // 읽지 않은 알림 개수만 먼저 조회
            connectSSE().then(cleanupFn => {
                cleanup = cleanupFn
            })
        }

        return () => {
            if (cleanup) {
                cleanup()
            }
        }
    }, [isAuthenticated, fetchUnreadCount, connectSSE])

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
        deleteNotification,
    }
}
