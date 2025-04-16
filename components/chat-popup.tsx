"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, ImageIcon, Paperclip, Smile, MoreHorizontal, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { AvatarGroup as UIAvatarGroup } from "@/components/ui/avatar-group"

// 임시 데이터
const friends = [
  {
    id: 1,
    name: "김개발",
    email: "kim@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastActive: null,
    unreadCount: 0,
  },
  {
    id: 2,
    name: "이코딩",
    email: "lee@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    lastActive: "2023-05-10T14:30:00Z",
    unreadCount: 3,
  },
  {
    id: 3,
    name: "박서버",
    email: "park@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    lastActive: null,
    unreadCount: 0,
  },
  {
    id: 4,
    name: "최데브옵스",
    email: "choi@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    lastActive: "2023-05-09T18:45:00Z",
    unreadCount: 1,
  },
]

// 임시 그룹 채팅 데이터
const groupChats = [
  {
    id: "group1",
    name: "React 스터디 그룹",
    members: [
      {
        id: 1,
        name: "김개발",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: 2,
        name: "이코딩",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: 3,
        name: "박서버",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
    unreadCount: 5,
  },
  {
    id: "group2",
    name: "알고리즘 스터디",
    members: [
      {
        id: 1,
        name: "김개발",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: 4,
        name: "최데브옵스",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ],
    unreadCount: 0,
  },
]

// 임시 그룹 채팅 메시지 데이터
const groupChatMessages = {
  group1: [
    {
      id: 1001,
      senderId: 1,
      text: "다들 안녕하세요! 이번 주 스터디 주제는 React 훅스입니다.",
      timestamp: "2023-05-10T09:30:00Z",
      isRead: true,
      files: [],
    },
    {
      id: 1002,
      senderId: 2,
      text: "안녕하세요! 훅스 중에서도 특히 useEffect와 useCallback에 대해 다루면 좋을 것 같아요.",
      timestamp: "2023-05-10T09:35:00Z",
      isRead: true,
      files: [],
    },
    {
      id: 1003,
      senderId: "me",
      text: "저도 동의합니다. 커스텀 훅 만드는 방법도 같이 다루면 좋을 것 같아요!",
      timestamp: "2023-05-10T09:40:00Z",
      isRead: true,
      files: [],
    },
  ],
  group2: [
    {
      id: 2001,
      senderId: 1,
      text: "이번 주에는 그래프 알고리즘을 풀어볼까요?",
      timestamp: "2023-05-09T14:20:00Z",
      isRead: true,
      files: [],
    },
    {
      id: 2002,
      senderId: 4,
      text: "좋은 생각이에요! DFS와 BFS 문제 몇 개 준비해볼게요.",
      timestamp: "2023-05-09T14:25:00Z",
      isRead: true,
      files: [],
    },
  ],
}

// 임시 채팅 데이터
const chatMessages = {
  1: [
    {
      id: 101,
      senderId: 1,
      text: "안녕하세요! React 스터디 진행 상황이 어떻게 되나요?",
      timestamp: "2023-05-10T09:30:00Z",
      isRead: true,
      files: [],
    },
    {
      id: 102,
      senderId: "me",
      text: "안녕하세요! 지금 컴포넌트 설계 중이에요. 내일까지 완료할 예정입니다.",
      timestamp: "2023-05-10T09:35:00Z",
      isRead: true,
      files: [],
    },
    {
      id: 103,
      senderId: 1,
      text: "좋네요! 혹시 도움이 필요하면 언제든지 말씀해주세요.",
      timestamp: "2023-05-10T09:40:00Z",
      isRead: true,
      files: [],
    },
  ],
  2: [
    {
      id: 201,
      senderId: 2,
      text: "알고리즘 문제 풀이 스터디 참여 가능하신가요?",
      timestamp: "2023-05-09T14:20:00Z",
      isRead: false,
      files: [],
    },
    {
      id: 202,
      senderId: 2,
      text: "매주 화요일 저녁 8시에 진행됩니다.",
      timestamp: "2023-05-09T14:22:00Z",
      isRead: false,
      files: [],
    },
    {
      id: 203,
      senderId: 2,
      text: "관심 있으시면 알려주세요!",
      timestamp: "2023-05-09T14:25:00Z",
      isRead: false,
      files: [],
    },
  ],
  4: [
    {
      id: 401,
      senderId: 4,
      text: "Docker 네트워크 설정 관련해서 질문이 있습니다.",
      timestamp: "2023-05-08T16:10:00Z",
      isRead: false,
      files: [
        {
          id: 1,
          name: "docker-config.png",
          type: "image",
          url: "/placeholder.svg?height=200&width=300",
          size: "1.2MB",
        },
      ],
    },
  ],
}

interface ChatPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatPopup({ isOpen, onClose }: ChatPopupProps) {
  const { toast } = useToast()
  const [selectedFriend, setSelectedFriend] = useState<(typeof friends)[0] | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<(typeof groupChats)[0] | null>(null)
  const [message, setMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  // 친구 검색 필터링
  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 메시지 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedFriend, selectedGroup])

  // Update the handleSendMessage function to handle group chats
  const handleSendMessage = () => {
    if (!message.trim() && uploadedFiles.length === 0) return

    // 메시지 전송 로직 (실제로는 API 호출)
    toast({
      title: "메시지 전송",
      description:
        uploadedFiles.length > 0
          ? `메시지와 ${uploadedFiles.length}개의 파일이 전송되었습니다.`
          : "메시지가 전송되었습니다.",
    })

    // 메시지 입력 초기화
    setMessage("")
    setUploadedFiles([])
    setUploadProgress({})
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newFiles = Array.from(files)
      setUploadedFiles((prev) => [...prev, ...newFiles])

      // 파일 업로드 진행 상태 시뮬레이션
      newFiles.forEach((file, index) => {
        const fileId = `${file.name}-${index}`
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

        let progress = 0
        const interval = setInterval(() => {
          progress += 10
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))

          if (progress >= 100) {
            clearInterval(interval)
          }
        }, 300)
      })

      // 파일 업로드 로직 (실제로는 API 호출)
      toast({
        title: "파일 업로드 중",
        description: `${files.length}개의 파일을 업로드하고 있습니다.`,
      })
    }

    // 파일 선택 초기화 (같은 파일 다시 선택 가능하도록)
    if (e.target) {
      e.target.value = ""
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleBackToFriendList = () => {
    setSelectedFriend(null)
  }

  if (!isOpen) return null

  // Update the chat popup to show both friend list and chat window side by side
  return (
    <div className="fixed bottom-20 right-6 z-50 w-[800px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] shadow-xl rounded-lg overflow-hidden">
      <Card className="border">
        <CardHeader className="p-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">메시지</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 flex" style={{ height: "500px" }}>
          {/* 친구 목록 - 항상 표시 */}
          <div className="w-[280px] border-r">
            <div className="p-3 border-b">
              <Input
                placeholder="친구 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Tabs defaultValue="all" className="w-full">
              <div className="px-3 pt-3">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="online">온라인</TabsTrigger>
                  <TabsTrigger value="groups">단체</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="m-0">
                <ScrollArea className="h-full max-h-[420px]">
                  <div className="p-3 space-y-2">
                    {filteredFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className={`flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer ${
                          selectedFriend?.id === friend.id && !selectedGroup ? "bg-accent" : ""
                        }`}
                        onClick={() => {
                          setSelectedFriend(friend)
                          setSelectedGroup(null)
                        }}
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                              friend.status === "online" ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          {friend.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                              {friend.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{friend.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {friend.status === "online" ? "온라인" : "오프라인"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="online" className="m-0">
                <ScrollArea className="h-full max-h-[420px]">
                  <div className="p-3 space-y-2">
                    {filteredFriends
                      .filter((friend) => friend.status === "online")
                      .map((friend) => (
                        <div
                          key={friend.id}
                          className={`flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer ${
                            selectedFriend?.id === friend.id && !selectedGroup ? "bg-accent" : ""
                          }`}
                          onClick={() => {
                            setSelectedFriend(friend)
                            setSelectedGroup(null)
                          }}
                        >
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                              <AvatarFallback>{friend.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                            {friend.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                {friend.unreadCount}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{friend.name}</div>
                            <div className="text-xs text-muted-foreground truncate">온라인</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="groups" className="m-0">
                <ScrollArea className="h-full max-h-[420px]">
                  <div className="p-3 space-y-2">
                    {/* 새 그룹 채팅 만들기 버튼 */}
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2 mb-2"
                      onClick={() => {
                        toast({
                          title: "새 그룹 채팅",
                          description: "새 그룹 채팅을 만들었습니다.",
                        })
                      }}
                    >
                      <Users className="h-4 w-4" />
                      <span>새 그룹 채팅 만들기</span>
                    </Button>

                    {/* 그룹 채팅 목록 */}
                    {groupChats.map((group) => (
                      <div
                        key={group.id}
                        className={`flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer ${
                          selectedGroup?.id === group.id ? "bg-accent" : ""
                        }`}
                        onClick={() => {
                          setSelectedGroup(group)
                          setSelectedFriend(null)
                        }}
                      >
                        <div className="relative">
                          <UIAvatarGroup>
                            {group.members.slice(0, 3).map((member, index) => (
                              <Avatar key={member.id} className={`h-8 w-8 ${index > 0 ? "-ml-3" : ""}`}>
                                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                              </Avatar>
                            ))}
                          </UIAvatarGroup>
                          {group.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                              {group.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{group.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{group.members.length}명 참여 중</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* 채팅창 - 항상 표시 */}
          <div className="flex-1 flex flex-col">
            {selectedFriend ? (
              <>
                <div className="p-3 border-b flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={selectedFriend.avatar || "/placeholder.svg"} alt={selectedFriend.name} />
                      <AvatarFallback>{selectedFriend.name[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                        selectedFriend.status === "online" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{selectedFriend.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedFriend.status === "online" ? "온라인" : "오프라인"}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages[selectedFriend.id as keyof typeof chatMessages]?.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}>
                        {msg.senderId !== "me" && (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={selectedFriend.avatar || "/placeholder.svg"} alt={selectedFriend.name} />
                            <AvatarFallback>{selectedFriend.name[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-lg ${
                            msg.senderId === "me" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p>{msg.text}</p>

                          {/* 파일 표시 */}
                          {msg.files && msg.files.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.files.map((file, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  {file.type === "image" ? (
                                    <div className="mt-2">
                                      <img
                                        src={file.url || "/placeholder.svg"}
                                        alt={file.name}
                                        className="max-w-full rounded-md cursor-pointer hover:opacity-90"
                                      />
                                      <div className="text-xs mt-1 flex justify-between">
                                        <span>{file.name}</span>
                                        <span>{file.size}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 p-2 bg-accent rounded-md">
                                      <Paperclip className="h-4 w-4" />
                                      <span className="text-sm">{file.name}</span>
                                      <span className="text-xs text-muted-foreground">{file.size}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div
                            className={`text-xs mt-1 ${
                              msg.senderId === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {msg.senderId === "me" && <span className="ml-2">{msg.isRead ? "읽음" : "안읽음"}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </>
            ) : selectedGroup ? (
              <>
                <div className="p-3 border-b flex items-center gap-3">
                  <UIAvatarGroup>
                    {selectedGroup.members.slice(0, 3).map((member, index) => (
                      <Avatar key={member.id} className={`h-8 w-8 ${index > 0 ? "-ml-3" : ""}`}>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                  </UIAvatarGroup>
                  <div className="flex-1">
                    <div className="font-medium">{selectedGroup.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedGroup.members.length}명 참여 중</div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {groupChatMessages[selectedGroup.id]?.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderId === "me" ? "justify-end" : "justify-start"}`}>
                        {msg.senderId !== "me" && (
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src={
                                selectedGroup.members.find((m) => m.id === msg.senderId)?.avatar || "/placeholder.svg"
                              }
                              alt={selectedGroup.members.find((m) => m.id === msg.senderId)?.name || "멤버"}
                            />
                            <AvatarFallback>
                              {selectedGroup.members.find((m) => m.id === msg.senderId)?.name[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-lg ${
                            msg.senderId === "me" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          {msg.senderId !== "me" && (
                            <p className="text-xs font-medium mb-1">
                              {selectedGroup.members.find((m) => m.id === msg.senderId)?.name}
                            </p>
                          )}
                          <p>{msg.text}</p>

                          {/* 파일 표시 */}
                          {msg.files && msg.files.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.files.map((file, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  {file.type === "image" ? (
                                    <div className="mt-2">
                                      <img
                                        src={file.url || "/placeholder.svg"}
                                        alt={file.name}
                                        className="max-w-full rounded-md cursor-pointer hover:opacity-90"
                                      />
                                      <div className="text-xs mt-1 flex justify-between">
                                        <span>{file.name}</span>
                                        <span>{file.size}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 p-2 bg-accent rounded-md">
                                      <Paperclip className="h-4 w-4" />
                                      <span className="text-sm">{file.name}</span>
                                      <span className="text-xs text-muted-foreground">{file.size}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div
                            className={`text-xs mt-1 ${
                              msg.senderId === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {msg.senderId === "me" && <span className="ml-2">{msg.isRead ? "읽음" : "안읽음"}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">메시지를 시작하세요</h3>
                <p className="text-muted-foreground mt-1">친구나 그룹을 선택하여 대화를 시작하세요.</p>
              </div>
            )}

            {/* 파일 업로드 미리보기 */}
            {uploadedFiles.length > 0 && (
              <div className="p-3 border-t border-b max-h-[150px] overflow-y-auto">
                <div className="text-sm font-medium mb-2">업로드할 파일 ({uploadedFiles.length})</div>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-accent/50 p-2 rounded-md">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)}MB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {uploadProgress[`${file.name}-${index}`] < 100 ? (
                          <Progress value={uploadProgress[`${file.name}-${index}`] || 0} className="w-20 h-2" />
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 메시지 입력 영역 - 친구나 그룹이 선택되었을 때만 표시 */}
            {(selectedFriend || selectedGroup) && (
              <div className="p-3 border-t">
                <div className="flex items-end gap-2">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleFileUpload}>
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    />
                    <Button variant="ghost" size="icon" onClick={handleFileUpload}>
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Smile className="h-5 w-5" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="메시지를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 min-h-[40px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button size="icon" onClick={handleSendMessage}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
