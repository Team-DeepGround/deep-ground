"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth, getTokenExp } from "@/lib/auth"

interface AuthContextType {
  isAuthenticated: boolean
  role: string | null
  email: string | null
  memberId: number | null
  login: (token: string, role?: string, email?: string, memberId?: number) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verify-email",
  "/auth/reset-password"
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
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const token = await auth.getToken()
      const exp = token ? getTokenExp(token) : null;
      const savedRole = await auth.getRole()
      const savedEmail = await auth.getEmail()
      const savedMemberId = await auth.getMemberId()

      if (exp && Date.now() / 1000 > exp) {
            // 만료됨: 로그아웃 처리 및 저장소 정리
            auth.removeToken();
            auth.removeRole();
            auth.removeEmail();
            auth.removeMemberId();
            localStorage.removeItem("token_exp");
            setIsAuthenticated(false);
            setRole(null);
            setEmail(null);
            setMemberId(null);
            router.push("/auth/login");
            return;
        }

      setIsAuthenticated(!!token)
      setRole(savedRole)
      setEmail(savedEmail)
      setMemberId(savedMemberId)

      // ✅ ROLE_GUEST 접근 차단
      if ((!token || savedRole === "ROLE_GUEST") && !publicPaths.includes(pathname)) {
        console.log("인증 필요: 이메일 인증 페이지로 리다이렉트")

        const emailQuery = savedEmail ? `?email=${encodeURIComponent(savedEmail)}` : ""
        router.push(`/auth/verify-email${emailQuery}`)
        }

    }

    checkAuth()
  }, [pathname, router])

  const login = (token: string, role?: string, email?: string, memberId?: number) => {
    console.log("로그인 처리 시작")
    auth.setToken(token)
    if (role) {
      auth.setRole(role)
      setRole(role)
    }
    const exp = getTokenExp(token);
    if (exp) localStorage.setItem("token_exp", exp.toString());
    if (email) {
      auth.setEmail(email)
      setEmail(email)
    }
    if (memberId !== undefined) {
      auth.setMemberId(memberId)
      setMemberId(memberId)
    }
    setIsAuthenticated(true)
    console.log("로그인 처리 완료")
  }

  const logout = () => {
    console.log("로그아웃 처리 시작")
    auth.removeToken()
    auth.removeRole()
    auth.removeEmail()
    auth.removeMemberId()
    setIsAuthenticated(false)
    setRole(null)
    setEmail(null)
    setMemberId(null)
    router.push("/auth/login")
    console.log("로그아웃 처리 완료")
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        email,
        memberId,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
