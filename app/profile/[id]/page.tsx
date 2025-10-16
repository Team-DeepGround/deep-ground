"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Loader2
} from "lucide-react"

type ProfileData = {
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

export default function UserProfilePage() {
  const params = useParams()
  const profileId = Array.isArray(params.id) ? params.id[0] : params.id
  const { toast } = useToast()
  const { user } = useAuth()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [friendState, setFriendState] = useState<"none" | "pending">("none")
  const [friendLoading, setFriendLoading] = useState(false)

  const isMyProfile = useMemo(() => {
    // 로그인 유저의 profileId와 비교 (없으면 false)
    return String((user as any)?.profileId ?? "") === String(profileId ?? "")
  }, [user, profileId])

  useEffect(() => {
    let mounted = true
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/members/profile/${profileId}`)
        if (!mounted) return
        setProfile(res.result)
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
      <div className="max-w-5xl mx-auto">
        {/* ===== 헤더 섹션 ===== */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 mb-10">
          <Avatar className="h-28 w-28 md:h-36 md:w-36">
            <AvatarImage src={profile.profileImage || "/placeholder.svg"} alt={profile.nickname} />
            <AvatarFallback className="text-xl">{profile.nickname?.[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 w-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{profile.nickname}</h1>
                {profile.email && (
                  <p className="text-muted-foreground mt-2 text-lg">{profile.email}</p>
                )}
              </div>

              {/* 우측 버튼: 내 프로필이면 수정, 아니면 친구 요청 */}
              {isMyProfile ? (
                <Button asChild size="lg" className="whitespace-nowrap">
                  <Link href="/profile">
                    <span className="mr-2">✎</span> 프로필 수정
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
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

            {/* 자기소개 */}
            {profile.introduction && (
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                {profile.introduction}
              </p>
            )}

            {/* 아이콘 정보 줄 */}
            <div className="mt-5 space-y-2 text-muted-foreground">
              {profile.job && profile.company && (
                <p className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-base">{profile.job} at {profile.company}</span>
                </p>
              )}
              {profile.liveIn && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-base">{profile.liveIn}</span>
                </p>
              )}
              {profile.education && (
                <p className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-base">{profile.education}</span>
                </p>
              )}
            </div>

            {/* 기술 스택 */}
            {profile.techStack?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {profile.techStack.map((t, i) => (
                  <Badge key={`${t}-${i}`} variant="secondary" className="px-3 py-1.5 text-sm">
                    {t}
                  </Badge>
                ))}
              </div>
            )}

            {/* 소셜 링크 아이콘 */}
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
      </div>
    </div>
  )
}
