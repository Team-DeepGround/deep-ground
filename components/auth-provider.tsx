"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth } from "@/lib/auth"
import { api } from "@/lib/api-client"

export interface UserProfile {
  id: number
  email: string
  nickname: string
  profileImageUrl?: string
  role: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: UserProfile | null
  login: (token: string) => void
  logout: () => void
  isLoading: boolean
  memberId?: number
  email?: string
  role?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/members/profile/me")
      if (res.result) {
        setUser({
          id: res.result.memberId,
          email: res.result.email,
          nickname: res.result.nickname,
          profileImageUrl: res.result.profileImage,
          role: res.result.role,
        })
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      // 프로필 로드 실패 시 로그아웃 처리
      await auth.removeToken()
      setIsAuthenticated(false)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      const token = await auth.getToken()
      if (token) {
        setIsAuthenticated(true)
        await fetchUser()
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, fetchUser])

  const login = (token: string) => {
    auth.setToken(token)
    setIsAuthenticated(true)
    fetchUser()
    router.push("/")
  }

  const logout = () => {
    auth.removeToken()
    setIsAuthenticated(false)
    setUser(null)
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuthenticated && user !== null,
        user,
        login,
        logout,
        isLoading,
        memberId: user?.id,
        email: user?.email,
        role: user?.role,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
