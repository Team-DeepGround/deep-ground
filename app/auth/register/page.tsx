"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client" // (수정 없음, api-client 사용)
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

const normalizeEmail = (s: string) => s.trim().toLowerCase()
const normalizeNickname = (s: string) => s.trim()

// 서버 응답을 해석하여 사용 가능 여부를 판단
const parseAvailability = (res: any): boolean | null => {
  // 서버가 {"status": 200, "message": "..."} 형태로 응답하는 경우
  if (res && typeof res === "object") {
    // status가 200이면 성공 (사용 가능)
    if (res.status === 200) {
      return true
    }
    // status가 400이면 중복 (사용 불가)
    if (res.status === 400) {
      return false
    }
  }
  
  // 기존 방식들도 지원 (하위 호환성)
  if (typeof res === "boolean") return res
  if (typeof res?.available === "boolean") return res.available
  if (typeof res?.exists === "boolean") return !res.exists
  if (typeof res?.duplicate === "boolean") return !res.duplicate
  
  return null
}

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null)

  const [isCheckingNickname, setIsCheckingNickname] = useState(false)
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null)

  const { toast } = useToast()
  const router = useRouter()

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  // 이메일 중복 확인
  const checkEmailAvailability = async () => {
    const normalized = normalizeEmail(email)
    if (!normalized || !isValidEmail(normalized)) {
      toast({
        title: "유효하지 않은 이메일",
        description: "올바른 이메일 형식을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingEmail(true)
    try {
      // api-client가 성공 응답(data)을 바로 반환
      const res = await api.get(`/auth/check-email`, { params: { email: normalized } })
      const available = parseAvailability(res)

      if (available === null) {
        setIsEmailAvailable(null)
        toast({
          title: "확인 완료",
          description: "응답을 해석할 수 없어 상태를 확정하지 못했습니다.",
        })
      } else {
        setIsEmailAvailable(available)
        toast({
          title: available ? "사용 가능한 이메일" : "이미 사용 중인 이메일",
          description: available
            ? "입력하신 이메일은 사용 가능합니다."
            : "입력하신 이메일은 이미 사용 중입니다.",
          variant: available ? "default" : "destructive",
        })
      }
    } catch (err: any) {
      // ===========================================
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼ 1. 첫 번째 수정 지점 ▼▼▼▼▼▼▼▼▼▼▼▼▼
      // ===========================================
      // err.response.status -> err.status
      const status = err?.status
      // err.response.data.message -> err.message
      const backendMessage: string | undefined = err?.message
      // ===========================================

      // ✅ 백엔드 포맷: {"status":400,"message":"[AUTH ERROR] 이미 존재하는 이메일입니다."}
      if (status === 400) {
        setIsEmailAvailable(false)
        toast({
          title: "중복된 이메일",
          description: backendMessage ?? "이미 사용 중인 이메일입니다.",
          variant: "destructive",
        })
      } else {
        setIsEmailAvailable(null)
        toast({
          title: `오류${status ? ` (${status})` : ""}`,
          description: backendMessage ?? "이메일 중복 확인 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // 닉네임 중복 확인
  const checkNicknameAvailability = async () => {
    const normalized = normalizeNickname(nickname)
    if (!normalized || normalized.length < 2) {
      toast({
        title: "유효하지 않은 닉네임",
        description: "닉네임은 2자 이상이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingNickname(true)
    try {
      const res = await api.get(`/auth/check-nickname`, { params: { nickname: normalized } })
      const available = parseAvailability(res)

      if (available === null) {
        setIsNicknameAvailable(null)
        toast({
          title: "확인 완료",
          description: "응답을 해석할 수 없어 상태를 확정하지 못했습니다.",
        })
      } else {
        setIsNicknameAvailable(available)
        toast({
          title: available ? "사용 가능한 닉네임" : "이미 사용 중인 닉네임",
          description: available
            ? "입력하신 닉네임은 사용 가능합니다."
            : "입력하신 닉네임은 이미 사용 중입니다.",
          variant: available ? "default" : "destructive",
        })
      }
    } catch (err: any) {
      // ===========================================
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼ 2. 두 번째 수정 지점 ▼▼▼▼▼▼▼▼▼▼▼▼▼
      // ===========================================
      // err.response.status -> err.status
      const status = err?.status
      // err.response.data.message -> err.message
      const backendMessage: string | undefined = err?.message
      // ===========================================

      // 닉네임도 동일 정책: 400이면 중복으로 간주하고 메시지 그대로 노출
      if (status === 400) {
        setIsNicknameAvailable(false)
        toast({
          title: "중복된 닉네임",
          description: backendMessage ?? "이미 사용 중인 닉네임입니다.",
          variant: "destructive",
        })
      } else {
        setIsNicknameAvailable(null)
        toast({
          title: `오류${status ? ` (${status})` : ""}`,
          description: backendMessage ?? "닉네임 중복 확인 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } finally {
      setIsCheckingNickname(false)
    }
  }

  // 회원가입 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const normEmail = normalizeEmail(email)
    const normNickname = normalizeNickname(nickname)

    // ... (유효성 검사 코드는 동일)
    if (!normEmail || !password || !confirmPassword || !normNickname) {
      toast({ title: "입력 오류", description: "모든 필드를 입력해주세요.", variant: "destructive" })
      return
    }
    if (!isValidEmail(normEmail)) {
      toast({ title: "이메일 형식 오류", description: "올바른 이메일 형식을 입력해주세요.", variant: "destructive" })
      return
    }
    if (password !== confirmPassword) {
      toast({ title: "비밀번호 불일치", description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.", variant: "destructive" })
      return
    }
    if (!agreedToTerms) {
      toast({ title: "약관 동의 필요", description: "서비스 이용약관에 동의해주세요.", variant: "destructive" })
      return
    }
    if (isEmailAvailable !== true) {
      toast({ title: "이메일 중복 확인 필요", description: "이메일 중복 확인을 진행해주세요.", variant: "destructive" })
      return
    }
    if (isNicknameAvailable !== true) {
      toast({ title: "닉네임 중복 확인 필요", description: "닉네임 중복 확인을 진행해주세요.", variant: "destructive" })
      return
    }

    try {
      setIsLoading(true)
      const res = await api.post(`/auth/register`, {
        email: normEmail,
        password,
        nickname: normNickname,
      })

      // api-client가 성공 시 data를 반환하므로, res.status 대신
      // res 객체 자체로 성공 여부 판단 (혹은 api-client가 200/201 보장)
      // 여기서는 res가 존재하면 성공으로 간주
      if (res) {
        toast({
          title: "회원가입 성공",
          description: "이메일 인증을 위해 인증 페이지로 이동합니다.",
        })
        router.push(`/auth/verify-email?email=${encodeURIComponent(normEmail)}`)
      } else {
        const backendMessage: string | undefined = (res as any)?.message
        toast({
          title: "회원가입 실패",
          description: backendMessage ?? "회원가입 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      // ===========================================
      // ▼▼▼▼▼▼▼▼▼▼▼▼▼ 3. 세 번째 수정 지점 ▼▼▼▼▼▼▼▼▼▼▼▼▼
      // ===========================================
      // err.response.status -> err.status
      const status = err?.status
      // err.response.data.message -> err.message
      const backendMessage: string | undefined = err?.message
      // ===========================================
      toast({
        title: `회원가입 실패${status ? ` (${status})` : ""}`,
        description: backendMessage ?? "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ... (JSX 렌더링 부분은 동일)
  return (
    <div className="container mx-auto flex max-w-sm flex-col justify-center space-y-6 px-2 py-12">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold">회원가입</h1>
        <p className="text-sm text-muted-foreground">DeepGround에 가입하고 개발자 커뮤니티에 참여하세요</p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {/* 이메일 */}
            <div className="grid gap-2">
              <Label htmlFor="email">이메일</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setIsEmailAvailable(null)
                  }}
                  disabled={isLoading}
                  className={
                    isEmailAvailable === true
                      ? "border-green-500 focus-visible:ring-green-500"
                      : isEmailAvailable === false
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={checkEmailAvailability}
                  disabled={isLoading || isCheckingEmail || !email}
                >
                  {isCheckingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "중복 확인"}
                </Button>
              </div>
              {isEmailAvailable === true && <p className="text-xs text-green-500">사용 가능한 이메일입니다.</p>}
              {isEmailAvailable === false && <p className="text-xs text-red-500">이미 사용 중인 이메일입니다.</p>}
            </div>

            {/* 닉네임 */}
            <div className="grid gap-2">
              <Label htmlFor="nickname">닉네임</Label>
              <div className="flex gap-2">
                <Input
                  id="nickname"
                  type="text"
                  placeholder="사용할 닉네임"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value)
                    setIsNicknameAvailable(null)
                  }}
                  disabled={isLoading}
                  className={
                    isNicknameAvailable === true
                      ? "border-green-500 focus-visible:ring-green-500"
                      : isNicknameAvailable === false
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={checkNicknameAvailability}
                  disabled={isLoading || isCheckingNickname || !nickname}
                >
                  {isCheckingNickname ? <Loader2 className="h-4 w-4 animate-spin" /> : "중복 확인"}
                </Button>
              </div>
              {isNicknameAvailable === true && <p className="text-xs text-green-500">사용 가능한 닉네임입니다.</p>}
              {isNicknameAvailable === false && <p className="text-xs text-red-500">이미 사용 중인 닉네임입니다.</p>}
            </div>

            {/* 비밀번호 */}
            <div className="grid gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* 약관 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <span>
                  <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                    서비스 이용약관
                  </Link>
                  에 동의합니다
                </span>
              </label>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  가입 중...
                </>
              ) : (
                "회원가입"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
            로그인
          </Link>
        </div>
      </div>
    </div>
  )
}