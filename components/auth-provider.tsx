"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// 실제 프로젝트에서는 환경 변수를 사용해야 합니다
const supabaseUrl = "https://your-supabase-url.supabase.co"
const supabaseAnonKey = "your-supabase-anon-key"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

type User = {
  id: string
  email: string | null
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
  email_confirmed?: boolean // 이메일 인증 여부 추가
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  verifyEmail: (code: string) => Promise<boolean> // 이메일 인증 함수 추가
  resendVerificationEmail: (email: string) => Promise<void> // 인증 이메일 재발송 함수 추가
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 현재 세션 확인
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
          email_confirmed: session.user.email_confirmed_at !== null, // 이메일 인증 여부 설정
        })
      }

      setLoading(false)
    }

    checkSession()

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
          email_confirmed: session.user.email_confirmed_at !== null, // 이메일 인증 여부 설정
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) throw error

    // 이메일 인증 여부 확인
    if (data.user && !data.user.email_confirmed_at) {
      throw new Error("이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.")
    }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
      },
    })

    if (error) throw error

    // 실제로는 여기서 이메일 인증 메일이 발송됨
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email)
  }

  // 이메일 인증 함수
  const verifyEmail = async (code: string): Promise<boolean> => {
    try {
      // 실제로는 Supabase API를 통해 인증 코드 검증
      // 여기서는 임시로 성공 처리
      return true
    } catch (error) {
      console.error("이메일 인증 실패:", error)
      return false
    }
  }

  // 인증 이메일 재발송 함수
  const resendVerificationEmail = async (email: string) => {
    try {
      // 실제로는 Supabase API를 통해 인증 이메일 재발송
      await supabase.auth.resend({
        type: "signup",
        email,
      })
    } catch (error) {
      console.error("인증 이메일 재발송 실패:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
