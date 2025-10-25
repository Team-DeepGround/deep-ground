"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth, getTokenExp } from "@/lib/auth"

interface AuthContextType {
  isAuthenticated: boolean
  role: string | null
  email: string | null
  memberId: number | null
  nickname: string | null
  // 닉네임까지 받도록 시그니처 확장
  login: (token: string, role?: string, email?: string, memberId?: number, nickname?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verify-email",
  "/auth/reset-password",
  "/feed",
  "/studies",
  "/questions",
  "/oauth2/redirect",
  // 필요하면 "/oauth2/redirect" 등도 허용 경로에 추가
]

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [memberId, setMemberId] = useState<number | null>(null)
  const [nickname, setNickname] = useState<string | null>(null) // ✅ 닉네임 상태
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const token = await auth.getToken()
      const exp = token ? getTokenExp(token) : null
      const savedRole = await auth.getRole()
      const savedEmail = await auth.getEmail()
      const savedMemberId = await auth.getMemberId()
      const savedNickname = await auth.getNickname?.() // ✅ 닉네임 복구

      // 만료 처리
      if (exp && Date.now() / 1000 > exp) {
        auth.removeToken()
        auth.removeRole()
        auth.removeEmail()
        auth.removeMemberId()
        auth.removeNickname?.()
        localStorage.removeItem("token_exp")
        setIsAuthenticated(false)
        setRole(null)
        setEmail(null)
        setMemberId(null)
        setNickname(null)
        router.push("/auth/login")
        return
      }

      // 상태 복구
      setIsAuthenticated(!!token)
      setRole(savedRole)
      setEmail(savedEmail)
      setMemberId(savedMemberId)
      setNickname(savedNickname || null)

      // ROLE_GUEST 접근 차단
      if ((savedRole === "ROLE_GUEST") && !publicPaths.includes(pathname)) {
        const emailQuery = savedEmail ? `?email=${encodeURIComponent(savedEmail)}` : ""
        router.push(`/auth/verify-email${emailQuery}`)
      }
    }

    checkAuth()
  }, [pathname, router])

  // ✅ 로그인: 닉네임까지 저장
  const login = (
    token: string,
    roleArg?: string,
    emailArg?: string,
    memberIdArg?: number,
    nicknameArg?: string
  ) => {
    auth.setToken(token)

    if (roleArg) {
      auth.setRole(roleArg)
      setRole(roleArg)
    }

    const exp = getTokenExp(token)
    if (exp) localStorage.setItem("token_exp", exp.toString())

    if (emailArg) {
      auth.setEmail(emailArg)
      setEmail(emailArg)
    }

    if (memberIdArg !== undefined) {
      auth.setMemberId(memberIdArg)
      setMemberId(memberIdArg)
    }

    if (nicknameArg) {
      auth.setNickname?.(nicknameArg)
      setNickname(nicknameArg)
    }

    setIsAuthenticated(true)
  }

  // ✅ 로그아웃: 닉네임 포함 정리
  const logout = () => {
    auth.removeToken()
    auth.removeRole()
    auth.removeEmail()
    auth.removeMemberId()
    auth.removeNickname?.()
    localStorage.removeItem("token_exp")
    setIsAuthenticated(false)
    setRole(null)
    setEmail(null)
    setMemberId(null)
    setNickname(null)
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        email,
        memberId,
        nickname, // ✅ 컨텍스트로 노출
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
