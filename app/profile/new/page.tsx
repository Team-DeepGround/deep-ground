"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ProfileForm from "@/components/profile-form"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/auth"
import { useAuth } from "@/components/auth-provider"   // ✅ 추가

export default function ProfileCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // ✅ 로그인 시 저장해둔 auth 컨텍스트 정보 사용
  const { email, nickname } = useAuth()

  // 프로필 생성 핸들러
  const handleCreateProfile = async (profileData: any, profileImage: File | null) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("profile", new Blob([JSON.stringify(profileData)], { type: "application/json" }))
      if (profileImage) formData.append("profileImage", profileImage)

      const token = await auth.getToken()

      const res = await fetch("/api/v1/members/profile/new", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // FormData이므로 Content-Type 생략
        body: formData,
      })
      const data = await res.json()

      if (res.ok) {
        toast({ title: "프로필 생성 완료", description: "프로필이 성공적으로 생성되었습니다." })
        router.replace("/profile")
      } else {
        toast({
          title: "프로필 생성 실패",
          description: data?.message || "오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">프로필 생성</h1>

      <ProfileForm
        // ✅ 닉네임/이메일을 초깃값으로 주입
        initialProfile={{
          nickname: nickname || "",
          email: email || "",
          bio: "",
          techStack: [],
          links: {},
          liveIn: "",
          jobTitle: "",
          company: "",
          education: "",
          profileImage: "", // 없으면 빈 값
        }}
        onSubmit={handleCreateProfile}
        loading={loading}
      />
    </div>
  )
}
