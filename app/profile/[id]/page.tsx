"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api-client"
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
  Edit,
  Briefcase,
  MapPin,
  GraduationCap,
  Users,
  ThumbsUp,
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

interface ProfileData {
  id: string;
  profileImage?: string;
  nickname: string;
  email: string;
  introduction?: string;
  job?: string;
  company?: string;
  liveIn?: string;
  education?: string;
  techStack: string[];
  githubUrl?: string;
  linkedInUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  isFriend?: boolean;
}

interface Activity {
  id: number;
  type: "study_join" | "question" | "study_create";
  title: string;
  content: string;
  date: string;
}

interface Study {
  id: number;
  title: string;
  description: string;
  members: number;
  maxMembers: number;
  dates: string;
  isOnline: boolean;
  tags: string[];
  location: string | null;
}

interface Question {
  id: number;
  title: string;
  commentCount: number;
  likeCount: number;
  date: string;
  isResolved: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  // Ensure 'id' is always a string, handling potential string array from params.
  const userIdFromParams = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = userIdFromParams as string; // Assert as string, as it's a required route param

  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [friendRequestSent, setFriendRequestSent] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState<ProfileData>({
    id: id,
    profileImage: "",
    nickname: "",
    email: "",
    introduction: "",
    job: "",
    company: "",
    liveIn: "",
    education: "",
    techStack: [],
    githubUrl: "",
    linkedInUrl: "",
    websiteUrl: "",
    twitterUrl: ""
  })
  const [techStackInput, setTechStackInput] = useState("")

  useEffect(() => {
    loadProfile()
  }, [id, user?.id])

  const loadProfile = async () => {
    try {
      let endpoint = '';
      if (user && String(user.id) === id) {
        endpoint = '/members/profile';
      } else {
        endpoint = `/members/${id}`;
      }
      const response = await api.get(endpoint)
      if (response?.result) {
        setProfile(response.result)
        setFormData(response.result)
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error)
      toast({
        title: "프로필 로드 실패",
        description: "프로필 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    if (profile) {
      setFormData(profile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)

    try {
      const response = await api.put('/members/profile', formData)
      
      if (response?.status === 0) {
        toast({
          title: "프로필 수정 완료",
          description: "프로필이 성공적으로 수정되었습니다.",
        })
        setProfile(response.result)
      } else {
        toast({
          title: "프로필 수정 실패",
          description: response?.message || "알 수 없는 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('프로필 수정 실패:', error)
      toast({
        title: "프로필 수정 실패",
        description: "프로필 수정 중 네트워크 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleTechStackAdd = () => {
    if (techStackInput.trim() && !formData.techStack.includes(techStackInput.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, techStackInput.trim()]
      }))
      setTechStackInput("")
    }
  }

  const handleTechStackRemove = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }))
  }

  const activities: Activity[] = [
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

  const joinedStudies: Study[] = [
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

  const questions: Question[] = [
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

  const handleSendFriendRequest = () => {
    setShowConfirmDialog(false)
    setFriendRequestSent(true)
    toast({
      title: "친구 요청 전송",
      description: `${profile?.nickname}님에게 친구 요청을 보냈습니다.`,
    })
  }

  const handleCancelFriendRequest = () => {
    setFriendRequestSent(false)
    toast({
      title: "친구 요청 취소",
      description: `${profile?.nickname}님에게 보낸 친구 요청을 취소했습니다.`,
    })
  }

  if (!profile) {
    return <div className="container mx-auto py-8 text-center">프로필 로드 중...</div>;
  }

  const isMyProfile = user && String(user.id) === id;

  const StudyCard = ({ study }: { study: Study }) => (
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

  const ActivityCard = ({ activity }: { activity: Activity }) => (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <h3 className="font-medium text-lg">{activity.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{activity.content}</p>
        <p className="text-xs text-muted-foreground mt-2">{new Date(activity.date).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );

  const QuestionCard = ({ question }: { question: Question }) => (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <h3 className="font-medium text-lg flex items-center">
          {question.title}
          {question.isResolved && <Badge variant="outline" className="ml-2">해결됨</Badge>}
        </h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <span className="flex items-center"><MessageSquare className="h-3.5 w-3.5 mr-1" /> {question.commentCount}</span>
          <span className="flex items-center"><ThumbsUp className="h-3.5 w-3.5 mr-1" /> {question.likeCount}</span>
          <span>{new Date(question.date).toLocaleDateString()}</span>
        </div>
        <Button size="sm" className="mt-4" onClick={() => router.push(`/questions/${question.id}`)}>
          자세히 보기
        </Button>
      </CardContent>
    </Card>
  );

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
            {isMyProfile && !isEditing && (
              <Button onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                프로필 수정
              </Button>
            )}
          </div>

          <TabsContent value="profile">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileImage">프로필 이미지 URL</Label>
                    <Input
                      id="profileImage"
                      value={formData.profileImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, profileImage: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input
                      id="nickname"
                      value={formData.nickname}
                      onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="introduction">자기소개</Label>
                    <Textarea
                      id="introduction"
                      value={formData.introduction}
                      onChange={(e) => setFormData(prev => ({ ...prev, introduction: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="job">직업</Label>
                    <Input
                      id="job"
                      value={formData.job}
                      onChange={(e) => setFormData(prev => ({ ...prev, job: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">회사</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="liveIn">거주지</Label>
                    <Input
                      id="liveIn"
                      value={formData.liveIn}
                      onChange={(e) => setFormData(prev => ({ ...prev, liveIn: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="education">학력</Label>
                    <Input
                      id="education"
                      value={formData.education}
                      onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>기술 스택</Label>
                    <div className="flex gap-2">
                      <Input
                        value={techStackInput}
                        onChange={(e) => setTechStackInput(e.target.value)}
                        placeholder="기술 스택 입력"
                      />
                      <Button type="button" onClick={handleTechStackAdd}>
                        추가
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.techStack.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <span>{tech}</span>
                          <button
                            type="button"
                            onClick={() => handleTechStackRemove(tech)}
                            className="ml-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedInUrl"
                      value={formData.linkedInUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedInUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="websiteUrl">개인 웹사이트 URL</Label>
                    <Input
                      id="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitterUrl">Twitter URL</Label>
                    <Input
                      id="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={false}>
                    프로필 저장
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={handleCancelEdit}>
                    취소
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.profileImage || "/placeholder.svg?height=96&width=96"} alt={profile.nickname} />
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
                      {!profile.isFriend && !friendRequestSent && !isMyProfile ? (
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
                        profile.isFriend && !isMyProfile && (
                          <Button variant="secondary" disabled>
                            <Check className="mr-2 h-4 w-4" />
                            친구
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-4">{profile.introduction}</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
                    {profile.job && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        {profile.job} {profile.company && `(${profile.company})`}
                      </p>
                    )}
                    {profile.liveIn && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {profile.liveIn}
                      </p>
                    )}
                    {profile.education && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        {profile.education}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.techStack.map((tech, index) => (
                      <Badge key={index} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-4">
                    {profile.githubUrl && (
                      <Link href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                          <Github className="h-5 w-5" />
                        </Button>
                      </Link>
                    )}
                    {profile.linkedInUrl && (
                      <Link href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                          <Linkedin className="h-5 w-5" />
                        </Button>
                      </Link>
                    )}
                    {profile.websiteUrl && (
                      <Link href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                          <Globe className="h-5 w-5" />
                        </Button>
                      </Link>
                    )}
                    {profile.twitterUrl && (
                      <Link href={profile.twitterUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                          <Twitter className="h-5 w-5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="studies">
            <h2 className="text-2xl font-bold mb-4">참여 중인 스터디</h2>
            {joinedStudies.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {joinedStudies.map((study) => (
                  <StudyCard key={study.id} study={study} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">참여 중인 스터디가 없습니다.</p>
            )}
          </TabsContent>

          <TabsContent value="questions">
            <h2 className="text-2xl font-bold mb-4">작성한 질문</h2>
            {questions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {questions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">작성한 질문이 없습니다.</p>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>친구 요청 확인</DialogTitle>
              <DialogDescription>
                {profile.nickname}님에게 친구 요청을 보내시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>취소</Button>
              <Button onClick={handleSendFriendRequest}>보내기</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
