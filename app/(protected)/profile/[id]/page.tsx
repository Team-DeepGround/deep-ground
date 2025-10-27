"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api-client"
import {
  Github,
  Globe,
  Linkedin,
  Twitter,
  Briefcase,
  MapPin,
  GraduationCap,
  Loader2,
  // --- 참고: 첫 번째 이미지의 아이콘들 ---
  // CalendarDays, // 날짜 아이콘 (lucide-react)
  // User,       // 유저 아이콘 (lucide-react)
} from "lucide-react"

type ProfileData = {
  memberId: number | string
  profileImage?: string
  nickname: string
  email?: string
  introduction?: string
  job?: string
  company?: string
  liveIn?: string
  education?: string
  techStack: string[]
  githubUrl?: string
  linkedInUrl?: string
  websiteUrl?: string
  twitterUrl?: string
}

type Study = {
  id: number | string
  title: string
  description?: string
  coverImage?: string // 이 필드는 더 이상 사용되지 않습니다.
  status?: "RECRUITING" | "ONGOING" | "DONE" | string
  // --- 참고 ---
  // date?: string      // (예: "2025. 10. 19.")
  // role?: string      // (예: "스터디장")
  // 위와 같은 데이터가 API 응답에 포함되어야
  // 첫 번째 이미지와 100% 동일하게 구현 가능합니다.
}

export default function UserProfilePage() {
  const params = useParams()
  const profileId = Array.isArray(params.id) ? params.id[0] : params.id
  const { toast } = useToast()
  const { user } = useAuth()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  const [friendState, setFriendState] = useState<"none" | "pending">("none")
  const [friendLoading, setFriendLoading] = useState(false)

  const [studies, setStudies] = useState<Study[]>([])
  const [studiesLoading, setStudiesLoading] = useState(true)

  const isMyProfile = useMemo(() => {
    return String((user as any)?.profileId ?? "") === String(profileId ?? "")
  }, [user, profileId])

  // 1) 프로필 로드 (profileId 기반)
  useEffect(() => {
    let mounted = true

    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/members/profile/${profileId}`)
        if (!mounted) return

        const p = res.result || {}
        setProfile({
          memberId: p.memberId ?? p.id ?? "",
          profileImage: p.profileImage,
          nickname: p.nickname,
          email: p.email,
          introduction: p.introduction ?? p.bio,
          job: p.job,
          company: p.company,
          liveIn: p.liveIn,
          education: p.education,
          techStack: p.techStack ?? [],
          githubUrl: p.githubUrl ?? p.links?.github,
          linkedInUrl: p.linkedInUrl ?? p.links?.linkedin,
          websiteUrl: p.websiteUrl ?? p.links?.website,
          twitterUrl: p.twitterUrl ?? p.links?.twitter,
        })
      } catch (err) {
        toast({
          title: "프로필 로드 실패",
          description: "프로필 정보를 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (profileId) fetchProfile()
    return () => { mounted = false }
  }, [profileId, toast])

  // 2) 멤버 스터디 로드 (memberId 기반)
  useEffect(() => {
    const fetchStudies = async () => {
      if (!profile?.memberId) return
      setStudiesLoading(true)
      try {
        const r = await api.get(`/members/${profile.memberId}/studies`).catch(() => null)

        const page =
          r?.result?.content ??
          r?.content ??
          []

        const mapped: Study[] = page.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.explanation, // (예: "스터디 그룹입니다" 또는 "2025. 10. 19. | 스터디장")
          coverImage: undefined,      // 커버 이미지는 사용하지 않음
          status: s.groupStatus,      // (예: "RECRUITING")
        }))

        setStudies(mapped)
      } catch {
        setStudies([])
      } finally {
        setStudiesLoading(false)
      }
    }

    fetchStudies()
  }, [profile?.memberId])

  const handleSendFriendRequest = async () => {
    if (!profile?.email) {
      toast({ title: "요청 불가", description: "이메일 정보가 없습니다.", variant: "destructive" })
      return
    }
    setFriendLoading(true)
    try {
      await api.post("/friends/request", { receiverEmail: profile.email })
      setFriendState("pending")
      toast({
        title: "친구 요청 완료",
        description: `${profile.nickname}님에게 친구 요청을 보냈어요.`,
      })
    } catch (e: any) {
      toast({
        title: "친구 요청 실패",
        description: e?.message ?? "요청 처리에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setFriendLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return <div className="container mx-auto px-4 py-16 text-center">프로필을 찾을 수 없어요.</div>
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* ===== 상단: 중앙 정렬 프로필 + 우상단 액션 버튼 ===== */}
        <div className="relative">
          {/* 우상단 버튼 */}
          <div className="absolute right-0 -top-2">
            {isMyProfile ? (
              <Button asChild size="sm" className="whitespace-nowrap">
                <Link href="/profile">
                  <span className="mr-1">✎</span> 프로필 수정
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSendFriendRequest}
                disabled={friendState === "pending" || friendLoading}
              >
                {friendLoading
                  ? "요청 중..."
                  : friendState === "pending"
                  ? "요청 완료"
                  : "친구 요청"}
              </Button>
            )}
          </div>

          {/* 중앙 콘텐츠 */}
          <div className="flex flex-col items-center text-center mb-10">
            <Avatar className="h-28 w-28 md:h-36 md:w-36">
              <AvatarImage src={profile.profileImage || "/placeholder.svg"} alt={profile.nickname} />
              <AvatarFallback className="text-xl">{profile.nickname?.[0]}</AvatarFallback>
            </Avatar>

            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">{profile.nickname}</h1>
            {profile.email && (
              <p className="text-muted-foreground mt-1 text-base md:text-lg">{profile.email}</p>
            )}

            <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
              {profile.introduction?.trim() || "자기 소개를 쓰세요 제발"}
            </p>

            {/* 작은 박스 3개: 직업/회사, 지역, 학력 */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {(profile.job || profile.company) && (
                <div className="px-4 py-1.5 border rounded-md text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{[profile.job, profile.company].filter(Boolean).join(" at ")}</span>
                </div>
              )}
              {profile.liveIn && (
                <div className="px-4 py-1.5 border rounded-md text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.liveIn}</span>
                </div>
              )}
              {profile.education && (
                <div className="px-4 py-1.5 border rounded-md text-sm flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{profile.education}</span>
                </div>
              )}
            </div>

            {/* 기술 스택 */}
            {profile.techStack?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {profile.techStack.map((t, i) => (
                  <Badge key={`${t}-${i}`} variant="secondary" className="px-3 py-1.5 text-sm">
                    {t}
                  </Badge>
                ))}
              </div>
            )}

            {/* 소셜 아이콘 */}
            <div className="flex gap-4 mt-6">
              {profile.githubUrl && (
                <Link href={profile.githubUrl} target="_blank" className="text-muted-foreground hover:text-foreground">
                  <Github className="h-5 w-5" />
                </Link>
              )}
              {profile.websiteUrl && (
                <Link href={profile.websiteUrl} target="_blank" className="text-muted-foreground hover:text-foreground">
                  <Globe className="h-5 w-5" />
                </Link>
              )}
              {profile.linkedInUrl && (
                <Link href={profile.linkedInUrl} target="_blank" className="text-muted-foreground hover:text-foreground">
                  <Linkedin className="h-5 w-5" />
                </Link>
              )}
              {profile.twitterUrl && (
                <Link href={profile.twitterUrl} target="_blank" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ===== 아래: 참여한 스터디 섹션 ===== */}
        <section className="mt-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">참여한 스터디</h2>

          {studiesLoading ? (
            <div className="py-10 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : studies.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-muted-foreground">
                참여한 스터디가 없습니다.
              </CardContent>
            </Card>
          ) : (
            // ==================================================
            // 여기가 수정된 부분입니다 (시작)
            // ==================================================
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studies.map((s) => (
                <Card key={s.id} className="overflow-hidden">
                  <Link
                    href={`/studies/${s.id}`}
                    className="block hover:bg-muted/50 transition-colors"
                  >
                    {/* 커버 이미지, CardHeader를 제거하고
                      하나의 CardContent를 flex 컨테이너로 사용합니다.
                    */}
                    <CardContent className="p-4 flex items-center justify-between">
                      {/* 왼쪽: 제목 + 설명 (메타데이터) */}
                      <div className="flex-1 overflow-hidden pr-4">
                        <p className="text-lg font-semibold truncate">
                          {s.title}
                        </p>
                        {/* [참고]
                          첫 번째 이미지는 여기에 날짜와 역할(스터디장)이 표시됩니다.
                          현재 코드에서는 s.description (API의 s.explanation)을 
                          대신 사용합니다.
                          
                          만약 날짜/역할 데이터를 따로 받아올 수 있다면,
                          아이콘과 함께 여기에 표시할 수 있습니다.
                        */}
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {s.description || "설명이 없습니다."}
                        </p>
                      </div>

                      {/* 오른쪽: 상태 배지 */}
                      <div className="flex-shrink-0">
                        {s.status === "RECRUITING" && (
                          <Badge variant="default">모집중</Badge>
                        )}
                        {s.status === "ONGOING" && (
                          <Badge variant="secondary">진행중</Badge>
                        )}
                        {s.status === "DONE" && (
                          <Badge variant="outline">종료</Badge>
                        )}
                        {/* RECRUITING 외의 상태가 '모집중'으로 표시되어야 하는 경우 대비 */}
                        {s.status && !["RECRUITING", "ONGOING", "DONE"].includes(s.status) && (
                          <Badge variant="default">{s.status}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
            // ==================================================
            // 여기가 수정된 부분입니다 (끝)
            // ==================================================
          )}
        </section>
      </div>
    </div>
  )
}