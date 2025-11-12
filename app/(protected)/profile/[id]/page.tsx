"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Calendar,
  Users,
} from "lucide-react"

type ProfileData = {
  publicId: string
  profileImage?: string
  nickname: string
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
  coverImage?: string
  status?: "RECRUITING" | "ONGOING" | "DONE" | string
  ownerNickname: string
  isOffline?: boolean
  studyStartDate?: string
  studyEndDate?: string
  groupMemberCount?: number
  currentMemberCount?: number
}

type FriendStateType = "none" | "pending" | "friends" | "received"

// 날짜 포맷 유틸: 2025-11-11 -> 2025.11.11
function formatDate(d?: string) {
  if (!d) return ""
  try {
    const [y, m, day] = d.split("-").map(Number)
    return `${y}.${String(m).padStart(2, "0")}.${String(day).padStart(2, "0")}`
  } catch {
    return d
  }
}

export default function UserProfilePage() {
  const params = useParams()
  const profileId = Array.isArray(params.id) ? params.id[0] : params.id
  const { toast } = useToast()
  const { user } = useAuth()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  const [friendState, setFriendState] = useState<FriendStateType>("none")
  const [friendLoading, setFriendLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)

  const [studies, setStudies] = useState<Study[]>([])
  const [studiesLoading, setStudiesLoading] = useState(true)

  const isMyProfile = useMemo(() => user?.publicId === profileId, [user, profileId])

  // 1) 프로필 로드
  useEffect(() => {
    let mounted = true

    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/members/profile/${profileId}`)
        if (!mounted) return
        const p = res.result || res || {}

        setProfile({
          publicId: p.publicId ?? p.id ?? "",
          profileImage: p.profileImage,
          nickname: p.nickname,
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
      } catch (err: any) {
        toast({
          title: "프로필 로드 실패",
          description: err?.message ?? "프로필 정보를 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (profileId) fetchProfile()
    return () => { mounted = false }
  }, [profileId, toast])

  // 2) 멤버 스터디 로드
  useEffect(() => {
    const fetchStudies = async () => {
      if (!profile?.publicId) return
      setStudiesLoading(true)
      try {
        const r = await api.get(`/members/${profile.publicId}/studies`).catch(() => null)
        const page = r?.result?.content ?? r?.content ?? r ?? []

        const mapped: Study[] = page.map((s: any) => ({
          id: s.id,
          title: String(s.title ?? "").trim(),
          description: s.explanation,
          coverImage: undefined,
          status: s.groupStatus,
          ownerNickname: s.ownerNickname,
          isOffline: s.isOffline,
          studyStartDate: s.studyStartDate,
          studyEndDate: s.studyEndDate,
          groupMemberCount: s.groupMemberCount,
          currentMemberCount: s.currentMemberCount,
        }))

        setStudies(mapped)
      } catch {
        setStudies([])
      } finally {
        setStudiesLoading(false)
      }
    }

    fetchStudies()
  }, [profile?.publicId])

  // 3) 친구 상태 확인
  useEffect(() => {
    if (!profile?.publicId || isMyProfile) {
      setStatusLoading(false)
      return
    }

    const checkFriendStatus = async () => {
      setStatusLoading(true)
      try {
        const res = await api
          .get(`/friends/status`, { params: { targetMemberPublicId: String(profile.publicId) } })
          .catch(() => null)

        const status = res?.result?.status || "NONE"
        if (status === "FRIENDS") setFriendState("friends")
        else if (status === "PENDING_SENT") setFriendState("pending")
        else if (status === "PENDING_RECEIVED") setFriendState("received")
        else setFriendState("none")
      } catch {
        setFriendState("none")
      } finally {
        setStatusLoading(false)
      }
    }

    checkFriendStatus()
  }, [profile?.publicId, isMyProfile])

  // 4) 친구 요청
  const handleSendFriendRequest = async () => {
    if (!profile?.publicId) {
      toast({ title: "요청 불가", description: "프로필 ID가 없습니다.", variant: "destructive" })
      return
    }
    setFriendLoading(true)
    try {
      await api.post(`/friends/from-profile/${profile.publicId}`)
      setFriendState("pending")
      toast({ title: "친구 요청 완료", description: `${profile.nickname}님에게 친구 요청을 보냈어요.` })
    } catch (e: any) {
      toast({ title: "친구 요청 실패", description: e?.message ?? "요청 처리에 실패했습니다.", variant: "destructive" })
    } finally {
      setFriendLoading(false)
    }
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  // 프로필 없음
  if (!profile) {
    return <div className="container mx-auto px-4 py-16 text-center">프로필을 찾을 수 없어요.</div>
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* ===== 상단: 프로필 헤더 ===== */}
        <div className="relative">
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
                disabled={
                  statusLoading ||
                  friendLoading ||
                  friendState === "pending" ||
                  friendState === "friends" ||
                  friendState === "received"
                }
              >
                {statusLoading
                  ? "확인 중..."
                  : friendLoading
                  ? "요청 중..."
                  : friendState === "friends"
                  ? "친구"
                  : friendState === "pending"
                  ? "요청 완료"
                  : friendState === "received"
                  ? "요청 받음"
                  : "친구 요청"}
              </Button>
            )}
          </div>

          <div className="flex flex-col items-center text-center mb-10">
            <Avatar className="h-28 w-28 md:h-36 md:w-36">
              <AvatarImage src={profile.profileImage || "/placeholder.svg"} alt={profile.nickname} />
              <AvatarFallback className="text-xl">{profile.nickname?.[0]}</AvatarFallback>
            </Avatar>

            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">{profile.nickname}</h1>

            <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
              {profile.introduction?.trim() || "자기 소개를 쓰세요 제발"}
            </p>

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

            {profile.techStack?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {profile.techStack.map((t, i) => (
                  <Badge key={`${t}-${i}`} variant="secondary" className="px-3 py-1.5 text-sm">
                    {t}
                  </Badge>
                ))}
              </div>
            )}

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

        {/* ===== 참여한 스터디 ===== */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studies.map((s) => (
                <Card key={s.id} className="overflow-hidden">
                    <div className="relative">
                        {/* 우상단 뱃지들 */}
                        <div className="absolute right-3 top-3 flex items-center gap-2">
                        <Badge variant="default">{s.isOffline ? "오프라인" : "온라인"}</Badge>
                        {s.status === "RECRUITING" && <Badge variant="default">모집중</Badge>}
                        {s.status === "ONGOING" && <Badge variant="secondary">진행중</Badge>}
                        {s.status === "DONE" && <Badge variant="outline">종료</Badge>}
                        {s.status && !["RECRUITING", "ONGOING", "DONE"].includes(s.status) && (
                            <Badge variant="default">{s.status}</Badge>
                        )}
                        </div>

                        <CardContent className="p-4">
                        {/* 상단: 제목만 */}
                        <p className="text-lg font-semibold pr-28 truncate">{s.title}</p>

                        {/* 하단: 기간/인원 + 상세보기 버튼 (오른쪽 정렬) */}
                        <div className="mt-3 flex items-center justify-end gap-3">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {(s.studyStartDate || s.studyEndDate) && (
                                <span className="inline-flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(s.studyStartDate)} ~ {formatDate(s.studyEndDate)}
                                </span>
                            )}
                            {(s.currentMemberCount != null || s.groupMemberCount != null) && (
                                <span className="inline-flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {s.currentMemberCount ?? 0}/{s.groupMemberCount ?? 0}명
                                </span>
                            )}
                            </div>

                            <Button asChild size="sm" variant="default" className="shrink-0">
                            <Link href={`/studies/${encodeURIComponent(s.ownerNickname)}/${s.id}`}>
                                상세보기
                            </Link>
                            </Button>
                        </div>
                        </CardContent>
                    </div>
                    </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
