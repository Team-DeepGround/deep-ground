"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, Share2, Send, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { api } from "@/lib/api-client"

interface Reply {
  replyId: number
  nickname: string
  content: string
  createdAt: string
}

interface Comment {
  commentId: number
  nickname: string
  content: string
  createdAt: string
  replies: Reply[]
}

interface StudyGroupDetail {
  id: number
  title: string
  explanation: string
  writer: string
  memberCount: number
  groupLimit: number
  location: string
  recruitStartDate: string
  recruitEndDate: string
  studyStartDate: string
  studyEndDate: string
  commentCount: number
  participants: string[]
  comments: Comment[]
  offline: boolean
}

// 더미 일정 데이터
const dummySchedule = [
  {
    id: 1,
    title: "첫 번째 스터디 모임",
    date: "2024-03-20",
    time: "19:00",
    description: "스터디 소개 및 OT",
    location: "온라인 (Zoom)",
  },
  {
    id: 2,
    title: "두 번째 스터디 모임",
    date: "2024-03-27",
    time: "19:00",
    description: "1주차 학습 내용 공유",
    location: "온라인 (Zoom)",
  },
  {
    id: 3,
    title: "세 번째 스터디 모임",
    date: "2024-04-03",
    time: "19:00",
    description: "2주차 학습 내용 공유",
    location: "온라인 (Zoom)",
  },
]

export default function StudyDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [study, setStudy] = useState<StudyGroupDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isParticipating, setIsParticipating] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [replyToComment, setReplyToComment] = useState<number | null>(null)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const fetchStudyDetails = async () => {
      try {
        const response = await api.get(`/study-group/${params.id}`)
        setStudy(response.result)
      } catch (error) {
        console.error("Error fetching study details:", error)
        setStudy(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudyDetails()
  }, [params.id])

  useEffect(() => {
    if (study && user) {
      const isParticipant = study.participants.some(
        (participant) => participant === user.name
      )
      setIsParticipating(isParticipant)
    }
  }, [study, user])

  const handleJoinStudy = async () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "스터디에 참여하려면 로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    try {
      if (isParticipating) {
        // 참여 취소 API 호출
        await api.delete(`/study-group/${params.id}/join`)
        setIsParticipating(false)
        toast({
          title: "참여 취소 완료",
          description: "스터디 참여가 취소되었습니다.",
        })
      } else {
        // 참여 신청 API 호출
        await api.post(`/study-group/${params.id}/join`)
        setHasApplied(true)
        toast({
          title: "참여 신청 완료",
          description: "스터디에 참여되었습니다.",
        })
      }

      // 스터디 정보 새로고침
      const response = await api.get(`/study-group/${params.id}`)
      setStudy(response.result)
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "요청을 처리하는 중 오류가 발생했습니다.",
        variant: "destructive",
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

  const handleReplyClick = (commentId: number) => {
    setReplyToComment(commentId)
    setExpandedComments((prev) => {
      const newSet = new Set(prev)
      newSet.add(commentId)
      return newSet
    })
  }

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "댓글을 작성하려면 로그인이 필요합니다.",
        variant: "destructive",
      })
      return
    }

    if (!study) {
      toast({
        title: "오류 발생",
        description: "스터디 정보를 찾을 수 없습니다.",
        variant: "destructive",
      })
      return
    }

    if (!commentText.trim()) {
      toast({
        title: "내용을 입력해주세요",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      if (replyToComment) {
        await api.post(`/study-group/replies`, {
          commentId: replyToComment,
          content: commentText,
        })
      } else {
        await api.post(`/study-group/comments`, {
          studyGroupId: study.id,
          content: commentText,
        })
      }

      // 댓글 목록 새로고침
      const response = await api.get(`/study-group/${params.id}`)
      setStudy(response.result)

      setCommentText("")
      setReplyToComment(null)
      toast({
        title: "댓글 등록 완료",
        description: replyToComment ? "답글이 등록되었습니다." : "댓글이 등록되었습니다.",
      })
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "댓글 등록에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const toggleCommentExpansion = (commentId: number) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return null
  }

  if (!study) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="mb-4">
            <X className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">스터디를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">
            요청하신 스터디가 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          <Button asChild>
            <Link href="/studies">
              스터디 목록으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{study.title}</h1>
            <div className="flex gap-2">
              <Button
                variant={isParticipating ? "secondary" : "default"}
                disabled={isParticipating || hasApplied}
                onClick={handleJoinStudy}
              >
                {isParticipating
                  ? "참여 중"
                  : hasApplied
                  ? "신청 완료"
                  : "참여하기"}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                공유하기
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mb-6">{study.explanation}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>
              모집 기간: {new Date(study.recruitStartDate).toLocaleDateString()} ~{" "}
              {new Date(study.recruitEndDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>
              스터디 기간: {new Date(study.studyStartDate).toLocaleDateString()} ~{" "}
              {new Date(study.studyEndDate).toLocaleDateString()}
            </span>
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
        </div>

        <Tabs defaultValue="info">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">스터디 소개</TabsTrigger>
            <TabsTrigger value="schedule" className="flex-1">일정</TabsTrigger>
            <TabsTrigger value="members" className="flex-1">참여자</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>스터디 소개</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{study.explanation}</p>
              </CardContent>
            </Card>

            {/* 토론 섹션 */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-6">토론</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  {study.comments.map((comment) => (
                    <Card key={comment.commentId}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarFallback>
                                {comment.nickname[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{comment.nickname}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {!replyToComment && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReplyClick(comment.commentId)}
                            >
                              답글
                            </Button>
                          )}
                        </div>
                        <p className="mb-4">{comment.content}</p>
                        {comment.replies.length > 0 && (
                          <div className="space-y-3">
                            {expandedComments.has(comment.commentId)
                              ? comment.replies.map((reply) => (
                                  <div
                                    key={reply.replyId}
                                    className="ml-8 bg-muted/50 rounded-lg p-4"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback>
                                          {reply.nickname[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">
                                          {reply.nickname}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(
                                            reply.createdAt
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm pl-8">{reply.content}</p>
                                  </div>
                                ))
                              : comment.replies.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      toggleCommentExpansion(comment.commentId)
                                    }
                                    className="ml-8"
                                  >
                                    답글 {comment.replies.length}개 보기
                                  </Button>
                                )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  {replyToComment && (
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {
                                study.comments.find(
                                  (comment) => comment.commentId === replyToComment
                                )?.nickname[0]
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {
                                study.comments.find(
                                  (comment) => comment.commentId === replyToComment
                                )?.nickname
                              }
                              님의 댓글
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {
                                study.comments.find(
                                  (comment) => comment.commentId === replyToComment
                                )?.content
                              }
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyToComment(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <Textarea
                    ref={commentTextareaRef}
                    placeholder={
                      replyToComment
                        ? "답글을 입력하세요"
                        : "댓글을 입력하세요"
                    }
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button onClick={handleSubmitComment}>
                      <Send className="h-4 w-4 mr-2" />
                      {replyToComment ? "답글 작성" : "댓글 작성"}
                    </Button>
                  </div>
                </div>
              </div>
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
            <Card>
              <CardHeader>
                <CardTitle>참여자 목록</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {study.memberCount}/{study.groupLimit}명 참여 중
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {study.participants.map((participant, index) => (
                    <div key={`${participant}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{participant[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{participant}</p>
                            {participant === study.writer && (
                              <Badge variant="secondary">스터디장</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
