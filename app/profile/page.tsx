"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MessageSquare, PenSquare, BookOpen, Github, Globe, Linkedin, Twitter } from "lucide-react"
import ProfileForm from "@/components/profile-form"
import Link from "next/link"

export default function ProfilePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Add the following code to handle URL query parameters for tabs
  useEffect(() => {
    // Check for URL query parameters
    const searchParams = new URLSearchParams(window.location.search)
    const tabParam = searchParams.get("tab")

    // Set active tab based on URL parameter if it exists
    if (tabParam && ["profile", "settings", "security"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  // 프로필 정보 상태
  const [profile, setProfile] = useState({
    nickname: "개발자123",
    email: user?.email || "user@example.com",
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
      members: 6,
      maxMembers: 8,
      dates: "2023.05.01 ~ 2023.06.30",
      isOnline: true,
    },
    {
      id: 2,
      title: "알고리즘 문제 풀이 스터디",
      members: 8,
      maxMembers: 10,
      dates: "2023.05.15 ~ 2023.07.15",
      isOnline: true,
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

  // 프로필 업데이트 핸들러
  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile)
    setIsEditing(false)
    toast({
      title: "프로필 업데이트 성공",
      description: "프로필 정보가 성공적으로 업데이트되었습니다.",
    })
  }

  // 계정 설정 탭 렌더링
  const renderSettingsTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>계정 설정</CardTitle>
            <CardDescription>계정 정보를 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">이메일 주소</h3>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">{profile.email}</p>
                <Button variant="outline" size="sm">
                  변경
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">비밀번호</h3>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">********</p>
                <Button variant="outline" size="sm">
                  변경
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">계정 연동</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    <span>GitHub</span>
                  </div>
                  <Button variant="outline" size="sm">
                    연결
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-5 w-5" />
                    <span>LinkedIn</span>
                  </div>
                  <Button variant="outline" size="sm">
                    연결
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>알림 설정</CardTitle>
            <CardDescription>알림 수신 방식을 설정하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">이메일 알림</h3>
                <p className="text-sm text-muted-foreground">중요 알림을 이메일로 받습니다</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">스터디 알림</h3>
                <p className="text-sm text-muted-foreground">스터디 관련 알림을 받습니다</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">댓글 알림</h3>
                <p className="text-sm text-muted-foreground">내 게시물에 댓글이 달리면 알림을 받습니다</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">위험 영역</CardTitle>
            <CardDescription>계정 삭제와 관련된 작업입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => {
                toast({
                  title: "계정 삭제",
                  description: "계정 삭제 전 확인 이메일을 발송했습니다.",
                })
              }}
            >
              계정 삭제
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 보안 설정 탭 렌더링
  const renderSecurityTab = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>보안 설정</CardTitle>
            <CardDescription>계정 보안을 강화하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">2단계 인증</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">2단계 인증을 활성화하여 계정 보안을 강화하세요</p>
                  <p className="text-sm text-muted-foreground mt-1">현재 상태: 비활성화</p>
                </div>
                <Button variant="outline">설정</Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">로그인 기록</h3>
              <div className="space-y-3">
                <div className="p-3 border rounded-md">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Chrome on Windows</p>
                      <p className="text-sm text-muted-foreground">서울, 대한민국</p>
                    </div>
                    <p className="text-sm text-muted-foreground">2023년 5월 10일 14:30</p>
                  </div>
                  <Badge className="mt-2">현재 세션</Badge>
                </div>

                <div className="p-3 border rounded-md">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Safari on macOS</p>
                      <p className="text-sm text-muted-foreground">서울, 대한민국</p>
                    </div>
                    <p className="text-sm text-muted-foreground">2023년 5월 8일 09:15</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">연결된 기기</h3>
              <Button variant="outline" className="w-full">
                모든 기기에서 로그아웃
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>개인정보 보호</CardTitle>
            <CardDescription>개인정보 설정을 관리하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">프로필 공개 설정</h3>
                <p className="text-sm text-muted-foreground">프로필을 다른 사용자에게 공개합니다</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">활동 내역 공개</h3>
                <p className="text-sm text-muted-foreground">내 활동 내역을 다른 사용자에게 공개합니다</p>
              </div>
              <Switch checked={true} onCheckedChange={() => {}} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">이메일 주소 공개</h3>
                <p className="text-sm text-muted-foreground">이메일 주소를 다른 사용자에게 공개합니다</p>
              </div>
              <Switch checked={false} onCheckedChange={() => {}} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="profile">프로필</TabsTrigger>
              <TabsTrigger value="settings">계정 설정</TabsTrigger>
              <TabsTrigger value="security">보안</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>프로필 수정</CardTitle>
                  <CardDescription>프로필 정보를 수정하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm profile={profile} onSubmit={handleProfileUpdate} onCancel={() => setIsEditing(false)} />
                </CardContent>
              </Card>
            ) : (
              <>
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
                      <Button onClick={() => setIsEditing(true)}>
                        <PenSquare className="mr-2 h-4 w-4" />
                        프로필 수정
                      </Button>
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

                {/* 활동 및 콘텐츠 탭 */}
                <Tabs defaultValue="activity">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="activity">활동</TabsTrigger>
                    <TabsTrigger value="studies">스터디</TabsTrigger>
                    <TabsTrigger value="questions">질문</TabsTrigger>
                  </TabsList>

                  <TabsContent value="activity" className="mt-6">
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
                    <Card>
                      <CardHeader>
                        <CardTitle>참여 중인 스터디</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {joinedStudies.map((study) => (
                            <div
                              key={study.id}
                              className="flex justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                            >
                              <div>
                                <h3 className="font-medium">
                                  <Link href={`/studies/${study.id}`} className="hover:underline">
                                    {study.title}
                                  </Link>
                                </h3>
                                <div className="flex gap-4 mt-2">
                                  <p className="text-sm text-muted-foreground flex items-center">
                                    <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                    {study.dates}
                                  </p>
                                  <p className="text-sm text-muted-foreground flex items-center">
                                    <BookOpen className="h-3.5 w-3.5 mr-1" />
                                    {study.members}/{study.maxMembers}명
                                  </p>
                                </div>
                              </div>
                              <Badge variant={study.isOnline ? "default" : "outline"}>
                                {study.isOnline ? "온라인" : "오프라인"}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 text-center">
                          <Button asChild variant="outline">
                            <Link href="/studies">다른 스터디 찾기</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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

                        <div className="mt-6 text-center">
                          <Button asChild variant="outline">
                            <Link href="/questions/create">새 질문 작성하기</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </TabsContent>

          <TabsContent value="settings">{renderSettingsTab()}</TabsContent>

          <TabsContent value="security">{renderSecurityTab()}</TabsContent>
        </Tabs>
      </div>
    </div>
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

function Switch({ checked, onCheckedChange }) {
  return (
    <div
      className={`w-11 h-6 rounded-full p-1 cursor-pointer ${checked ? "bg-primary" : "bg-muted"}`}
      onClick={() => onCheckedChange(!checked)}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
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
