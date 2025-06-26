"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api-client"
import { StudyGroupDetail, StudySession } from "@/types/study"
import { StudyHeader } from "@/components/studies/StudyHeader"
import { StudyInfo } from "@/components/studies/StudyInfo"
import { ParticipantList } from "@/components/studies/ParticipantList"
import { CommentSection } from "@/components/studies/CommentSection"
import { StudySchedule } from "@/components/studies/StudySchedule"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// 더미 데이터
const dummySessions: StudySession[] = [
  {
    id: 1,
    title: "첫 번째 스터디 세션",
    description: "스터디 시작 및 OT",
    startDate: "2024-03-20T14:00:00",
    endDate: "2024-03-20T16:00:00",
    location: "온라인 (Zoom)",
    participants: ["testUser", "멤버 테스터 1"],
  },
  {
    id: 2,
    title: "두 번째 스터디 세션",
    description: "주제 토론 및 발표",
    startDate: "2024-03-27T14:00:00",
    endDate: "2024-03-27T16:00:00",
    location: "온라인 (Zoom)",
    participants: ["testUser", "멤버 테스터 1"],
  },
  {
    id: 3,
    title: "세 번째 스터디 세션",
    description: "프로젝트 진행 상황 공유",
    startDate: "2024-04-03T14:00:00",
    endDate: "2024-04-03T16:00:00",
    location: "온라인 (Zoom)",
    participants: ["testUser"],
  },
]

export default function StudyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [study, setStudy] = useState<StudyGroupDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const response = await api.get(`/study-group/${params.id}`)
        // 더미 데이터 추가
        setStudy({
          ...response.result,
          sessions: dummySessions,
        })
      } catch (error) {
        toast({
          title: "스터디 정보를 불러오는데 실패했습니다",
          description: "잠시 후 다시 시도해주세요",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudy()
  }, [params.id, toast])

  const handleJoinStudy = async () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "스터디에 참여하려면 로그인해주세요",
        variant: "destructive",
      })
      return
    }

    if (!study) return

    try {
      await api.post(`/study-group/${study.id}/join`)
      toast({
        title: "스터디 참여 신청이 완료되었습니다",
        description: "스터디장의 승인을 기다려주세요",
      })
      // 스터디 정보를 다시 불러와서 memberStatus 업데이트
      const response = await api.get(`/study-group/${params.id}`)
      setStudy({
        ...response.result,
        sessions: dummySessions,
      })
    } catch (error) {
      toast({
        title: "스터디 참여 신청에 실패했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "링크가 복사되었습니다",
        description: "스터디 링크를 공유해보세요",
      })
    } catch (error) {
      toast({
        title: "링크 복사에 실패했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      })
    }
  }

  const handleCommentSubmit = async (content: string) => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "댓글을 작성하려면 로그인해주세요",
        variant: "destructive",
      })
      return
    }

    if (!study) return

    try {
      await api.post(`/study-group/comments`, {
        studyGroupId: study.id,
        content,
      })
      const response = await api.get(`/study-group/${study.id}`)
      setStudy(response.result)
    } catch (error) {
      throw error
    }
  }

  const handleReplySubmit = async (commentId: number, content: string) => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "답글을 작성하려면 로그인해주세요",
        variant: "destructive",
      })
      return
    }

    if (!study) return

    try {
      await api.post(`/study-group/replies`, {
        commentId,
        content,
      })
      const response = await api.get(`/study-group/${study.id}`)
      setStudy(response.result)
    } catch (error) {
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!study) {
    return (
      <div className="container max-w-4xl mx-auto py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">스터디를 찾을 수 없습니다</div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div className="space-y-6">
        <StudyHeader
          study={study}
          memberStatus={study.memberStatus}
          onJoinStudy={handleJoinStudy}
          onShare={handleShare}
        />
        <StudyInfo study={study} />
      </div>

      <Separator />

      <Tabs defaultValue="introduction" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="introduction" className="flex-1 max-w-[200px]">
            스터디 소개
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1 max-w-[200px]">
            스터디 일정
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex-1 max-w-[200px]">
            참여자
          </TabsTrigger>
        </TabsList>

        <TabsContent value="introduction" className="mt-6">
          <div className="space-y-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-4">스터디 소개</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {study.explanation}
              </p>
            </div>
            <Separator />
            <CommentSection
              comments={study.comments}
              studyId={study.id}
              onCommentSubmit={handleCommentSubmit}
              onReplySubmit={handleReplySubmit}
            />
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <StudySchedule
            sessions={study.sessions}
            isParticipating={study.memberStatus === "APPROVED"}
            onAddSession={() => {
              toast({
                title: "기능 준비 중",
                description: "스터디 일정 추가 기능은 곧 제공될 예정입니다.",
              })
            }}
          />
        </TabsContent>

        <TabsContent value="participants" className="mt-6">
          <ParticipantList study={study} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
