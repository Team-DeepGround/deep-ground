"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

export default function OAuth2RedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const accessToken = searchParams.get("accessToken")
    const refreshToken = searchParams.get("refreshToken")
    const email = searchParams.get("email")
    const nickname = searchParams.get("nickname")

    if (accessToken) {
      login(accessToken)
      toast.success(`${nickname || email}님, 소셜 로그인에 성공했습니다.`)
      router.replace("/") // 홈으로 이동
    } else {
      toast.error("소셜 로그인에 실패했습니다.")
      router.replace("/auth/login")
    }
  }, [searchParams, login, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span>로그인 처리 중...</span>
    </div>
  )
}
