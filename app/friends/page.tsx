"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus, UserMinus, MessageSquare, Check, X, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sendFriendRequest, getReceivedFriendRequests, getSentFriendRequests, type Friend } from "./api"

export default function FriendsPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [emailSearch, setEmailSearch] = useState("")
  const [friends, setFriends] = useState<Friend[]>([])
  const [receivedRequests, setReceivedRequests] = useState<Friend[]>([])
  const [sentRequests, setSentRequests] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)

  // 초기 데이터 로드
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [receivedData, sentData] = await Promise.all([
        getReceivedFriendRequests(),
        getSentFriendRequests()
      ])
      setReceivedRequests(receivedData)
      setSentRequests(sentData)
    } catch (error) {
      toast({
        title: "데이터 로드 실패",
        description: "친구 요청 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendRequest = async () => {
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

    // 자기 자신에게 요청하는지 확인
    const currentUserEmail = localStorage.getItem('userEmail')
    if (currentUserEmail && currentUserEmail.toLowerCase() === emailSearch.toLowerCase()) {
      toast({
        title: "잘못된 요청",
        description: "자기 자신에게 친구 요청을 보낼 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await sendFriendRequest(emailSearch)
      toast({
        title: "친구 요청 전송",
        description: response.message,
      })
      setEmailSearch("")
      fetchData() // 목록 새로고침
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "친구 요청을 보내는데 실패했습니다."
      toast({
        title: "요청 실패",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleAcceptRequest = async (id: number) => {
    toast({
      title: "친구 요청 수락",
      description: "친구 요청을 수락했습니다.",
    })
    fetchData()
  }

  const handleRejectRequest = async (id: number) => {
    toast({
      title: "친구 요청 거절",
      description: "친구 요청을 거절했습니다.",
    })
    fetchData()
  }

  const handleRemoveFriend = async (id: number) => {
    toast({
      title: "친구 삭제",
      description: "친구 목록에서 삭제되었습니다.",
    })
    fetchData()
  }

  const handleStartChat = (id: number) => {
    toast({
      title: "채팅 시작",
      description: "채팅 기능은 준비 중입니다.",
    })
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>
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
                  {friends.length > 0 ? (
                    <div className="space-y-4">
                      {friends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg" alt={friend.name} />
                              <AvatarFallback>{friend.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{friend.name}</div>
                              <div className="text-sm text-muted-foreground">{friend.email}</div>
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
                  {receivedRequests.length > 0 ? (
                    <div className="space-y-4">
                      {receivedRequests.map((request) => (
                        <div key={request.id} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg" alt={request.name} />
                              <AvatarFallback>{request.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{request.name}</div>
                              <div className="text-sm text-muted-foreground">{request.email}</div>
                            </div>
                          </div>
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
                              <AvatarImage src="/placeholder.svg" alt={request.name} />
                              <AvatarFallback>{request.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{request.name}</div>
                              <div className="text-sm text-muted-foreground">{request.email}</div>
                            </div>
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
  return <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{children}</label>
}
