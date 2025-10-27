// components/guards/require-profile.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { api } from "@/lib/api-client"
import { auth } from "@/lib/auth"

// 로그인 여부와 무관하게 항상 허용(정적/생성/인증)
const ALWAYS_ALLOW = [
  /^\/profile\/create(\/|$)/,
  /^\/auth\/(login|register|forgot-password|verify-email|reset-password)(\/|$)/,
]

// 게스트도 볼 수 있는 공개 페이지(로그인 전에는 허용, 로그인 후엔 '프로필 없으면' 막음)
const PUBLIC_GUEST = [
  /^\/$/,                 // 홈
  /^\/feed(\/|$)/,
  /^\/studies(\/|$)/,
  /^\/questions(\/|$)/,
  /^\/oauth2\/redirect(\/|$)/,
]

export default function RequireProfile({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      // 1) 항상 허용 경로는 바로 통과
      if (ALWAYS_ALLOW.some((re) => re.test(pathname))) {
        if (alive) setChecking(false)
        return
      }

      const token = await auth.getToken()

      // 2) 미로그인(게스트)
      if (!token) {
        // 게스트 공개 페이지는 통과, 그 외는 로그인으로
        if (PUBLIC_GUEST.some((re) => re.test(pathname))) {
          if (alive) setChecking(false)
          return
        }
        router.replace("/auth/login")
        return
      }

      // 3) 로그인 상태 → 프로필 존재 여부 확인
      try {
        const res = await api.get("/members/profile/me")
        const hasProfile = !!(res?.result && Object.keys(res.result).length > 0)
        if (!hasProfile) {
          // 프로필 없으면 어떤 페이지건 생성 페이지로 강제
          router.replace("/profile/new")
          return
        }
        // 프로필 있으면 통과
        if (alive) setChecking(false)
      } catch {
        // 오류 시 안전하게 생성 페이지로
        router.replace("/profile/new")
      }
    })()

    return () => { alive = false }
  }, [pathname, router])

  if (checking) return null
  return <>{children}</>
}
