"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface LoginResponse {
  status: number;
  message: string;
  result: {
    accessToken: string;
    refreshToken: string;
    memberId: number;
    email: string;
    nickname: string;
  } | null;
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.log('로그인 시도...')
      const response = await api.post<LoginResponse>(
        "/auth/login",
        { email, password },
        { requireAuth: false }
      )

      console.log('로그인 응답:', response)

      if (response.result?.accessToken) {
        console.log('토큰 저장 및 로그인 처리...')
        login(response.result.accessToken)
        toast.success("로그인에 성공했습니다.")
        console.log('메인 페이지로 이동 시도...')
        router.push("/")
        console.log('라우터 푸시 완료')
      } else {
        console.log('토큰이 없음')
        toast.error("로그인에 실패했습니다.")
      }
    } catch (error) {
      console.error('로그인 에러:', error)
      toast.error("로그인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                이메일
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
