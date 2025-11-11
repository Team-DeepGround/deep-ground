"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { api } from "@/lib/api-client"
import { toast } from "sonner"

// 간단한 JWT payload 파서
function parseJwt<T = any>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

function OAuth2Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const accessToken = searchParams.get("accessToken")
    const emailParam = searchParams.get("email")
    const nicknameParam = searchParams.get("nickname")
    const publicIdParam = searchParams.get("publicId") // ✅ 백엔드에서 내려주는 경우

    const run = async () => {
      if (!accessToken) {
        toast.error("소셜 로그인에 실패했습니다.")
        router.replace("/auth/login")
        return
      }

      const payload = parseJwt<any>(accessToken) || {}

      // role
      const role =
        payload.role ||
        payload.auth ||
        (Array.isArray(payload.authorities) ? payload.authorities[0] : null) ||
        null

      // memberId
      const memberId =
        payload.memberId ??
        payload.id ??
        (payload.sub ? Number(payload.sub) : null)

      // email / nickname
      const email =
        emailParam
          ? decodeURIComponent(emailParam)
          : payload.email ?? null

      const nickname =
        nicknameParam
          ? decodeURIComponent(nicknameParam)
          : payload.nickname ?? payload.name ?? null

      // ✅ publicId (쿼리스트링 > JWT payload 우선순위)
      const publicId =
        publicIdParam
          ? decodeURIComponent(publicIdParam)
          : payload.publicId ?? payload.userPublicId ?? null

      // ✅ AuthContext 시그니처에 맞게 모두 전달
      login(
        accessToken,
        role ?? undefined,
        email ?? undefined,
        memberId ?? undefined,
        nickname ?? undefined,
        publicId ?? undefined
      )

      toast.success(`${nickname || email}님, 소셜 로그인에 성공했습니다.`)

      // 프로필 존재 여부에 따라 라우팅
      try {
        const profileRes = await api.get("/members/profile/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (profileRes.result && Object.keys(profileRes.result).length > 0) {
          router.replace("/")
        } else {
          router.replace("/profile/new")
        }
      } catch {
        router.replace("/profile/new")
      }
    }

    run()
  }, [searchParams, login, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <span>로그인 처리 중...</span>
    </div>
  )
}

export default function OAuth2RedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span>로딩 중...</span>
        </div>
      }
    >
      <OAuth2Content />
    </Suspense>
  )
}
