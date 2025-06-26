"use client"

import {createContext, useContext, useEffect, useState} from "react"
import {useRouter, usePathname} from "next/navigation"
import {auth} from "@/lib/auth"

interface AuthContextType {
    isAuthenticated: boolean
    login: (token: string, memberId: number) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// 인증이 필요하지 않은 경로들
const publicPaths = ["/auth/login", "/auth/register", "/auth/forgot-password"]

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export default function AuthProvider({children}: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // 초기 인증 상태 확인
        const checkAuth = async () => {
            const token = await auth.getToken()
            // console.log('현재 토큰:', token) // 토큰 로그 제거
            setIsAuthenticated(!!token)

            // 인증이 필요한 페이지에서 토큰이 없는 경우 로그인 페이지로 리다이렉트
            if (!token && !publicPaths.includes(pathname)) {
                console.log('인증 필요: 로그인 페이지로 리다이렉트')
                router.push("/auth/login")
            }
        }

        checkAuth()
    }, [pathname, router])

    const login = (token: string, memberId: number) => {
        console.log('로그인 처리 시작')
        auth.setToken(token)
        auth.setMemberId(memberId)
        setIsAuthenticated(true)
        console.log('로그인 처리 완료')
    }

    const logout = () => {
        console.log('로그아웃 처리 시작')
        auth.removeToken()
        auth.removeMemberId()
        setIsAuthenticated(false)
        router.push("/auth/login")
        console.log('로그아웃 처리 완료')
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
