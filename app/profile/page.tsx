"use client"

import { format, parseISO } from "date-fns";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { api } from "@/lib/api-client"
import { fetchFeedSummaries, FetchFeedSummaryResponse } from "@/lib/api/feed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarIcon, 
  PenSquare, 
  Github, 
  Globe, 
  Linkedin, 
  Twitter,
  Loader2
} from "lucide-react"
import ProfileForm from "@/components/profile-form"
import Link from "next/link"
import { toast } from "sonner"
import { auth } from "@/lib/auth"

type InquiryStatus = "PENDING" | "IN_PROGRESS" | "ANSWERED" | "CLOSED"
interface MyInquiry {
  id: number
  title: string
  status: InquiryStatus
  createdAt: string
}

// StudyCard 컴포넌트에 맞는 타입 정의
interface StudyGroup {
  id: number;
  title: string;
  description: string;
  period: string;
  recruitmentPeriod: string;
  tags: { id: number; name: string }[];
  maxMembers: number;
  currentMembers: number;
  organizer: {
    name: string;
    avatar: string;
  };
  isOnline: boolean;
  location: string;
}

export default function ProfilePage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [createdStudies, setCreatedStudies] = useState([])
  const [joinedStudies, setJoinedStudies] = useState<StudyGroup[]>([])
  const [feeds, setFeeds] = useState<FetchFeedSummaryResponse[]>([])
  const [feedsLoading, setFeedsLoading] = useState(false)
  const [myInquiries, setMyInquiries] = useState<MyInquiry[]>([])
  const [myInquiriesLoading, setMyInquiriesLoading] = useState(false)

  // 프로필 정보 상태
  const [profile, setProfile] = useState({
    nickname: "",
    email: "",
    bio: "",
    techStack: [],
    links: {
      github: "",
      linkedin: "",
      website: "",
      twitter: "",
    },
    location: "",
    jobTitle: "",
    company: "",
    education: "",
    profileImage: "",
  })


  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        // 프로필 데이터
        // 프로필 데이터
        const profileResponse = await api.get("/members/profile/me")
        if (profileResponse && profileResponse.result) {
          const r = profileResponse.result
          setProfile({
            nickname: r.nickname ?? "",
            email: r.email ?? "",                          // ✅ 서버 DTO의 email 그대로 반영
            bio: r.bio ?? r.introduction ?? "",            // 서버/클라 키 차이 흡수
            techStack: r.techStack ?? [],
            links: {
              github: r.links?.github ?? r.githubUrl ?? "",
              linkedin: r.links?.linkedin ?? r.linkedInUrl ?? "",
              website: r.links?.website ?? r.websiteUrl ?? "",
              twitter: r.links?.twitter ?? r.twitterUrl ?? "",
            },
            location: r.location ?? r.liveIn ?? "",
            jobTitle: r.jobTitle ?? r.job ?? "",
            company: r.company ?? "",
            education: r.education ?? "",
            profileImage: r.profileImage ?? "",
          })
        }
        console.log(profileResponse.result)


        // 생성한 스터디
        const createdStudiesResponse = await api.get("/study-group/my")
        if (createdStudiesResponse && createdStudiesResponse.result) {
          setCreatedStudies(createdStudiesResponse.result)
        }

        // 참여중인 스터디
        const joinedStudiesResponse = await api.get("/study-group/joined")
        console.log("프로필 페이지 - 참여한 스터디 API 응답:", joinedStudiesResponse)
        if (joinedStudiesResponse && joinedStudiesResponse.result) {
          console.log("프로필 페이지 - 참여한 스터디 원본 데이터:", joinedStudiesResponse.result)
          // StudyCard 컴포넌트에 맞게 데이터 변환
          const formattedJoinedStudies = joinedStudiesResponse.result.map((study: any) => {
            console.log("프로필 페이지 - 개별 스터디 데이터:", study)
            const studyId = study.studyGroupId || study.id
            console.log("프로필 페이지 - 스터디 ID:", studyId)
            return {
              id: studyId,
              title: study.title || "제목 없음",
              description: study.description || study.explanation || "",
              period: study.period || "기간 정보 없음",
              recruitmentPeriod: study.recruitmentPeriod || "모집 기간 정보 없음",
              tags: study.tags || study.techStacks || [],
              maxMembers: study.maxMembers || study.groupLimit || 0,
              currentMembers: study.currentMembers || study.memberCount || 0,
              organizer: {
                name: study.organizer?.name || study.createdBy || "작성자 정보 없음",
                avatar: study.organizer?.avatar || "/placeholder-user.jpg"
              },
              isOnline: study.isOnline !== undefined ? study.isOnline : !study.offline,
              location: study.location || "장소 정보 없음"
            }
          }).filter(study => study.id && study.id !== undefined)
          console.log("프로필 페이지 - 최종 변환된 스터디 데이터:", formattedJoinedStudies)
          setJoinedStudies(formattedJoinedStudies)
        }
      } catch (error) {
        console.error("사용자 데이터 로딩 실패:", error)
        toast({
          title: "데이터 로딩 실패",
          description: "사용자 정보를 불러오는데 실패했습니다.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated ) {
      fetchUserData()
      loadFeeds()
      const loadMyInquiries = async () => {
        try {
          setMyInquiriesLoading(true)
          const res = await api.get("/support/inquiries/me")
          setMyInquiries(res.result ?? [])
        } catch (e: any) {
          // 실패해도 다른 섹션은 보여야 하므로 토스트만
          console.error("내 문의 목록 로드 실패:", e)
        } finally {
          setMyInquiriesLoading(false)
        }
      }
      loadMyInquiries()
    }
  }, [isAuthenticated])

  // 피드 목록 로드
  const loadFeeds = async () => {
    try {
      setFeedsLoading(true)
      const response = await fetchFeedSummaries({ page: 0, size: 20, sort: "createdAt,desc" })
      if (response.result?.feedSummaries) {
        setFeeds(response.result.feedSummaries)
      } else {
        setFeeds([])
      }
    } catch (error) {
      console.error('피드 목록 로드 실패:', error)
      toast({
        title: "피드 목록 로드 실패",
        description: "피드 목록을 불러오는데 실패했습니다.",
      })
    } finally {
      setFeedsLoading(false)
    }
  }
  // 화면용 상태 변환 함수
  const normalizeToUi = (r: any) => ({
    nickname: r.nickname ?? "",
    email: r.email ?? "",
    bio: r.bio ?? r.introduction ?? "",
    techStack: r.techStack ?? [],
    links: {
      github: r.links?.github ?? r.githubUrl ?? "",
      linkedin: r.links?.linkedin ?? r.linkedInUrl ?? "",
      website: r.links?.website ?? r.websiteUrl ?? "",
      twitter: r.links?.twitter ?? r.twitterUrl ?? "",
    },
    location: r.location ?? r.liveIn ?? "",
    jobTitle: r.jobTitle ?? r.job ?? "",
    company: r.company ?? "",
    education: r.education ?? "",
    profileImage: r.profileImage ?? "",
  });

  const handleProfileUpdate = async (updatedProfile: any, profileImage: File | null) => {
    const formData = new FormData();
    formData.append("profile", new Blob([JSON.stringify(updatedProfile)], { type: "application/json" }));
    if (profileImage) formData.append("profileImage", profileImage);

    const token = await auth.getToken();
    const response = await fetch("/api/v1/members/profile", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    let data: any = null;
    try { data = await response.json(); } catch {}

    if (!response.ok) {
      throw (data ?? { message: "요청에 실패했습니다.", status: response.status });
    }

    // ✅ 저장 후 바로 화면 상태로 변환해서 반영
    const next = data?.result ? normalizeToUi(data.result) : normalizeToUi(updatedProfile);
    setProfile(next);
    setIsEditing(false);

    toast({
      title: "프로필 업데이트 성공",
      description: "프로필 정보가 성공적으로 업데이트되었습니다.",
    });

    return data;
  };

  // 스터디 카드 컴포넌트 (tags 배지 완전 제거!)
  const StudyCard = ({ study, isCreated = false }) => (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{study.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{study.description}</p>
          </div>
          <Badge variant={study.isOnline ? "default" : "outline"}>{study.isOnline ? "온라인" : "오프라인"}</Badge>
        </div>
        {/* 태그 부분 삭제 */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground flex items-center">
              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
              {study.studyStartDate && study.studyEndDate
                ? `${format(parseISO(study.studyStartDate), "yyyy.MM.dd")} ~ ${format(parseISO(study.studyEndDate), "yyyy.MM.dd")}`
                : ""}
            </p>
            <p className="text-sm text-muted-foreground flex items-center">
              <Users className="h-3.5 w-3.5 mr-1" />
              {(study.currentMemberCount ?? 0)}/{(study.groupMemberCount ?? 0)}명
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (isCreated) {
                router.push(`/studies/manage/${study.id}`)
              } else {
                router.push(`/studies/${study.id}`)
              }
            }}
          >
            {isCreated ? "관리하기" : "상세보기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // 피드 카드 컴포넌트
  const FeedCard = ({ feed }: { feed: FetchFeedSummaryResponse }) => (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => router.push(`/feed/${feed.feedId}`)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">{feed.memberName}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(feed.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-line">
          {feed.content}
        </p>
        <Button size="sm" className="mt-3" onClick={(e) => {
          e.stopPropagation()
          router.push(`/feed/${feed.feedId}`)
        }}>
          상세보기
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="feeds">피드</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>프로필 수정</CardTitle>
                  <CardDescription>프로필 정보를 수정하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm
                    mode="edit"
                    nicknameVisible={true}
                    nicknameRequired={true}
                    nicknameCheckDup={true}
                    initialProfile={{
                      nickname: profile.nickname,
                      email: profile.email,
                      bio: profile.bio,
                      techStack: profile.techStack,
                      links: profile.links,
                      liveIn: profile.location,       // ✅ location → liveIn 매핑 유지
                      jobTitle: profile.jobTitle,
                      company: profile.company,
                      education: profile.education,
                      profileImage: profile.profileImage, // ✅ 미리보기용
                    }}
                    onSubmit={handleProfileUpdate}
                    onCancel={() => setIsEditing(false)}
                    // loading={loading} // 로딩 상태가 있다면 같이 넘겨주세요
                  />

                </CardContent>
              </Card>
            ) : (
              <>
                {/* 프로필 헤더 */}
                <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.profileImage || "/placeholder.svg"} alt={profile.nickname} />
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
                      {profile.links?.github && (
                        <Link
                          href={profile.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Github className="h-5 w-5" />
                        </Link>
                      )}
                      {profile.links?.website && (
                        <Link
                          href={profile.links.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Globe className="h-5 w-5" />
                        </Link>
                      )}
                      {profile.links?.linkedin && (
                        <Link
                          href={profile.links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Linkedin className="h-5 w-5" />
                        </Link>
                      )}
                      {profile.links?.twitter && (
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
                {/* 스터디 섹션 */}
                <div className="space-y-6">
                  {/* 내가 만든 스터디 */}
                  <div>
                    <h2 className="text-xl font-bold mb-4">내가 만든 스터디</h2>
                    {createdStudies.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {createdStudies.map((study) => (
                          <StudyCard key={study.id} study={study} isCreated={true} />
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-muted-foreground">아직 만든 스터디가 없습니다.</p>
                          <Button className="mt-4" asChild>
                            <Link href="/studies/create">스터디 개설하기</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  {/* 내가 참여한 스터디 */}
                  <div>
                    <h2 className="text-xl font-bold mb-4">내가 참여한 스터디</h2>
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
                          <Button className="mt-4" asChild>
                            <Link href="/studies">스터디 찾아보기</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <div className="flex justify-center mt-6">
                    <Button asChild variant="outline">
                      <Link href="/studies">다른 스터디 찾기</Link>
                    </Button>
                  </div>
                </div>
                {/* 내 문의 섹션 */}
                <div>
                  <h2 className="text-xl font-bold mb-4">내 문의</h2>
                  {myInquiriesLoading ? (
                    <div className="flex justify-center items-center min-h-[120px]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : myInquiries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myInquiries.map((q) => (
                        <Card key={q.id} className="hover:bg-accent/50 transition-colors cursor-pointer"
                              onClick={() => router.push(`/inquiries/${q.id}`)}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="font-medium line-clamp-2">{q.title}</div>
                              <Badge variant={
                                q.status === "PENDING" ? "outline"
                                : q.status === "IN_PROGRESS" ? "secondary"
                                : q.status === "ANSWERED" ? "default"
                                : "outline"
                              }>
                                {q.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {new Date(q.createdAt).toLocaleString()}
                            </div>
                            <Button size="sm" className="mt-3"
                              onClick={(e) => { e.stopPropagation(); router.push(`/inquiries/${q.id}`) }}>
                              상세보기
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">아직 등록한 문의가 없습니다.</p>
                        <Button className="mt-4" asChild>
                          <Link href="/inquiries">문의하러 가기</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

              </>
            )}
          </TabsContent>
          <TabsContent value="feeds">
            <h2 className="text-xl font-bold mb-4">내가 작성한 피드</h2>
            {feedsLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : feeds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feeds.map((feed) => (
                  <FeedCard key={feed.feedId} feed={feed} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">아직 작성한 피드가 없습니다.</p>
                  <Button className="mt-4" asChild>
                    <Link href="/feed">피드 작성하기</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
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
