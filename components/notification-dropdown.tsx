"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  UserPlus, 
  UserCheck,
  BookOpen, 
  X, 
  Loader2,
  Clock,
  Users
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useNotificationContext } from "@/components/notification-provider"
import { Notification, NotificationType } from "@/hooks/use-notification-sse"
import { useRouter } from "next/navigation"

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { toast } = useToast()
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    isLoading, 
    hasNext, 
    loadMoreNotifications,
    fetchNotifications
  } = useNotificationContext()
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, fetchNotifications])

  // 외부 클릭 감지
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

  if (!isOpen) return null

  // 알림 필터링
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    if (activeTab === "friend") return notification.data.type === NotificationType.FRIEND_REQUEST || notification.data.type === NotificationType.FRIEND_ACCEPT
    if (activeTab === "study") return [
      NotificationType.STUDY_GROUP_INVITE, 
      NotificationType.STUDY_GROUP_JOIN,
      NotificationType.SCHEDULE_CREATE,
      NotificationType.SCHEDULE_REMINDER
    ].includes(notification.data.type)
    if (activeTab === "message") return notification.data.type === NotificationType.NEW_MESSAGE
    return true
  })

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast({
        title: "알림 읽음 처리",
        description: "모든 알림을 읽음 처리했습니다.",
      })
    } catch (error) {
      toast({
        title: "오류",
        description: "알림 읽음 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 알림 타입별 이동할 URL 반환 함수
  const getNotificationUrl = (notification: Notification) => {
    switch (notification.data.type) {
      case NotificationType.FRIEND_REQUEST:
      case NotificationType.FRIEND_ACCEPT:
        return "/friends"
      case NotificationType.SCHEDULE_CREATE:
      case NotificationType.SCHEDULE_REMINDER:
        return "/calendar"
      default:
        return null // 나머지는 이동 없음
    }
  }

  const handleNotificationAction = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.id)
      }
      const url = getNotificationUrl(notification)
      if (url) {
        onClose()
        setTimeout(() => {
          router.push(url)
        }, 0)
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "알림 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const getNotificationTitle = (type: NotificationType) => {
    switch (type) {
      case NotificationType.FRIEND_REQUEST:
        return "친구 요청"
      case NotificationType.FRIEND_ACCEPT:
        return "친구 요청 수락"
      case NotificationType.STUDY_GROUP_INVITE:
        return "스터디 그룹 초대"
      case NotificationType.STUDY_GROUP_JOIN:
        return "스터디 그룹 가입"
      case NotificationType.SCHEDULE_CREATE:
        return "스터디 일정 생성"
      case NotificationType.SCHEDULE_REMINDER:
        return "스터디 일정 알림"
      case NotificationType.NEW_MESSAGE:
        return "새 메시지"
      default:
        return "알림"
    }
  }

  const getNotificationMessage = (notification: Notification) => {
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
        return "새로운 알림이 있습니다."
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
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

  const formatDate = (dateString: string) => {
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

  const renderNotificationContent = (notification: Notification) => {
    switch (notification.data.type) {
      case NotificationType.FRIEND_REQUEST:
      case NotificationType.FRIEND_ACCEPT:
        return null
      case NotificationType.STUDY_GROUP_INVITE:
      case NotificationType.STUDY_GROUP_JOIN:
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
      case NotificationType.NEW_MESSAGE:
        return (
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src="/placeholder.svg"
                alt={notification.data.sender}
              />
              <AvatarFallback>{notification.data.sender[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{notification.data.sender}</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card ref={dropdownRef} className="fixed top-16 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] shadow-xl">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">알림</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
            모두 읽음
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="unread">안읽음</TabsTrigger>
              <TabsTrigger value="friend">친구</TabsTrigger>
              <TabsTrigger value="study">스터디</TabsTrigger>
              <TabsTrigger value="message">메시지</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-2">
              {filteredNotifications.length > 0 ? (
                <>
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${!notification.read ? "bg-accent/30" : ""}`}
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
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">알림 없음</h3>
                  <p className="text-muted-foreground">현재 알림이 없습니다.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}
