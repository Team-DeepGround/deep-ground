"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, MessageSquare, X } from "lucide-react"
import { api } from "@/lib/api-client"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface StudyGroupDetail {
  id: number
  title: string
  explanation: string
  writer: string
  memberCount: number
  groupLimit: number
  location: string
  recruitEndDate: string
  commentCount: number
  participants: string[]
  offline: boolean
}

// 더미 데이터
const dummySchedule = [
  {
    id: 1,
    date: "2024-06-20",
    time: "19:00",
    title: "첫 번째 스터디 모임",
    description: "스터디 소개 및 진행 계획 논의",
    location: "온라인 (Zoom)",
  },
  {
    id: 2,
    date: "2024-06-27",
    time: "19:00",
    title: "두 번째 스터디 모임",
    description: "주제 1: React 기초",
    location: "온라인 (Zoom)",
  },
]

const dummyMembers = [
  {
    id: 1,
    name: "김개발",
    role: "스터디장",
    avatar: "/placeholder.svg",
    joinedAt: "2024-06-01",
  },
  {
    id: 2,
    name: "이코딩",
    role: "참여자",
    avatar: "/placeholder.svg",
    joinedAt: "2024-06-02",
  },
]

const dummyResources = [
  {
    id: 1,
    title: "React 공식 문서",
    type: "link",
    url: "https://react.dev",
    description: "React 공식 문서입니다.",
    addedBy: "김개발",
    addedAt: "2024-06-01",
  },
  {
    id: 2,
    title: "스터디 진행 계획",
    type: "file",
    url: "#",
    description: "스터디 진행 계획 문서입니다.",
    addedBy: "김개발",
    addedAt: "2024-06-01",
  },
]

const dummyDiscussions = [
  {
    id: 1,
    title: "첫 번째 스터디 모임 공지",
    author: "김개발",
    createdAt: "2024-06-01",
    content: "첫 번째 스터디 모임 일정과 준비사항을 공지드립니다.",
    commentCount: 3,
  },
  {
    id: 2,
    title: "React 학습 자료 공유",
    author: "이코딩",
    createdAt: "2024-06-02",
    content: "React 학습에 도움이 될 만한 자료를 공유합니다.",
    commentCount: 1,
  },
]

export default function StudyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [study, setStudy] = useState<StudyGroupDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoined, setIsJoined] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [replyToComment, setReplyToComment] = useState<{ id: number; author: string } | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const [expandedComments, setExpandedComments] = useState<number[]>([])

  useEffect(() => {
    const fetchStudyDetail = async () => {
      try {
        const response = await api.get(`/study-group/${params.id}`)
        setStudy(response.result)
      } catch (error) {
        console.error('스터디 상세 정보 조회 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudyDetail()
  }, [params.id])

  const handleJoinStudy = () => {
    if (isJoined) {
      // 이미 참여한 경우, 탈퇴 처리
      setIsJoined(false)
      toast({
        title: "스터디 탈퇴",
        description: "스터디에서 탈퇴했습니다.",
      })
    } else {
      // 참여하지 않은 경우, 참여 처리
      setIsJoined(true)
      toast({
        title: "스터디 참여 완료",
        description: "스터디에 성공적으로 참여했습니다.",
      })
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "링크 복사 완료",
        description: "스터디 링크가 클립보드에 복사되었습니다.",
      })
    } catch (error) {
      toast({
        title: "링크 복사 실패",
        description: "클립보드에 복사하는데 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  const handleReply = (commentId: number, authorName: string) => {
    setReplyToComment({ id: commentId, author: authorName })
    if (commentInputRef.current) {
      commentInputRef.current.focus()
    }
  }

  const cancelReply = () => {
    setReplyToComment(null)
  }

  const handleCommentSubmit = () => {
    if (!commentText.trim()) {
      toast({
        title: "내용을 입력해주세요",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 댓글 또는 답글 등록 로직 (실제로는 API 호출)
    if (replyToComment) {
      toast({
        title: "답글 등록 완료",
        description: `${replyToComment.author}님의 댓글에 답글을 등록했습니다.`,
      })
    } else {
      toast({
        title: "댓글 등록 완료",
        description: "댓글이 등록되었습니다.",
      })
    }

    // 입력 초기화
    setCommentText("")
    setReplyToComment(null)
  }

  const toggleExpandComment = (commentId: number) => {
    if (expandedComments.includes(commentId)) {
      setExpandedComments(expandedComments.filter((id) => id !== commentId))
    } else {
      setExpandedComments([...expandedComments, commentId])
    }
  }

  // 댓글 내용이 긴지 확인하는 함수
  const isLongComment = (content: string) => content.length > 150

  // 댓글 내용을 표시하는 함수
  const renderCommentContent = (comment) => {
    const isExpanded = expandedComments.includes(comment.id)
    const isLong = isLongComment(comment.content)

    if (!isLong || isExpanded) {
      return <p className="mt-1">{comment.content}</p>
    }

    return (
      <div>
        <p className="mt-1">{comment.content.substring(0, 150)}...</p>
        <button className="text-xs text-primary mt-1 hover:underline" onClick={() => toggleExpandComment(comment.id)}>
          더보기
        </button>
      </div>
    )
  }

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  if (!study) {
    return <div>스터디를 찾을 수 없습니다.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 스터디 기본 정보 */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-4">{study.title}</h1>
              <p className="text-muted-foreground mb-6">{study.explanation}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleShare}>
                공유하기
              </Button>
              <Button onClick={handleJoinStudy} disabled={study.memberCount >= study.groupLimit && !isJoined}>
                {isJoined ? "탈퇴하기" : "참여하기"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>모집 마감: {study.recruitEndDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>
                {study.memberCount}/{study.groupLimit}명
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{study.offline ? study.location : "온라인"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <span>댓글 {study.commentCount}개</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant={study.offline ? "outline" : "default"} className="font-normal">
              {study.offline ? "오프라인" : "온라인"}
            </Badge>
          </div>
        </div>

        {/* 스터디 상세 정보 탭 */}
        <Tabs defaultValue="about">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">소개</TabsTrigger>
            <TabsTrigger value="schedule">일정</TabsTrigger>
            <TabsTrigger value="members">참여자</TabsTrigger>
            <TabsTrigger value="resources">자료</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>스터디 소개</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{study.explanation}</p>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>토론</CardTitle>
                  <CardDescription>스터디 관련 질문이나 의견을 나눠보세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {dummyDiscussions.map((discussion) => (
                      <div key={discussion.id} className="space-y-4">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg" alt={discussion.author} />
                            <AvatarFallback>{discussion.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{discussion.author}</p>
                              <p className="text-sm text-muted-foreground">{discussion.createdAt}</p>
                            </div>
                            {renderCommentContent(discussion)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="w-full">
                    {replyToComment && (
                      <div className="flex items-center justify-between bg-muted p-2 rounded-md mb-2">
                        <p className="text-sm">
                          <span className="font-medium">{replyToComment.author}</span>님에게 답글 작성 중
                        </p>
                        <Button variant="ghost" size="sm" onClick={cancelReply}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <Textarea
                      ref={commentInputRef}
                      className="w-full border rounded-md p-3 min-h-[100px] resize-none"
                      placeholder="질문이나 의견을 작성해주세요..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="flex justify-end mt-3">
                      <Button onClick={handleCommentSubmit}>작성하기</Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <div className="space-y-4">
              {dummySchedule.map((schedule) => (
                <Card key={schedule.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{schedule.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {schedule.date} {schedule.time}
                      </p>
                      <p>{schedule.description}</p>
                      <p className="text-sm text-muted-foreground">{schedule.location}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dummyMembers.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted" />
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">참여일: {member.joinedAt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <div className="space-y-4">
              {dummyResources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>{resource.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>추가: {resource.addedBy}</span>
                        <span>•</span>
                        <span>{resource.addedAt}</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.type === "link" ? "링크 열기" : "파일 다운로드"}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
