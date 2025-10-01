"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
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
} from "lucide-react"
import Link from "next/link"

interface ProfileData {
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

export default function UserProfilePage() {
  const params = useParams()
  const profileId = Array.isArray(params.id) ? params.id[0] : params.id
  const { toast } = useToast()
  const { user } = useAuth()

  const [profile, setProfile] = useState<ProfileData | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/members/profile/${profileId}`)
        console.log("🔥 프로필 응답:", response.result)
        setProfile(response.result)
      } catch (error) {
        toast({
          title: "프로필 로드 실패",
          description: "프로필 정보를 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      }
    }

    fetchProfile()
  }, [profileId, toast])

  if (!profile) {
    return <div className="container mx-auto py-8 text-center">프로필 로드 중...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 프로필 헤더 */}
        <div className="flex flex-col md:flex-row gap-6 items-start mb-12">
          <Avatar className="h-28 w-28">
            <AvatarImage src={profile.profileImage || "/placeholder.svg?height=112&width=112"} alt={profile.nickname} />
            <AvatarFallback>{profile.nickname[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-4xl font-extrabold">{profile.nickname}</h1>
          </div>
        </div>

        {/* 자기소개 */}
        {profile.introduction && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-2">자기소개</h2>
            <p className="text-base whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {profile.introduction}
            </p>
          </section>
        )}

        {/* 기본 정보 */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">기본 정보</h2>
          <ul className="text-base text-muted-foreground space-y-2">
            {profile.job && (
              <li>
                <strong className="text-foreground mr-2">직업:</strong>
                {profile.job}
              </li>
            )}
            {profile.company && (
              <li>
                <strong className="text-foreground mr-2">회사:</strong>
                {profile.company}
              </li>
            )}
            {profile.liveIn && (
              <li>
                <strong className="text-foreground mr-2">사는 지역:</strong>
                {profile.liveIn}
              </li>
            )}
            {profile.education && (
              <li>
                <strong className="text-foreground mr-2">학력:</strong>
                {profile.education}
              </li>
            )}
          </ul>
        </section>

        {/* 기술 스택 */}
        {profile.techStack.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-2">기술 스택</h2>
            <div className="flex flex-wrap gap-3">
              {profile.techStack.map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-sm px-3 py-1.5">
                  {tech}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* URL / 포트폴리오 */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">소셜 및 포트폴리오</h2>
          <ul className="text-sm space-y-2">
            {profile.githubUrl && (
              <li className="flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                <Link
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {profile.githubUrl}
                </Link>
              </li>
            )}
            {profile.linkedInUrl && (
              <li className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                <Link
                  href={profile.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {profile.linkedInUrl}
                </Link>
              </li>
            )}
            {profile.websiteUrl && (
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Link
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {profile.websiteUrl}
                </Link>
              </li>
            )}
            {profile.twitterUrl && (
              <li className="flex items-center gap-2">
                <Twitter className="h-4 w-4 text-muted-foreground" />
                <Link
                  href={profile.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {profile.twitterUrl}
                </Link>
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}
