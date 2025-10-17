"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api-client"
import { StudyGroupDetail, StudySession, Participant } from "@/types/study"
import { StudyHeader } from "@/components/studies/StudyHeader"
import { StudyInfo } from "@/components/studies/StudyInfo"
import { ParticipantList } from "@/components/studies/ParticipantList"
import { CommentSection } from "@/components/studies/CommentSection"
import { StudySchedule } from "@/components/studies/StudySchedule"
import { Separator } from "@/components/ui/separator"
import { fetchStudySchedulesByGroup } from "@/lib/api/studySchedule" 
import { Card } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const { isAuthenticated, memberId } = useAuth()
  const [study, setStudy] = useState<StudyGroupDetail | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)

  useEffect(() => {
    const fetchStudy = async () => {
      // params.id가 없거나 유효하지 않은 경우 처리
      if (!params.id || params.id === 'undefined') {
        console.error("유효하지 않은 스터디 ID:", params.id)
        toast({
          title: "스터디를 찾을 수 없습니다",
          description: "잘못된 스터디 링크입니다",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      try {
        console.log("스터디 상세 조회 API 호출, ID:", params.id)
        const response = await api.get(`/study-group/${params.id}`)
        console.log("스터디 상세 조회 응답:", response)
        setStudy({
          ...response.result,
          sessions: dummySessions,
        })

        const participantResponse = await api.get(`/study-group/${params.id}/participants`)
        setParticipants(participantResponse.result)
      } catch (error) {
        console.error("스터디 상세 조회 실패:", error)
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
    if (!isAuthenticated || !memberId) {
      toast({
        title: "로그인이 필요합니다",
        description: "스터디에 참여하려면 로그인해주세요",
        variant: "destructive",
      })
      return
    }

    if (!study || !params.id) return

    try {
      await api.post(`/study-group/${study.id}/join`)
      toast({
        title: "스터디 참여 신청이 완료되었습니다",
        description: "스터디장의 승인을 기다려주세요",
      })
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

  const handleLeaveStudy = async () => {
    if (!study || !study.id) return

    try {
      await api.delete(`/study-group/${study.id}/leave`)
      toast({
        title: "스터디에서 나갔습니다",
        description: "스터디 참여가 취소되었습니다",
      })
      setShowLeaveDialog(false)
      router.push("/studies/my")
    } catch (error) {
      toast({
        title: "스터디 나가기에 실패했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      })
    }
  }

  const handleCommentSubmit = async (content: string) => {
    if (!isAuthenticated || !memberId) {
      toast({
        title: "로그인이 필요합니다",
        description: "댓글을 작성하려면 로그인해주세요",
        variant: "destructive",
      })
      return
    }

    if (!study || !study.id) return

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
    if (!isAuthenticated || !memberId) {
      toast({
        title: "로그인이 필요합니다",
        description: "답글을 작성하려면 로그인해주세요",
        variant: "destructive",
      })
      return
    }

    if (!study || !study.id) return

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

  const handleTabChange = async (value: string) => {
    if (value === "schedule" && params.id) {
      try {
        const schedulesDto = await fetchStudySchedulesByGroup(Number(params.id))
        const schedules: StudySession[] = schedulesDto
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .map((dto) => ({
            id: dto.id,
            title: dto.title,
            description: dto.description,
            startDate: dto.startTime,
            endDate: dto.endTime,
            location: dto.location,
            participants: [],
          }))
        setStudy((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            sessions: schedules,
          }
        })
      } catch (error) {
        toast({
          title: "스터디 일정 불러오기 실패",
          description: error instanceof Error ? error.message : "잠시 후 다시 시도해주세요",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-8">
      <div className="space-y-6">
        <StudyHeader
          study={study}
          memberStatus={study.memberStatus}
          onJoinStudy={handleJoinStudy}
          onShare={handleShare}
          onLeaveStudy={() => setShowLeaveDialog(true)}
        />
        <StudyInfo study={study} />
      </div>

      <Separator />

      <Tabs defaultValue="introduction" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="w-full justify-between">
          <TabsTrigger value="introduction" className="flex-1 text-center">
            스터디 소개
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-1 text-center">
            스터디 일정
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex-1 text-center">
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
          {study?.id && study.id && (
          <ParticipantList
            studyId={Number(study.id)}
            writerId={Number(study.writer)}
            groupLimit={study.groupLimit}
          />
        )}
        </TabsContent>
      </Tabs>

      {/* 스터디 나가기 확인 다이얼로그 */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>스터디에서 나가시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 스터디에서 나가시겠습니까? 나가면 다시 참여하려면 스터디장의 승인이 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveStudy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              나가기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
