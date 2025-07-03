"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ProfileForm from "@/components/profile-form"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/auth"

export default function ProfileCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // 프로필 생성 핸들러
  const handleCreateProfile = async (profileData, profileImage) => {
  setLoading(true)
  try {

    console.log('profileData:', profileData);
    const formData = new FormData()
    formData.append(
      "profile",
      new Blob([JSON.stringify(profileData)], { type: "application/json" })
    )
    if (profileImage) formData.append("profileImage", profileImage)

    // 토큰을 비동기로 받아오기
    const token = await auth.getToken();

    const res = await fetch("/api/v1/members/profile/new", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Content-Type은 FormData 사용 시 생략!
      },
      body: formData,
    })
    const data = await res.json()
    if (res.ok) {
      toast({ title: "프로필 생성 완료", description: "프로필이 성공적으로 생성되었습니다." })
      router.replace("/profile")
    } else {
      toast({
        title: "프로필 생성 실패",
        description: data.message || "오류가 발생했습니다.",
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
      <ProfileForm onSubmit={handleCreateProfile} loading={loading} />
    </div>
  )
}
