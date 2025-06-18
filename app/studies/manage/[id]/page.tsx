"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, MapPin, Clock, FileText, ExternalLink, UserPlus, UserMinus, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api-client"

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
  comments: {
    commentId: number
    nickname: string
    content: string
    createdAt: string
    replies: {
      replyId: number
      nickname: string
      content: string
      createdAt: string
    }[]
  }[]
  offline: boolean
}

interface Participant {
  memberId: number
  nickname: string
  joinedAt: string | null
  owner: boolean
}

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

// 신청자 더미 데이터
const dummyApplicants = [
  {
    id: 1,
    name: "김철수",
    email: "kim@example.com",
    message: "React와 TypeScript에 관심이 많습니다. 함께 공부하고 싶습니다.",
    appliedAt: "2024-02-16T10:30:00",
    status: "pending"
  },
  {
    id: 2,
    name: "이영희",
    email: "lee@example.com",
    message: "프론트엔드 개발자로 일하고 있습니다. 실무 경험을 공유하고 싶습니다.",
    appliedAt: "2024-02-17T14:20:00",
    status: "pending"
  },
  {
    id: 3,
    name: "박지민",
    email: "park@example.com",
    message: "Next.js를 배우고 싶어서 신청했습니다. 열심히 참여하겠습니다.",
    appliedAt: "2024-02-18T09:15:00",
    status: "pending"
  }
]

// 더미 일정 데이터
const dummySchedules = [
  {
    id: 1,
    title: "React 기초 학습",
    date: "2024-03-01",
    time: "19:00",
    location: "온라인",
    description: "React의 기본 개념과 컴포넌트 구조에 대해 학습합니다.",
    participants: 5
  },
  {
    id: 2,
    title: "TypeScript 심화",
    date: "2024-03-08",
    time: "19:00",
    location: "온라인",
    description: "TypeScript의 고급 타입과 제네릭에 대해 학습합니다.",
    participants: 4
  },
  {
    id: 3,
    title: "프로젝트 기획 회의",
    date: "2024-03-15",
    time: "19:00",
    location: "온라인",
    description: "최종 프로젝트 주제 선정 및 역할 분담을 진행합니다.",
    participants: 6
  }
]

// 더미 참여자 데이터
const dummyParticipants = [
  {
    id: 1,
    name: "김철수",
    role: "스터디장",
    joinedAt: "2024-02-01",
    attendance: 8,
    contribution: "React 컴포넌트 구조 설계"
  },
  {
    id: 2,
    name: "이영희",
    role: "참여자",
    joinedAt: "2024-02-05",
    attendance: 7,
    contribution: "TypeScript 타입 시스템 정리"
  },
  {
    id: 3,
    name: "박지민",
    role: "참여자",
    joinedAt: "2024-02-10",
    attendance: 6,
    contribution: "프로젝트 기획서 작성"
  }
]

export default function StudyManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [inviteEmail, setInviteEmail] = useState("")
  const [kickMemberId, setKickMemberId] = useState<number | null>(null)
  const [showKickDialog, setShowKickDialog] = useState(false)
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

  const handleInviteMember = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast({
        title: "유효하지 않은 이메일",
        description: "유효한 이메일 주소를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 초대 로직 (실제로는 API 호출)
    toast({
      title: "초대 메일 발송 완료",
      description: `${inviteEmail}로 스터디 초대 메일을 발송했습니다.`,
    })
    setInviteEmail("")
  }

  const openKickDialog = (memberId: number) => {
    setKickMemberId(memberId)
    setShowKickDialog(true)
  }

  const handleKickMember = async () => {
    if (!kickMemberId) return

    try {
      await api.delete(`/study-group/${params.id}/kick/${kickMemberId}`)

      // 강퇴 후 목록 새로고침
      const response = await api.get(`/study-group/${params.id}/members`)
      setMembers(response.result)

      toast({
        title: "멤버 강퇴",
        description: "멤버가 스터디에서 강퇴되었습니다.",
      })

      setShowKickDialog(false)
      setKickMemberId(null)
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
        {/* 스터디 기본 정보 */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={study.offline ? "outline" : "default"}>
                  {study.offline ? "오프라인" : "온라인"}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{study.title}</h1>
              <p className="text-muted-foreground mt-2">{study.explanation}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href={`/studies/${study.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  공개 페이지 보기
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/studies/edit/${study.id}`}>
                  <Settings className="mr-2 h-4 w-4" />
                  스터디 설정
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-6">
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
        </div>

        {/* 스터디 관리 탭 */}
        <Tabs defaultValue="schedule">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">일정 관리</TabsTrigger>
            <TabsTrigger value="members">참여자 관리</TabsTrigger>
            <TabsTrigger value="applicants">신청자 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>일정 관리</CardTitle>
                  <CardDescription>스터디 일정을 관리하세요</CardDescription>
                </div>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  일정 추가
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dummySchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{schedule.title}</h3>
                          <Badge variant="outline">
                            {schedule.date} {schedule.time}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{schedule.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {schedule.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {schedule.participants}명 참여
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          상세보기
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          수정
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>참여자 관리</CardTitle>
                  <CardDescription>스터디 참여자를 관리하세요</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      멤버 초대
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>멤버 초대</DialogTitle>
                      <DialogDescription>
                        초대할 멤버의 이메일 주소를 입력하세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">이메일</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@email.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteEmail("")}>
                        취소
                      </Button>
                      <Button onClick={handleInviteMember}>
                        초대하기
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.memberId} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.nickname[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.nickname}</p>
                            {member.owner && <Badge variant="secondary">스터디장</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            참여일: {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/profile/${member.memberId}`}>프로필</Link>
                        </Button>
                        {!member.owner && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => openKickDialog(member.memberId)}
                          >
                            <UserMinus className="mr-1 h-4 w-4" />
                            강퇴
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applicants">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>신청자 관리</CardTitle>
                  <CardDescription>스터디 참여 신청을 관리하세요</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicants.length === 0 ? (
                    <p className="text-center text-muted-foreground">대기 중인 신청자가 없습니다.</p>
                  ) : (
                    applicants.map((applicant) => (
                      <div key={applicant.memberId} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{applicant.nickname[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{applicant.nickname}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(applicant.memberId)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            승인
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleReject(applicant.memberId)}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            거절
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 강퇴 확인 다이얼로그 */}
      <Dialog open={showKickDialog} onOpenChange={setShowKickDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>멤버 강퇴</DialogTitle>
            <DialogDescription>
              정말로 이 멤버를 스터디에서 강퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKickDialog(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleKickMember}>
              강퇴하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
