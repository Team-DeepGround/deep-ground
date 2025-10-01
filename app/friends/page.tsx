"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus, UserMinus, Check, X, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { ApiError } from "@/lib/api-client"

// API 응답 타입 정의
interface Friend {
  friendId: number;
  otherMemberName: string;
  profileId?: number | null; // ✅ 추가됨
  status: 'REQUEST' | 'CANCEL' | 'ACCEPT' | 'REFUSAL';
}

interface FriendResponse {
  status: number;
  message: string;
  result: Friend[] | number | null;
}

export default function FriendsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [emailSearch, setEmailSearch] = useState("")
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<Friend[]>([])
  const [sentRequests, setSentRequests] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 초기 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      try {
        const friendsRes = await api.get('/friends')
        if (friendsRes?.result) {
          console.log("✅ 친구 목록 응답:", friendsRes.result) // ← 여기에 로그 찍기
          setFriends(friendsRes.result as Friend[])
        }
      } catch (error) {
        console.error('친구 목록 로드 실패:', error)
      }
      try {
        const receivedRes = await api.get('/friends/receive')
        if (receivedRes?.result) {
          setFriendRequests(receivedRes.result as Friend[])
        }
      } catch (error) {
        console.error('받은 요청 로드 실패:', error)
      }
      try {
        const sentRes = await api.get('/friends/sent')
        if (sentRes?.result) {
          setSentRequests(sentRes.result as Friend[])
        }
      } catch (error) {
        console.error('보낸 요청 로드 실패:', error)
      }
    } catch (error) {
      console.error('전체 데이터 로드 실패:', error)
      if (error instanceof ApiError && error.status !== 401) {
        toast({
          title: "데이터 로드 실패",
          description: error.message || "친구 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 친구 검색 필터링
  const filteredFriends = friends.filter(
    (friend) =>
      friend.otherMemberName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 핸들러 함수들 (기존과 동일)
  const handleSendRequest = async () => {
    if (isSubmitting) return
    if (!emailSearch) {
      toast({
        title: "이메일 필요",
        description: "친구 요청을 보낼 이메일을 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailSearch)) {
      toast({
        title: "이메일 형식 오류",
        description: "올바른 이메일 형식을 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    try {
      setIsSubmitting(true)
      const response = await api.post('/friends/request', {
        receiverEmail: emailSearch
      })
      if (response?.status === 200) {
        toast({
          title: "친구 요청 전송",
          description: response.message || "친구 요청이 성공적으로 전송되었습니다.",
        })
        setEmailSearch("")
        await loadData()
      }
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        toast({
          title: "요청 실패",
          description: error.message || "친구 요청 전송에 실패했습니다.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptRequest = async (memberId: number) => {
    if (isSubmitting) return
    try {
      setIsSubmitting(true)
      const response = await api.patch(`/friends/receive/${memberId}/accept`)
      if (response.status === 200) {
        toast({
          title: "친구 요청 수락",
          description: response.message,
        })
        await loadData()
      }
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        toast({
          title: "수락 실패",
          description: "친구 요청 수락에 실패했습니다.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRejectRequest = async (memberId: number) => {
    if (isSubmitting) return
    try {
      setIsSubmitting(true)
      const response = await api.patch(`/friends/receive/${memberId}/refusal`)
      if (response.status === 200) {
        toast({
          title: "친구 요청 거절",
          description: response.message,
        })
        await loadData()
      }
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        toast({
          title: "거절 실패",
          description: "친구 요청 거절에 실패했습니다.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveFriend = async (memberId: number) => {
    if (isSubmitting) return
    try {
      setIsSubmitting(true)
      const response = await api.delete(`/friends/${memberId}`)
      if (response.status === 200) {
        toast({
          title: "친구 삭제",
          description: response.message,
        })
        await loadData()
      }
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        toast({
          title: "삭제 실패",
          description: "친구 삭제에 실패했습니다.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelRequest = async (friendId: number) => {
    if (isSubmitting) return
    try {
      setIsSubmitting(true)
      const response = await api.patch(`/friends/sent/${friendId}/cancel`)
      if (response.status === 200) {
        toast({
          title: "친구 요청 취소",
          description: response.message,
        })
        await loadData()
      }
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        toast({
          title: "취소 실패",
          description: "친구 요청 취소에 실패했습니다.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">친구 관리</h1>
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <FriendAddCard
            emailSearch={emailSearch}
            setEmailSearch={setEmailSearch}
            isSubmitting={isSubmitting}
            onSendRequest={handleSendRequest}
          />
          <Tabs defaultValue="friends">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="friends">친구 목록</TabsTrigger>
              <TabsTrigger value="requests">받은 요청</TabsTrigger>
              <TabsTrigger value="sent">보낸 요청</TabsTrigger>
            </TabsList>
            <TabsContent value="friends">
              <FriendListCard
                isLoading={isLoading}
                friends={filteredFriends}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isSubmitting={isSubmitting}
                onRemoveFriend={handleRemoveFriend}
              />
            </TabsContent>
            <TabsContent value="requests">
              <FriendRequestsCard
                isLoading={isLoading}
                friendRequests={friendRequests}
                isSubmitting={isSubmitting}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            </TabsContent>
            <TabsContent value="sent">
              <SentRequestsCard
                isLoading={isLoading}
                sentRequests={sentRequests}
                isSubmitting={isSubmitting}
                onCancel={handleCancelRequest}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function FriendAddCard({ emailSearch, setEmailSearch, isSubmitting, onSendRequest }: {
  emailSearch: string;
  setEmailSearch: (v: string) => void;
  isSubmitting: boolean;
  onSendRequest: () => void;
}) {
  return (
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
            disabled={isSubmitting}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onSendRequest} 
          className="w-full"
          disabled={isSubmitting}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          친구 요청 보내기
        </Button>
      </CardFooter>
    </Card>
  )
}

function FriendListCard({ isLoading, friends, searchTerm, setSearchTerm, isSubmitting, onRemoveFriend }: {
  isLoading: boolean;
  friends: Friend[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  isSubmitting: boolean;
  onRemoveFriend: (id: number) => void;
}) {
  return (
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
            disabled={isLoading}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">로딩 중...</div>
        ) : friends.length > 0 ? (
          <div className="space-y-4">
            {friends.map((friend) => (
              <div key={friend.friendId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{friend.otherMemberName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{friend.otherMemberName}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* ✅ 프로필 보기 버튼 - 프로필 ID가 있을 경우만 렌더링 */}
                  {friend.profileId != null && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/profile/${friend.profileId}`}>프로필</a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFriend(friend.friendId)}
                    disabled={isSubmitting}
                  >
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
  )
}


function FriendRequestsCard({ isLoading, friendRequests, isSubmitting, onAccept, onReject }: {
  isLoading: boolean;
  friendRequests: Friend[];
  isSubmitting: boolean;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>받은 친구 요청</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">로딩 중...</div>
        ) : friendRequests.length > 0 ? (
          <div className="space-y-4">
            {friendRequests.map((request) => (
              <div key={request.friendId} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarFallback>{request.otherMemberName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{request.otherMemberName}</div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onReject(request.friendId)}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    거절
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => onAccept(request.friendId)}
                    disabled={isSubmitting}
                  >
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
  )
}

function SentRequestsCard({ isLoading, sentRequests, isSubmitting, onCancel }: {
  isLoading: boolean;
  sentRequests: Friend[];
  isSubmitting: boolean;
  onCancel: (id: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>보낸 친구 요청</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12">로딩 중...</div>
        ) : sentRequests.length > 0 ? (
          <div className="space-y-4">
            {sentRequests.map((request) => (
              <div key={request.friendId} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar>
                    <AvatarFallback>{request.otherMemberName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{request.otherMemberName}</div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onCancel(request.friendId)}
                    disabled={isSubmitting}
                  >
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
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </div>
  )
}
