"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client"
import { StudyGroupDetail } from "@/types/study"
import { StudyHeader } from "@/components/studies/manage/StudyHeader"
import { StudySchedule } from "@/components/studies/manage/studySchedule/StudySchedule"
import { StudyMembers } from "@/components/studies/manage/StudyMembers"
import { StudyApplicants } from "@/components/studies/manage/StudyApplicants"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"

interface StudyMember {
  memberPublicId: string
  nickname: string
  joinedAt: string
  owner: boolean
}

interface Applicant {
  memberPublicId: string
  nickname: string
  joinedAt: null
  owner: false
}

export default function StudyManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // ✅ id 안전 추출
  const rawId = params?.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId

  const [study, setStudy] = useState<StudyGroupDetail | null>(null)
  const [members, setMembers] = useState<StudyMember[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ✅ 상세 페이지에 붙일 닉네임 우선순위:
  // 1) study 내 작성자/방장 닉네임 후보
  // 2) 현재 로그인 사용자 닉네임
  // 3) "user" (fallback)
  const detailNickname = useMemo(() => {
    const candidates = [
      (study as any)?.creatorNickname,
      (study as any)?.ownerNickname,
      (study as any)?.createdBy,
      user?.nickname,
    ].filter(Boolean) as string[]
    return candidates[0] ?? "user"
  }, [study, user?.nickname])

  const goDetail = () => {
    if (!id) return
    router.push(`/studies/${encodeURIComponent(detailNickname)}/${id}`)
  }

  useEffect(() => {
    if (!id) return

    const fetchStudyDetail = async () => {
      try {
        const response = await api.get(`/study-group/${id}`)
        if (response.status === 200 && response.result) {
          setStudy(response.result)
        }
      } catch (error) {
        // 필요 시 토스트
      }
    }

    const fetchMembers = async () => {
      try {
        const response = await api.get(`/study-group/${id}/members`)
        if (response.status === 200 && response.result) {
          setMembers(response.result)
        }
      } catch (error) {}
    }

    const fetchApplicants = async () => {
      try {
        const response = await api.get(`/study-group/${id}/applicants`)
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
  }, [id, toast])

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  if (!study) {
    return <div>스터디를 찾을 수 없습니다.</div>
  }

  const handleInviteMember = (email: string) => {
    toast({
      title: "초대 메일 발송 완료",
      description: `${email}로 스터디 초대 메일을 발송했습니다.`,
    })
  }

  const handleKickMember = async (memberPublicId: string): Promise<void> => {
    try {
      // optimistic update
      setMembers(prev => prev.filter(m => m.memberPublicId !== memberPublicId))
      await api.delete(`/study-group/${id}/kick/${memberPublicId}`)
      const response = await api.get(`/study-group/${id}/members`)
      setMembers(response.result)
      toast({ title: "멤버 강퇴", description: "멤버가 스터디에서 강퇴되었습니다." })
    } catch (error) {
      const response = await api.get(`/study-group/${id}/members`)
      setMembers(response.result)
      toast({
        title: "오류 발생",
        description: "멤버 강퇴에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async (memberPublicId: string) => {
    try {
      await api.post(`/study-group/${id}/accept/${memberPublicId}`)
      const response = await api.get(`/study-group/${id}/applicants`)
      setApplicants(response.result)
      toast({ title: "승인 완료", description: "참여 신청이 승인되었습니다." })
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "참여 신청 승인에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (memberPublicId: string) => {
    try {
      await api.delete(`/study-group/${id}/kick/${memberPublicId}`)
      const response = await api.get(`/study-group/${id}/applicants`)
      setApplicants(response.result)
      toast({ title: "거절 완료", description: "참여 신청이 거절되었습니다." })
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
        {/* 🔥 여기: 기존 공개페이지 보기 버튼 자리 -> 스터디 상세 보기 버튼 */}
        <div className="flex items-start justify-between mb-3 gap-4">
          <StudyHeader study={study} />
          <Button onClick={goDetail}>스터디 상세 보기</Button>
        </div>

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
