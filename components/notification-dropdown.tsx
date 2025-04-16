"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, MessageSquare, UserPlus, BookOpen, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 임시 알림 데이터
const notifications = [
  {
    id: 1,
    type: "friend_request",
    title: "친구 요청",
    message: "정자바님이 친구 요청을 보냈습니다.",
    timestamp: "2023-05-10T09:15:00Z",
    isRead: false,
    data: {
      userId: 101,
      name: "정자바",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: 2,
    type: "study_invite",
    title: "스터디 초대",
    message: "React와 Next.js 마스터하기 스터디에 초대되었습니다.",
    timestamp: "2023-05-09T14:30:00Z",
    isRead: false,
    data: {
      studyId: 1,
      studyName: "React와 Next.js 마스터하기",
    },
  },
  {
    id: 3,
    type: "message",
    title: "새 메시지",
    message: "이코딩님이 새 메시지를 보냈습니다.",
    timestamp: "2023-05-09T11:20:00Z",
    isRead: true,
    data: {
      userId: 2,
      name: "이코딩",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  },
  {
    id: 4,
    type: "study_schedule",
    title: "일정 알림",
    message: "Spring Security 실습 일정이 내일 오후 2시에 있습니다.",
    timestamp: "2023-05-08T16:45:00Z",
    isRead: true,
    data: {
      eventId: 3,
      eventTitle: "Spring Security 실습",
    },
  },
  {
    id: 5,
    type: "comment",
    title: "댓글 알림",
    message: "박서버님이 회원님의 질문에 답변을 남겼습니다.",
    timestamp: "2023-05-08T10:30:00Z",
    isRead: true,
    data: {
      questionId: 2,
      questionTitle: "Spring Security와 JWT 인증 구현 방법",
    },
  },
]

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")

  if (!isOpen) return null

  // 알림 필터링
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.isRead
    if (activeTab === "friend") return notification.type === "friend_request"
    if (activeTab === "study") return notification.type === "study_invite" || notification.type === "study_schedule"
    if (activeTab === "message") return notification.type === "message"
    return true
  })

  const handleMarkAllAsRead = () => {
    // 모든 알림을 읽음 처리 (실제로는 API 호출)
    toast({
      title: "알림 읽음 처리",
      description: "모든 알림이 읽음 처리되었습니다.",
    })
  }

  const handleNotificationAction = (notification: (typeof notifications)[0]) => {
    // 알림 유형에 따른 액션 처리
    toast({
      title: "알림 확인",
      description: `${notification.title}을(를) 확인했습니다.`,
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "friend_request":
        return <UserPlus className="h-5 w-5 text-blue-500" />
      case "study_invite":
        return <BookOpen className="h-5 w-5 text-green-500" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      case "study_schedule":
        return <Calendar className="h-5 w-5 text-orange-500" />
      case "comment":
        return <MessageSquare className="h-5 w-5 text-teal-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card className="fixed top-16 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] shadow-xl">
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
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${!notification.isRead ? "bg-accent/30" : ""}`}
                    onClick={() => handleNotificationAction(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>

                        {notification.type === "friend_request" && (
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={notification.data.avatar || "/placeholder.svg"}
                                alt={notification.data.name}
                              />
                              <AvatarFallback>{notification.data.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{notification.data.name}</span>
                          </div>
                        )}

                        {!notification.isRead && (
                          <div className="flex justify-end mt-2">
                            <Badge variant="secondary" className="text-xs">
                              새 알림
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
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
