"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client"
import { StudyGroupDetail } from "@/types/study"
import { StudyHeader } from "@/components/studies/manage/StudyHeader"
import { StudySchedule } from "@/components/studies/manage/studySchedule/StudySchedule"
import { StudyMembers } from "@/components/studies/manage/StudyMembers"
import { StudyApplicants } from "@/components/studies/manage/StudyApplicants"

interface StudyMember {
  memberId: number
  nickname: string
  joinedAt: string
  owner: boolean
}

interface Applicant {
  memberId: number
  nickname: string
  joinedAt: null
  owner: false
}

export default function StudyManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [study, setStudy] = useState<StudyGroupDetail | null>(null)
  const [members, setMembers] = useState<StudyMember[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStudyDetail = async () => {
      try {
        const response = await api.get(`/study-group/${params.id}`)
        if (response.status === 200 && response.result) {
          setStudy(response.result)
        }
      } catch (error) {
        console.error("Failed to fetch study detail:", error)
      }
    }

    const fetchMembers = async () => {
      try {
        const response = await api.get(`/study-group/${params.id}/members`)
        if (response.status === 200 && response.result) {
          setMembers(response.result)
        }
      } catch (error) {
        console.error("Failed to fetch members:", error)
      }
    }

    const fetchApplicants = async () => {
      try {
        const response = await api.get(`/study-group/${params.id}/applicants`)
        setApplicants(response.result)
      } catch (error) {
        toast({
          title: "오류 발생",
          description: "신청자 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudyDetail()
    fetchMembers()
    fetchApplicants()
  }, [params.id, toast])

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  if (!study) {
    return <div>스터디를 찾을 수 없습니다.</div>
  }

  const handleInviteMember = (email: string) => {
    // 초대 로직 (실제로는 API 호출)
    toast({
      title: "초대 메일 발송 완료",
      description: `${email}로 스터디 초대 메일을 발송했습니다.`,
    })
  }

  const handleKickMember = async (memberId: number) => {
    try {
      await api.delete(`/study-group/${params.id}/kick/${memberId}`)

      // 강퇴 후 목록 새로고침
      const response = await api.get(`/study-group/${params.id}/members`)
      setMembers(response.result)

      toast({
        title: "멤버 강퇴",
        description: "멤버가 스터디에서 강퇴되었습니다.",
      })
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "멤버 강퇴에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async (memberId: number) => {
    try {
      await api.post(`/study-group/${params.id}/accept/${memberId}`)
      // 승인 후 목록 새로고침
      const response = await api.get(`/study-group/${params.id}/applicants`)
      setApplicants(response.result)
      toast({
        title: "승인 완료",
        description: "참여 신청이 승인되었습니다.",
      })
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "참여 신청 승인에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (memberId: number) => {
    try {
      await api.delete(`/study-group/${params.id}/kick/${memberId}`)
      // 거절 후 목록 새로고침
      const response = await api.get(`/study-group/${params.id}/applicants`)
      setApplicants(response.result)
      toast({
        title: "거절 완료",
        description: "참여 신청이 거절되었습니다.",
      })
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "참여 신청 거절에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <StudyHeader study={study} />

        <Tabs defaultValue="schedule">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">일정 관리</TabsTrigger>
            <TabsTrigger value="members">참여자 관리</TabsTrigger>
            <TabsTrigger value="applicants">신청자 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <StudySchedule />
          </TabsContent>

          <TabsContent value="members">
            <StudyMembers
              members={members}
              onInviteMember={handleInviteMember}
              onKickMember={handleKickMember}
            />
          </TabsContent>

          <TabsContent value="applicants">
            <StudyApplicants
              applicants={applicants}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
