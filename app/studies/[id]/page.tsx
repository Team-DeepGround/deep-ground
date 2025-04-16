"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, MapPin, Clock, FileText, ExternalLink } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function StudyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isJoined, setIsJoined] = useState(false)

  // 스터디 ID
  const studyId = params.id

  // 임시 스터디 데이터
  const study = {
    id: studyId,
    title: "React와 Next.js 마스터하기",
    description:
      "React와 Next.js의 기본부터 고급 기능까지 함께 학습하는 스터디입니다. 서버 컴포넌트, App Router, 상태 관리 등 실무에 필요한 내용을 다룹니다.",
    longDescription:
      "이 스터디는 React와 Next.js를 실무에서 활용할 수 있는 수준으로 마스터하는 것을 목표로 합니다. 기본적인 컴포넌트 작성부터 시작하여 고급 패턴, 성능 최적화, 테스트 등을 다룹니다. 특히 Next.js 13의 App Router와 서버 컴포넌트 같은 최신 기능을 중점적으로 살펴보고, 실제 프로젝트에 적용해볼 것입니다. 함께 성장하고 싶은 개발자분들의 많은 참여 바랍니다.",
    period: "2023.05.01 ~ 2023.06.30",
    recruitmentPeriod: "2023.04.15 ~ 2023.04.30",
    tags: ["React", "Next.js", "TypeScript", "Frontend"],
    maxMembers: 8,
    currentMembers: 6,
    organizer: {
      id: 101,
      name: "김개발",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: true,
    location: "온라인 (Discord)",
    schedule: [
      {
        id: 1,
        title: "React 훅스와 상태 관리",
        date: "2023-05-15",
        startTime: "19:00",
        endTime: "21:00",
        description: "React 훅스와 상태 관리에 대해 논의합니다.",
        location: "온라인 (Discord)",
      },
      {
        id: 2,
        title: "Next.js 서버 컴포넌트",
        date: "2023-05-22",
        startTime: "19:00",
        endTime: "21:00",
        description: "Next.js 13의 서버 컴포넌트에 대해 학습합니다.",
        location: "온라인 (Discord)",
      },
      {
        id: 3,
        title: "Next.js 데이터 페칭",
        date: "2023-05-29",
        startTime: "19:00",
        endTime: "21:00",
        description: "Next.js의 데이터 페칭 방법에 대해 학습합니다.",
        location: "온라인 (Discord)",
      },
    ],
    members: [
      {
        id: 101,
        name: "김개발",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "organizer",
      },
      {
        id: 102,
        name: "이리액트",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: 103,
        name: "박넥스트",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: 104,
        name: "최타입",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: 105,
        name: "정프론트",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
      {
        id: 106,
        name: "한코딩",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
      },
    ],
    resources: [
      {
        id: 1,
        title: "React 공식 문서",
        type: "link",
        url: "https://reactjs.org/docs/getting-started.html",
      },
      {
        id: 2,
        title: "Next.js 공식 문서",
        type: "link",
        url: "https://nextjs.org/docs",
      },
      {
        id: 3,
        title: "React 훅스 요약 자료",
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
          name: "이리액트",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "서버 컴포넌트와 클라이언트 컴포넌트의 구분은 어떻게 하나요?",
        createdAt: "2023-05-10T14:30:00Z",
        replies: [
          {
            id: 101,
            author: {
              id: 101,
              name: "김개발",
              avatar: "/placeholder.svg?height=40&width=40",
            },
            content:
              "기본적으로 App Router에서는 모든 컴포넌트가 서버 컴포넌트입니다. 'use client' 지시어를 사용하면 클라이언트 컴포넌트가 됩니다. 자세한 내용은 다음 모임에서 다룰 예정입니다!",
            createdAt: "2023-05-10T15:15:00Z",
          },
        ],
      },
      {
        id: 2,
        author: {
          id: 105,
          name: "정프론트",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content: "다음 모임에서 사용할 예제 코드를 미리 공유드립니다. 확인 부탁드려요!",
        createdAt: "2023-05-11T10:20:00Z",
        replies: [],
      },
    ],
  }

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

  const handleShare = () => {
    // 공유 기능
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "링크 복사 완료",
      description: "스터디 링크가 클립보드에 복사되었습니다.",
    })
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
              <Button variant="outline" onClick={handleShare}>
                공유하기
              </Button>
              <Button onClick={handleJoinStudy} disabled={study.currentMembers >= study.maxMembers && !isJoined}>
                {isJoined ? "탈퇴하기" : "참여하기"}
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
              <span>{study.location}</span>
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
                <CardDescription>스터디의 목표와 내용을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <p className="whitespace-pre-line">{study.longDescription}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">모집 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">모집 기간</p>
                      <p>{study.recruitmentPeriod}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">스터디 기간</p>
                      <p>{study.period}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">모집 인원</p>
                      <p>{study.maxMembers}명</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">스터디 장소</p>
                      <p>{study.location}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">스터디장</h3>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={study.organizer.avatar || "/placeholder.svg"} alt={study.organizer.name} />
                      <AvatarFallback>{study.organizer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{study.organizer.name}</p>
                      <Button variant="link" className="h-auto p-0" asChild>
                        <Link href={`/profile/${study.organizer.id}`}>프로필 보기</Link>
                      </Button>
                    </div>
                  </div>
                </div>
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
                    {study.discussions.map((discussion) => (
                      <div key={discussion.id} className="space-y-4">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={discussion.author.avatar || "/placeholder.svg"}
                              alt={discussion.author.name}
                            />
                            <AvatarFallback>{discussion.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium">{discussion.author.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(discussion.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="mt-1">{discussion.content}</p>

                            {/* 댓글 */}
                            {discussion.replies.length > 0 && (
                              <div className="mt-4 space-y-3 pl-6 border-l-2">
                                {discussion.replies.map((reply) => (
                                  <div key={reply.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={reply.author.avatar || "/placeholder.svg"}
                                        alt={reply.author.name}
                                      />
                                      <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <p className="font-medium">{reply.author.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(reply.createdAt).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <p className="mt-1 text-sm">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <Button variant="ghost" size="sm" className="mt-2">
                              답글 달기
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="w-full">
                    <textarea
                      className="w-full border rounded-md p-3 min-h-[100px] resize-none"
                      placeholder="질문이나 의견을 작성해주세요..."
                    />
                    <div className="flex justify-end mt-3">
                      <Button>작성하기</Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>스터디 일정</CardTitle>
                <CardDescription>예정된 모임 일정을 확인하세요</CardDescription>
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
                          <h3 className="font-semibold text-lg">{event.title}</h3>
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

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  참여자 ({study.currentMembers}/{study.maxMembers})
                </CardTitle>
                <CardDescription>스터디에 참여 중인 멤버를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {study.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name}</p>
                          {member.role === "organizer" && <Badge variant="secondary">스터디장</Badge>}
                        </div>
                        <Button variant="link" className="h-auto p-0" asChild>
                          <Link href={`/profile/${member.id}`}>프로필 보기</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>학습 자료</CardTitle>
                <CardDescription>스터디에서 사용하는 자료를 확인하세요</CardDescription>
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
                      <Button variant="outline" size="sm" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.type === "link" ? "방문하기" : "다운로드"}
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  스터디장이 등록한 자료만 표시됩니다. 자료를 추가해주세요.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
