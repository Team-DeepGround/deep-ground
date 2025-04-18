"use client"

import { useState } from "react"
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

export default function StudyManagePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [inviteEmail, setInviteEmail] = useState("")
  const [kickMemberId, setKickMemberId] = useState<number | null>(null)
  const [showKickDialog, setShowKickDialog] = useState(false)

  // 스터디 ID
  const studyId = params.id

  // 임시 스터디 데이터
  const study = {
    id: studyId,
    title: "알고리즘 문제 풀이 스터디",
    description: "매주 알고리즘 문제를 함께 풀고 리뷰하는 스터디입니다.",
    period: "2023.05.15 ~ 2023.07.15",
    recruitmentPeriod: "2023.04.20 ~ 2023.05.10",
    tags: ["Algorithm", "Data Structure", "Problem Solving"],
    maxMembers: 10,
    currentMembers: 8,
    organizer: {
      id: 101,
      name: "개발자123",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: true,
    location: null,
    schedule: [
      {
        id: 1,
        title: "그래프 알고리즘 기초",
        date: "2023-05-20",
        startTime: "19:00",
        endTime: "21:00",
        description: "BFS, DFS, 최단 경로 알고리즘에 대해 학습합니다.",
        location: "온라인 (Discord)",
      },
      {
        id: 2,
        title: "동적 프로그래밍",
        date: "2023-05-27",
        startTime: "19:00",
        endTime: "21:00",
        description: "DP 문제 풀이 전략에 대해 학습합니다.",
        location: "온라인 (Discord)",
      },
      {
        id: 3,
        title: "그리디 알고리즘",
        date: "2023-06-03",
        startTime: "19:00",
        endTime: "21:00",
        description: "그리디 알고리즘의 개념과 적용 사례를 학습합니다.",
        location: "온라인 (Discord)",
      },
    ],
    members: [
      {
        id: 101,
        name: "개발자123",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "organizer",
        joinDate: "2023-04-20T10:30:00Z",
      },
      {
        id: 102,
        name: "알고리즘마스터",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
        joinDate: "2023-04-21T14:20:00Z",
      },
      {
        id: 103,
        name: "코딩천재",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
        joinDate: "2023-04-22T09:15:00Z",
      },
      {
        id: 104,
        name: "자바스크립트러버",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
        joinDate: "2023-04-23T16:40:00Z",
      },
      {
        id: 105,
        name: "파이썬고수",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
        joinDate: "2023-04-25T11:30:00Z",
      },
      {
        id: 106,
        name: "씨샵개발자",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
        joinDate: "2023-04-26T13:20:00Z",
      },
      {
        id: 107,
        name: "자바개발자",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
        joinDate: "2023-04-28T10:10:00Z",
      },
      {
        id: 108,
        name: "코틀린러버",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
        joinDate: "2023-04-30T15:45:00Z",
      },
    ],
    resources: [
      {
        id: 1,
        title: "알고리즘 문제 풀이 사이트",
        type: "link",
        url: "https://leetcode.com/",
      },
      {
        id: 2,
        title: "알고리즘 개념 정리",
        type: "link",
        url: "https://www.geeksforgeeks.org/fundamentals-of-algorithms/",
      },
      {
        id: 3,
        title: "그래프 알고리즘 요약 자료",
        type: "file",
        url: "/placeholder.svg?height=400&width=600",
        fileType: "pdf",
        fileSize: "2.5MB",
      },
    ],
    discussions: [
      {
        id: 1,
        author: {
          id: 102,
          name: "알고리즘마스터",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "다음 모임에서는 어떤 문제를 풀어볼까요?",
        createdAt: "2023-05-10T14:30:00Z",
        replies: [
          {
            id: 101,
            author: {
              id: 101,
              name: "개발자123",
              avatar: "/placeholder.svg?height=40&width=40",
            },
            content: "LeetCode의 Medium 난이도 그래프 문제 몇 개를 선정해서 풀어보는 것이 어떨까요? 다들 의견 주세요!",
            createdAt: "2023-05-10T15:15:00Z",
          },
        ],
      },
      {
        id: 2,
        author: {
          id: 105,
          name: "파이썬고수",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "다음 모임에서 사용할 예제 코드를 미리 공유드립니다. 확인 부탁드려요!",
        createdAt: "2023-05-11T10:20:00Z",
        replies: [],
      },
    ],
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

  const handleKickMember = () => {
    if (!kickMemberId) return

    // 강퇴 로직 (실제로는 API 호출)
    const memberToKick = study.members.find((member) => member.id === kickMemberId)

    toast({
      title: "멤버 강퇴 완료",
      description: `${memberToKick?.name} 님을 스터디에서 강퇴했습니다.`,
    })

    setShowKickDialog(false)
    setKickMemberId(null)
  }

  const openKickDialog = (memberId: number) => {
    setKickMemberId(memberId)
    setShowKickDialog(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 스터디 기본 정보 */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={study.isOnline ? "default" : "outline"}>{study.isOnline ? "온라인" : "오프라인"}</Badge>
                {new Date(study.recruitmentPeriod.split(" ~ ")[1]) >= new Date() ? (
                  <Badge variant="secondary">모집 중</Badge>
                ) : (
                  <Badge variant="outline">모집 완료</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold">{study.title}</h1>
              <p className="text-muted-foreground mt-2">{study.description}</p>
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
              <span>{study.period}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>
                {study.currentMembers}/{study.maxMembers}명
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{study.location || "온라인"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {study.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* 스터디 관리 탭 */}
        <Tabs defaultValue="members">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">멤버 관리</TabsTrigger>
            <TabsTrigger value="schedule">일정 관리</TabsTrigger>
            <TabsTrigger value="resources">자료 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>멤버 관리</CardTitle>
                  <CardDescription>스터디 멤버를 관리하고 초대하세요</CardDescription>
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
                      <DialogTitle>스터디 멤버 초대</DialogTitle>
                      <DialogDescription>
                        초대할 멤버의 이메일 주소를 입력하세요. 초대 메일이 발송됩니다.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">이메일 주소</Label>
                        <Input
                          id="email"
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
                      <Button onClick={handleInviteMember}>초대하기</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {study.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name}</p>
                            {member.role === "organizer" && <Badge variant="secondary">스터디장</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            가입일: {new Date(member.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/profile/${member.id}`}>프로필</Link>
                        </Button>
                        {member.role !== "organizer" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => openKickDialog(member.id)}
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

          <TabsContent value="schedule" className="mt-6">
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
                <div className="space-y-6">
                  {study.schedule.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          {index + 1}
                        </div>
                        {index < study.schedule.length - 1 && <div className="w-0.5 h-full bg-muted mt-2"></div>}
                      </div>
                      <div className="flex-1">
                        <div className="bg-accent p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                수정
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                삭제
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {event.startTime} - {event.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <p className="mt-2 text-muted-foreground">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>자료 관리</CardTitle>
                  <CardDescription>스터디 자료를 관리하세요</CardDescription>
                </div>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  자료 추가
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {study.resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {resource.type === "link" ? (
                          <ExternalLink className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          {resource.type === "file" && (
                            <p className="text-xs text-muted-foreground">
                              {resource.fileType.toUpperCase()} • {resource.fileSize}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            {resource.type === "link" ? "방문하기" : "다운로드"}
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm">
                          수정
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          삭제
                        </Button>
                      </div>
                    </div>
                  ))}
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
