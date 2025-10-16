"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  Calendar,
  BookOpen, 
  X,
  Loader2,
  Clock,
  MessageSquare,
  Wifi,
  WifiOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Notification, NotificationType } from "@/types/notification"
import { useRouter } from "next/navigation"
import { getNotificationTitle, getNotificationMessage, getNotificationIcon, formatDate } from './notification-utils'
import { useAuth } from '@/components/auth-provider'
import { useNotificationContext } from './notification-provider'

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

const TAB_VALUES = {
  ALL: 'all',
  UNREAD: 'unread',
  FRIEND: 'friend',
  STUDY: 'study',
  COMMUNITY: 'community',
} as const

type TabValue = typeof TAB_VALUES[keyof typeof TAB_VALUES]

export const NotificationDropdown = ({ isOpen, onClose }: NotificationDropdownProps) => {
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const {notifications, unreadCount, isConnected, markAsRead, markAllAsRead, loadMoreNotifications, isLoading, hasNext, fetchNotifications, deleteNotification, reconnect} = useNotificationContext()
  const {isAuthenticated} = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // 중복 알림 제거 (ID 기반)
  const uniqueNotifications = notifications.filter((notification, index, self) =>
    index === self.findIndex(n => n.id === notification.id)
  )

  // 알림 필터링 함수
  const filterNotifications = (notifications: Notification[], activeTab: TabValue) => {
    return notifications.filter((notification) => {
      if (activeTab === TAB_VALUES.ALL) return true
      if (activeTab === TAB_VALUES.UNREAD) return !notification.read
      if (activeTab === TAB_VALUES.FRIEND) return notification.data.type === NotificationType.FRIEND_REQUEST || notification.data.type === NotificationType.FRIEND_ACCEPT
      if (activeTab === TAB_VALUES.STUDY) return [
        NotificationType.STUDY_GROUP_JOIN,
        NotificationType.STUDY_GROUP_KICK,
        NotificationType.STUDY_GROUP_ACCEPT,
        NotificationType.SCHEDULE_CREATE,
        NotificationType.SCHEDULE_REMINDER
      ].includes(notification.data.type)
      if (activeTab === TAB_VALUES.COMMUNITY) return [
        NotificationType.FEED_COMMENT,
        NotificationType.QNA_ANSWER,
        NotificationType.QNA_COMMENT
      ].includes(notification.data.type)
      return true
    })
  }

  const filteredNotifications = filterNotifications(uniqueNotifications, activeTab)

  const handleNotificationAction = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // 알림 타입에 따른 라우팅
    switch (notification.data.type) {
      case NotificationType.FRIEND_REQUEST:
      case NotificationType.FRIEND_ACCEPT:
        router.push('/friends')
        break
      case NotificationType.STUDY_GROUP_JOIN:
        router.push(`/studies/manage/${notification.data.studyGroupId}`)
        break
      case NotificationType.STUDY_GROUP_ACCEPT:
        router.push(`/studies/${notification.data.studyGroupId}`)
        break
      case NotificationType.STUDY_GROUP_KICK:
        // 강퇴 알림은 클릭해도 반응 없음
        break
      case NotificationType.SCHEDULE_CREATE:
      case NotificationType.SCHEDULE_REMINDER:
        router.push('/calendar')
        break
      case NotificationType.FEED_COMMENT:
        router.push(`/feed`)
        break
      case NotificationType.QNA_ANSWER:
      case NotificationType.QNA_COMMENT:
        router.push(`/questions/${notification.data.questionId}`)
        break
      default:
        break
    }

    onClose()
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    toast({
      title: "알림 읽음 처리",
      description: "모든 알림을 읽음 처리했습니다.",
    })
  }

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation() // 알림 클릭 이벤트 방지
    console.log('알림 삭제 버튼 클릭 - ID:', notificationId)
    try {
      await deleteNotification(notificationId)
      toast({ title: "알림 삭제", description: "알림이 삭제되었습니다." })
    } catch (error) {
      console.error('알림 삭제 실패:', error)
      toast({ title: "오류", description: "알림 삭제에 실패했습니다.", variant: "destructive" })
    }
  }

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // 드롭다운이 열릴 때 알림 목록 조회 (한 번만)
  useEffect(() => {
    if (isOpen && isAuthenticated && notifications.length === 0) {
      fetchNotifications()
    }
  }, [isOpen, isAuthenticated, fetchNotifications, notifications.length])

  // 네트워크 상태 변화 감지
  useEffect(() => {
    const handleOnline = () => {
      // 온라인 상태 복구 시 알림 목록 새로고침
      if (isAuthenticated) {
        // SSE 연결이 자동으로 재연결되므로 추가 작업 불필요
      }
    }

    const handleOffline = () => {
      // 오프라인 상태 시 UI 업데이트
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isAuthenticated])

  if (!isAuthenticated || !isOpen) {
    return null
  }

  const renderNotificationContent = (notification: Notification) => {
    switch (notification.data.type) {
      case NotificationType.FRIEND_REQUEST:
      case NotificationType.FRIEND_ACCEPT:
        return null
      case NotificationType.STUDY_GROUP_JOIN:
      case NotificationType.STUDY_GROUP_KICK:
      case NotificationType.STUDY_GROUP_ACCEPT:
        return (
          <div className="flex items-center gap-2 mt-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{notification.data.title}</span>
          </div>
        )
      case NotificationType.SCHEDULE_CREATE:
      case NotificationType.SCHEDULE_REMINDER:
        return (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{notification.data.title}</span>
            </div>
            {notification.data.startTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.data.startTime).toLocaleString('ko-KR')}
                </span>
              </div>
            )}
          </div>
        )
      case NotificationType.FEED_COMMENT:
        return (
          <div className="flex items-center gap-2 mt-2">
            <MessageSquare className="h-4 w-4 text-violet-500" />
            <span className="text-sm font-medium">{notification.data.content}</span>
          </div>
        )
      case NotificationType.QNA_ANSWER:
      case NotificationType.QNA_COMMENT:
        return (
          <div className="flex items-center gap-2 mt-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{notification.data.content}</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card ref={dropdownRef} className="fixed top-16 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] shadow-xl">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">알림</CardTitle>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '실시간 연결됨' : '연결 끊김 - 재연결 중...'}
            </span>
            {isConnected && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="연결 상태 양호" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isConnected && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                try {
                  await reconnect()
                  toast({
                    title: "재연결 시도",
                    description: "알림 연결을 다시 시도합니다.",
                  })
                } catch (error) {
                  toast({
                    title: "재연결 실패",
                    description: "연결에 실패했습니다. 페이지를 새로고침해주세요.",
                    variant: "destructive"
                  })
                }
              }}
              className="text-xs"
            >
              재연결
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            모두 읽음
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="unread">안읽음</TabsTrigger>
              <TabsTrigger value="friend">친구</TabsTrigger>
              <TabsTrigger value="study">스터디</TabsTrigger>
              <TabsTrigger value="community">커뮤니티</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-2">
              {filteredNotifications.length > 0 ? (
                <>
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors relative group ${!notification.read ? "bg-accent/30" : ""}`}
                      onClick={() => handleNotificationAction(notification)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">{getNotificationIcon(notification.data.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{getNotificationTitle(notification.data.type)}</h4>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getNotificationMessage(notification)}
                          </p>

                          {renderNotificationContent(notification)}

                          {!notification.read && (
                            <div className="flex justify-end mt-2">
                              <Badge variant="secondary" className="text-xs">
                                새 알림
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 삭제 버튼 */}
                      <button
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded-full"
                        title="알림 삭제"
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                  
                  {hasNext && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadMoreNotifications}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            로딩 중...
                          </>
                        ) : (
                          "더 보기"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  {!isConnected ? (
                    <>
                      <WifiOff className="mx-auto h-12 w-12 text-red-500" />
                      <h3 className="mt-4 text-lg font-semibold">연결 끊김</h3>
                      <p className="text-muted-foreground">알림 서버와의 연결이 끊어졌습니다.</p>
                      <p className="text-sm text-muted-foreground mt-2">재연결 버튼을 클릭하거나 페이지를 새로고침해주세요.</p>
                    </>
                  ) : (
                    <>
                      <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">알림 없음</h3>
                      <p className="text-muted-foreground">현재 알림이 없습니다.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
