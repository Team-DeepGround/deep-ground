"use client"

import type React from "react"

import { Textarea } from "@/components/ui/textarea"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus, UserMinus, MessageSquare, Check, X, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 임시 데이터
const friends = [
  {
    id: 1,
    name: "김개발",
    email: "kim@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastActive: null,
  },
  {
    id: 2,
    name: "이코딩",
    email: "lee@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    lastActive: "2023-05-10T14:30:00Z",
  },
  {
    id: 3,
    name: "박서버",
    email: "park@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastActive: null,
  },
  {
    id: 4,
    name: "최데브옵스",
    email: "choi@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    lastActive: "2023-05-09T18:45:00Z",
  },
]

const friendRequests = [
  {
    id: 101,
    name: "정자바",
    email: "jung@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "안녕하세요! 스프링 스터디에서 만났었습니다.",
    sentAt: "2023-05-10T09:15:00Z",
  },
  {
    id: 102,
    name: "한인공",
    email: "han@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "머신러닝 스터디 함께해요!",
    sentAt: "2023-05-09T16:30:00Z",
  },
]

const sentRequests = [
  {
    id: 201,
    name: "고프론트",
    email: "go@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    message: "React 스터디 같이 하실래요?",
    sentAt: "2023-05-08T11:20:00Z",
  },
]

export default function FriendsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [emailSearch, setEmailSearch] = useState("")
  const [message, setMessage] = useState("")

  // 친구 검색 필터링
  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSendRequest = () => {
    if (!emailSearch) {
      toast({
        title: "이메일 필요",
        description: "친구 요청을 보낼 이메일을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailSearch)) {
      toast({
        title: "이메일 형식 오류",
        description: "올바른 이메일 형식을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 이미 친구인지 확인
    if (friends.some((friend) => friend.email.toLowerCase() === emailSearch.toLowerCase())) {
      toast({
        title: "이미 친구입니다",
        description: "해당 이메일의 사용자와 이미 친구입니다.",
        variant: "destructive",
      })
      return
    }

    // 이미 요청을 보냈는지 확인
    if (sentRequests.some((request) => request.email.toLowerCase() === emailSearch.toLowerCase())) {
      toast({
        title: "이미 요청을 보냈습니다",
        description: "해당 이메일의 사용자에게 이미 친구 요청을 보냈습니다.",
        variant: "destructive",
      })
      return
    }

    // 친구 요청 성공 (실제로는 API 호출)
    toast({
      title: "친구 요청 전송",
      description: "친구 요청이 성공적으로 전송되었습니다.",
    })

    // 입력 초기화
    setEmailSearch("")
    setMessage("")
  }

  const handleAcceptRequest = (id: number) => {
    toast({
      title: "친구 요청 수락",
      description: "친구 요청을 수락했습니다.",
    })
  }

  const handleRejectRequest = (id: number) => {
    toast({
      title: "친구 요청 거절",
      description: "친구 요청을 거절했습니다.",
    })
  }

  const handleRemoveFriend = (id: number) => {
    toast({
      title: "친구 삭제",
      description: "친구 목록에서 삭제되었습니다.",
    })
  }

  const handleCancelRequest = (id: number) => {
    toast({
      title: "친구 요청 취소",
      description: "친구 요청이 취소되었습니다.",
    })
  }

  const handleStartChat = (id: number) => {
    toast({
      title: "채팅 시작",
      description: "채팅 기능은 준비 중입니다.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">친구 관리</h1>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          {/* 친구 추가 */}
          <Card>
            <CardHeader>
              <CardTitle>친구 추가</CardTitle>
              <CardDescription>이메일로 친구를 찾아 추가하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>이메일</Label>
                <Input
                  placeholder="friend@example.com"
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>메시지 (선택사항)</Label>
                <Textarea
                  placeholder="간단한 인사말을 남겨보세요"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSendRequest} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                친구 요청 보내기
              </Button>
            </CardFooter>
          </Card>

          {/* 친구 목록 및 요청 */}
          <Tabs defaultValue="friends">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="friends">친구 목록</TabsTrigger>
              <TabsTrigger value="requests">받은 요청</TabsTrigger>
              <TabsTrigger value="sent">보낸 요청</TabsTrigger>
            </TabsList>

            <TabsContent value="friends">
              <Card>
                <CardHeader>
                  <CardTitle>친구 목록</CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="친구 검색..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredFriends.length > 0 ? (
                    <div className="space-y-4">
                      {filteredFriends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                                <AvatarFallback>{friend.name[0]}</AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${friend.status === "online" ? "bg-green-500" : "bg-gray-400"}`}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{friend.name}</div>
                              <div className="text-sm text-muted-foreground">{friend.email}</div>
                              {friend.status === "offline" && friend.lastActive && (
                                <div className="text-xs text-muted-foreground">
                                  마지막 접속: {new Date(friend.lastActive).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleStartChat(friend.id)}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFriend(friend.id)}>
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">친구가 없습니다</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? "검색 결과가 없습니다." : "친구를 추가해보세요!"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>받은 친구 요청</CardTitle>
                </CardHeader>
                <CardContent>
                  {friendRequests.length > 0 ? (
                    <div className="space-y-4">
                      {friendRequests.map((request) => (
                        <div key={request.id} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.name} />
                              <AvatarFallback>{request.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{request.name}</div>
                              <div className="text-sm text-muted-foreground">{request.email}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(request.sentAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {request.message && (
                            <div className="bg-muted p-3 rounded-md text-sm mb-3">{request.message}</div>
                          )}
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleRejectRequest(request.id)}>
                              <X className="mr-2 h-4 w-4" />
                              거절
                            </Button>
                            <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                              <Check className="mr-2 h-4 w-4" />
                              수락
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">받은 요청 없음</h3>
                      <p className="text-muted-foreground">현재 받은 친구 요청이 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sent">
              <Card>
                <CardHeader>
                  <CardTitle>보낸 친구 요청</CardTitle>
                </CardHeader>
                <CardContent>
                  {sentRequests.length > 0 ? (
                    <div className="space-y-4">
                      {sentRequests.map((request) => (
                        <div key={request.id} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.name} />
                              <AvatarFallback>{request.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{request.name}</div>
                              <div className="text-sm text-muted-foreground">{request.email}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(request.sentAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {request.message && (
                            <div className="bg-muted p-3 rounded-md text-sm mb-3">{request.message}</div>
                          )}
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => handleCancelRequest(request.id)}>
                              <X className="mr-2 h-4 w-4" />
                              요청 취소
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">보낸 요청 없음</h3>
                      <p className="text-muted-foreground">현재 보낸 친구 요청이 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </div>
  )
}
