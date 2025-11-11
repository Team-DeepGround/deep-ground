"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback, // 1. useCallback 임포트
} from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth, getTokenExp } from "@/lib/auth"

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    role: string | null;
    email: string | null;
    memberId: number | null;
    nickname: string | null;
    profileId?: number | null; // 프로필 ID 추가
    profileImageUrl?: string | null; // 프로필 이미지 URL 추가
    publicId: string | null; // UUID 추가
    profilePublicId?: string | null; // 프로필 UUID 추가
  } | null;
  login: (
    token: string,
    role?: string,
    email?: string,
    memberId?: number,
    nickname?: string,
    publicId?: string
  ) => void;
  logout: () => void;
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
  const [user, setUser] = useState<AuthContextType['user']>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const token = await auth.getToken()
      const exp = token ? getTokenExp(token) : null

      // 만료 처리
      if (exp && Date.now() / 1000 > exp) {
        auth.removeToken()
        auth.removeRole()
        auth.removeEmail()
        auth.removeMemberId()
        auth.removeNickname()
        auth.removePublicId()
        localStorage.removeItem("token_exp")
        setIsAuthenticated(false)
        setUser(null)
        router.push("/auth/login")
        return
      }

      // 상태 복구
      if (token) {
        setIsAuthenticated(true)
        const savedRole = await auth.getRole()
        const savedEmail = await auth.getEmail()
        const savedMemberId = await auth.getMemberId()
        const savedNickname = await auth.getNickname()
        const savedPublicId = await auth.getPublicId() // 1. localStorage에서 publicId를 가져옵니다.

        setUser({
          role: savedRole,
          email: savedEmail,
          memberId: savedMemberId,
          nickname: savedNickname,
          publicId: savedPublicId, // 2. user 상태에 publicId를 설정합니다.
        })

        // ROLE_GUEST 접근 차단
        if ((savedRole === "ROLE_GUEST") && !publicPaths.includes(pathname)) {
          const emailQuery = savedEmail ? `?email=${encodeURIComponent(savedEmail)}` : ""
          router.push(`/auth/verify-email${emailQuery}`)
        }
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    }

    checkAuth()
  }, [pathname, router])

  // ✅ 로그인: 닉네임까지 저장
  const login = useCallback( // 2. login 함수를 useCallback으로 래핑
    (
      token: string,
      roleArg?: string,
      emailArg?: string,
      memberIdArg?: number,
      nicknameArg?: string,
      publicIdArg?: string
    ) => {
      auth.setToken(token)

      if (roleArg) {
        auth.setRole(roleArg)
      }

      const exp = getTokenExp(token)
      if (exp) localStorage.setItem("token_exp", exp.toString())

      if (emailArg) {
        auth.setEmail(emailArg)
      }

      if (memberIdArg !== undefined) {
        auth.setMemberId(memberIdArg)
      }

      if (nicknameArg) {
        auth.setNickname?.(nicknameArg)
      }

      if (publicIdArg) {
        auth.setPublicId?.(publicIdArg)
      }

      setIsAuthenticated(true)
      // 로그인 시 user 상태를 즉시 업데이트하여 publicId를 포함시킵니다.
      setUser({
        role: roleArg ?? null,
        email: emailArg ?? null,
        memberId: memberIdArg ?? null,
        nickname: nicknameArg ?? null,
        publicId: publicIdArg ?? null,
      });
    },
    [] // 3. 의존성 배열 추가 (setState 함수들은 의존성 필요 없음)
  )

  // ✅ 로그아웃: 닉네임 포함 정리
  const logout = useCallback(() => { // 4. logout 함수를 useCallback으로 래핑
    auth.removeToken()
    auth.removeRole()
    auth.removeEmail()
    auth.removeMemberId()
    auth.removePublicId()
    auth.removeNickname()
    localStorage.removeItem("token_exp")
    setIsAuthenticated(false)
    setUser(null)
    router.push("/auth/login")
  }, [router]) // 5. router를 의존성 배열에 추가

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user: isAuthenticated ? {
          role: user?.role ?? null,
          email: user?.email ?? null,
          memberId: user?.memberId ?? null,
          publicId: user?.publicId ?? null,
          nickname: user?.nickname ?? null,
        } : null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}