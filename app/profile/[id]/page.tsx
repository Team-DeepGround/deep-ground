"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarIcon,
  MessageSquare,
  BookOpen,
  Github,
  Globe,
  Linkedin,
  Twitter,
  UserPlus,
  Check,
  X,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/lib/api-client"

export default function UserProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [friendRequestSent, setFriendRequestSent] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // 임시 프로필 데이터 - 실제로는 API에서 가져와야 함
  const [profile, setProfile] = useState({
    id: id,
    nickname: "개발자" + id,
    email: `user${id}@example.com`,
    bio: "풀스택 개발자입니다. React, Next.js, Node.js를 주로 사용합니다.",
    techStack: ["React", "Next.js", "Node.js", "TypeScript"],
    links: {
      github: "https://github.com/username",
      linkedin: "https://linkedin.com/in/username",
      website: "https://mywebsite.com",
      twitter: "https://twitter.com/username",
    },
    location: "서울특별시",
    jobTitle: "프론트엔드 개발자",
    company: "테크 스타트업",
    education: "컴퓨터공학 학사",
    isFriend: false,
  })

  // 사용자 활동 데이터
  const activities = [
    {
      id: 1,
      type: "study_join",
      title: "스터디 참여",
      content: "React와 Next.js 마스터하기 스터디에 참여했습니다.",
      date: "2023-05-10T09:30:00Z",
    },
    {
      id: 2,
      type: "question",
      title: "질문 작성",
      content: "Spring Security와 JWT 인증 구현 방법에 대해 질문했습니다.",
      date: "2023-05-08T14:20:00Z",
    },
    {
      id: 3,
      type: "study_create",
      title: "스터디 개설",
      content: "알고리즘 문제 풀이 스터디를 개설했습니다.",
      date: "2023-05-05T11:15:00Z",
    },
  ]

  // 참여 중인 스터디
  const joinedStudies = [
    {
      id: 1,
      title: "React와 Next.js 마스터하기",
      description: "React와 Next.js의 기본부터 고급 기능까지 함께 학습하는 스터디입니다.",
      members: 6,
      maxMembers: 8,
      dates: "2023.05.01 ~ 2023.06.30",
      isOnline: true,
      tags: ["React", "Next.js", "Frontend"],
      location: null,
    },
    {
      id: 3,
      title: "백엔드 개발자를 위한 Spring Boot",
      description: "Spring Boot를 활용한 백엔드 개발 스터디입니다.",
      members: 4,
      maxMembers: 6,
      dates: "2023.06.01 ~ 2023.08.31",
      isOnline: false,
      tags: ["Java", "Spring Boot", "Backend"],
      location: "서울 강남구",
    },
  ]

  // 작성한 질문
  const questions = [
    {
      id: 2,
      title: "Spring Security와 JWT 인증 구현 방법",
      commentCount: 5,
      likeCount: 7,
      date: "2023-05-08T14:20:00Z",
      isResolved: true,
    },
    {
      id: 5,
      title: "Next.js 13 App Router에서 데이터 페칭 방법",
      commentCount: 4,
      likeCount: 15,
      date: "2023-05-06T10:30:00Z",
      isResolved: false,
    },
  ]

  // 친구 요청 보내기
  const handleSendFriendRequest = async () => {
    try {
      const response = await api.post(`/friends/from-profile/${id}`)
      
      if (response?.status === 200) {
        setShowConfirmDialog(false)
        setFriendRequestSent(true)
        toast({
          title: "친구 요청 전송",
          description: response.message || `${profile.nickname}님에게 친구 요청을 보냈습니다.`,
        })
      }
    } catch (error) {
      console.error('친구 요청 실패:', error)
      toast({
        title: "요청 실패",
        description: "친구 요청 전송에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 친구 요청 취소
  const handleCancelFriendRequest = async () => {
    try {
      const response = await api.patch(`/friends/sent/${profile.id}/cancel`)
      
      if (response?.status === 200) {
        setFriendRequestSent(false)
        toast({
          title: "친구 요청 취소",
          description: response.message || `${profile.nickname}님에게 보낸 친구 요청을 취소했습니다.`,
        })
      }
    } catch (error) {
      console.error('친구 요청 취소 실패:', error)
      toast({
        title: "취소 실패",
        description: "친구 요청 취소에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  // 스터디 카드 컴포넌트
  const StudyCard = ({ study }) => (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg truncate">{study.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{study.description}</p>
          </div>
          <Badge variant={study.isOnline ? "default" : "outline"} className="whitespace-nowrap flex-shrink-0">
            {study.isOnline ? "온라인" : "오프라인"}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {study.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-muted-foreground flex items-center">
              <CalendarIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">{study.dates}</span>
            </p>
            <p className="text-sm text-muted-foreground flex items-center">
              <Users className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span>
                {study.members}/{study.maxMembers}명
              </span>
            </p>
            {study.location && (
              <p className="text-sm text-muted-foreground flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">{study.location}</span>
              </p>
            )}
          </div>
          <Button size="sm" className="flex-shrink-0" onClick={() => router.push(`/studies/${study.id}`)}>
            상세보기
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="profile">프로필</TabsTrigger>
              <TabsTrigger value="studies">스터디</TabsTrigger>
              <TabsTrigger value="questions">질문</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile">
            {/* 프로필 헤더 */}
            <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt={profile.nickname} />
                  <AvatarFallback>{profile.nickname[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.nickname}</h1>
                    <p className="text-muted-foreground">{profile.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/messages/${profile.id}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        메시지 보내기
                      </Link>
                    </Button>
                    {!profile.isFriend && !friendRequestSent ? (
                      <Button onClick={() => setShowConfirmDialog(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        친구 추가
                      </Button>
                    ) : friendRequestSent ? (
                      <Button variant="outline" onClick={handleCancelFriendRequest}>
                        <X className="mr-2 h-4 w-4" />
                        요청 취소
                      </Button>
                    ) : (
                      <Button variant="secondary" disabled>
                        <Check className="mr-2 h-4 w-4" />
                        친구 요청됨
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p>{profile.bio}</p>

                  {profile.jobTitle && profile.company && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {profile.jobTitle} at {profile.company}
                    </p>
                  )}

                  {profile.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </p>
                  )}

                  {profile.education && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {profile.education}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.techStack.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-6">
                  {profile.links.github && (
                    <Link
                      href={profile.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Github className="h-5 w-5" />
                    </Link>
                  )}
                  {profile.links.website && (
                    <Link
                      href={profile.links.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Globe className="h-5 w-5" />
                    </Link>
                  )}
                  {profile.links.linkedin && (
                    <Link
                      href={profile.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Link>
                  )}
                  {profile.links.twitter && (
                    <Link
                      href={profile.links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Twitter className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* 활동 내역 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="mt-1">
                        {activity.type === "study_join" || activity.type === "study_create" ? (
                          <BookOpen className="h-5 w-5 text-blue-500" />
                        ) : activity.type === "question" ? (
                          <MessageSquare className="h-5 w-5 text-green-500" />
                        ) : (
                          <CalendarIcon className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{activity.title}</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="studies" className="mt-6">
            <div className="space-y-6">
              {/* 참여 중인 스터디 */}
              <div>
                <h2 className="text-xl font-bold mb-4">참여 중인 스터디</h2>
                {joinedStudies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {joinedStudies.map((study) => (
                      <StudyCard key={study.id} study={study} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">아직 참여한 스터디가 없습니다.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>작성한 질문</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex justify-between">
                        <h3 className="font-medium">
                          <Link href={`/questions/${question.id}`} className="hover:underline">
                            {question.title}
                          </Link>
                        </h3>
                        <Badge variant={question.isResolved ? "success" : "outline"}>
                          {question.isResolved ? "해결됨" : "미해결"}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          {question.commentCount}
                        </span>
                        <span className="flex items-center">
                          <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                          {question.likeCount}
                        </span>
                        <span>{new Date(question.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 친구 요청 확인 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>친구 요청</DialogTitle>
            <DialogDescription>{profile.nickname}님에게 친구 요청을 보내시겠습니까?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              취소
            </Button>
            <Button onClick={handleSendFriendRequest}>요청 보내기</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Briefcase(props) {
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
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

function MapPin(props) {
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function GraduationCap(props) {
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
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  )
}

function Users(props) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ThumbsUp(props) {
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
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}
