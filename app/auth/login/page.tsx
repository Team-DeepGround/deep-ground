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

const SOCIAL_PROVIDERS = [
  { name: "Google", provider: "google", color: "bg-red-500 hover:bg-red-600 text-white" },
  { name: "Naver", provider: "naver", color: "bg-green-500 hover:bg-green-600 text-white" },
  { name: "Kakao", provider: "kakao", color: "bg-yellow-300 hover:bg-yellow-400 text-black" },
];

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
    const response = await api.post<LoginResponse>(
      "/auth/login",
      { email, password },
      { requireAuth: false }
    )

    if (response.result?.accessToken) {
      login(response.result.accessToken)
      toast.success("로그인에 성공했습니다.")

      // 프로필 존재 여부 체크
      try {
        const profileRes = await api.get("/members/profile/me")
        console.log("프로필 응답:", profileRes)

        // result 객체가 있고 내용이 있는 경우 메인 페이지로 이동
        if (profileRes.result && Object.keys(profileRes.result).length > 0) {
          console.log("프로필 존재함 - 메인 페이지로 이동")
          router.push("/")
        } else {
          console.log("프로필 없음 - 프로필 생성 페이지로 이동")
          router.push("/profile/new")
        }
      } catch (error: any) {
        console.error("프로필 조회 에러:", error)
        router.push("/profile/new")
      }
    } else {
      toast.error("로그인에 실패했습니다.")
    }
  } catch (error) {
    console.error("로그인 에러:", error)
    toast.error("로그인에 실패했습니다.")
  } finally {
    setIsLoading(false)
  }
}

  // 소셜 로그인 핸들러
  const handleSocialLogin = async (provider: string) => {
  try {
    // 백엔드에서 리다이렉트 URL을 받아옴
    const res = await fetch(`http://localhost:8080/api/v1/auth/oauth/${provider}/login`);
    const { redirectUrl } = await res.json();
    if (redirectUrl) {
      // context-path 포함해서 리다이렉트
      window.location.href = `http://localhost:8080/api/v1${redirectUrl}`;
    } else {
      toast.error("소셜 로그인 URL을 가져오지 못했습니다.");
    }
  } catch (error) {
    toast.error("소셜 로그인에 실패했습니다.");
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
            {/* 회원가입 버튼 */}
            <Button
              type="button"
              className="w-full mt-3 bg-white text-black border border-gray-300 hover:bg-gray-100"
              onClick={() => router.push("/auth/register")}
            >
              회원가입
            </Button>
            {/* 비밀번호 찾기 안내문구 */}
            <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-500">
                비밀번호를 잊어버리셨나요?{" "}
                <button
                  type="button"
                  className="underline text-xs text-gray-700 hover:text-black"
                  onClick={() => router.push("/auth/reset-password")}
                  style={{ padding: 0, background: "none", border: "none" }}
                >
                  비밀번호 찾기
                </button>
              </span>
            </div>
          </div>
        </form>

        {/* 소셜 로그인 버튼들 */}
        <div className="mt-8 space-y-2">
          {SOCIAL_PROVIDERS.map(({ name, provider, color }) => (
            <Button
              key={provider}
              type="button"
              className={`w-full ${color}`}
              onClick={() => handleSocialLogin(provider)}
            >
              {name}로 로그인
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
