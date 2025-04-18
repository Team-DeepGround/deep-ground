"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Github, Mail, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

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
  const { signUp } = useAuth()

  // 이메일 중복 확인
  const checkEmailAvailability = () => {
    if (!email || !isValidEmail(email)) {
      toast({
        title: "유효하지 않은 이메일",
        description: "올바른 이메일 형식을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingEmail(true)

    // 실제로는 API 호출을 통해 중복 확인
    setTimeout(() => {
      // 임시로 랜덤하게 결과 반환 (실제로는 API 응답에 따라 처리)
      const isAvailable = Math.random() > 0.3
      setIsEmailAvailable(isAvailable)

      toast({
        title: isAvailable ? "사용 가능한 이메일" : "이미 사용 중인 이메일",
        description: isAvailable
          ? "입력하신 이메일은 사용 가능합니다."
          : "입력하신 이메일은 이미 사용 중입니다. 다른 이메일을 입력해주세요.",
        variant: isAvailable ? "default" : "destructive",
      })

      setIsCheckingEmail(false)
    }, 1000)
  }

  // 닉네임 중복 확인
  const checkNicknameAvailability = () => {
    if (!nickname || nickname.length < 2) {
      toast({
        title: "유효하지 않은 닉네임",
        description: "닉네임은 2자 이상이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingNickname(true)

    // 실제로는 API 호출을 통해 중복 확인
    setTimeout(() => {
      // 임시로 랜덤하게 결과 반환 (실제로는 API 응답에 따라 처리)
      const isAvailable = Math.random() > 0.3
      setIsNicknameAvailable(isAvailable)

      toast({
        title: isAvailable ? "사용 가능한 닉네임" : "이미 사용 중인 닉네임",
        description: isAvailable
          ? "입력하신 닉네임은 사용 가능합니다."
          : "입력하신 닉네임은 이미 사용 중입니다. 다른 닉네임을 입력해주세요.",
        variant: isAvailable ? "default" : "destructive",
      })

      setIsCheckingNickname(false)
    }, 1000)
  }

  // 이메일 형식 검증
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !confirmPassword || !nickname) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!isValidEmail(email)) {
      toast({
        title: "이메일 형식 오류",
        description: "올바른 이메일 형식을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }

    if (!agreedToTerms) {
      toast({
        title: "약관 동의 필요",
        description: "서비스 이용약관에 동의해주세요.",
        variant: "destructive",
      })
      return
    }

    if (isEmailAvailable !== true) {
      toast({
        title: "이메일 중복 확인 필요",
        description: "이메일 중복 확인을 진행해주세요.",
        variant: "destructive",
      })
      return
    }

    if (isNicknameAvailable !== true) {
      toast({
        title: "닉네임 중복 확인 필요",
        description: "닉네임 중복 확인을 진행해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      // 회원가입 처리
      await signUp(email, password)

      // 회원가입 성공 메시지
      toast({
        title: "회원가입 성공",
        description: "이메일 인증을 위해 인증 페이지로 이동합니다.",
      })

      // 이메일 인증 페이지로 리다이렉트
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
    } catch (error) {
      toast({
        title: "회원가입 실패",
        description: "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex max-w-sm flex-col justify-center space-y-6 px-2 py-12">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold">회원가입</h1>
        <p className="text-sm text-muted-foreground">DeepGround에 가입하고 개발자 커뮤니티에 참여하세요</p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
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
                  className={`${
                    isEmailAvailable === true
                      ? "border-green-500 focus-visible:ring-green-500"
                      : isEmailAvailable === false
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                  }`}
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
                  className={`${
                    isNicknameAvailable === true
                      ? "border-green-500 focus-visible:ring-green-500"
                      : isNicknameAvailable === false
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                  }`}
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는 다음으로 계속하기</span>
          </div>
        </div>

        <div className="grid gap-2">
          <Button variant="outline" type="button" disabled={isLoading}>
            <Github className="mr-2 h-4 w-4" />
            GitHub로 가입
          </Button>
          <Button variant="outline" type="button" disabled={isLoading}>
            <Mail className="mr-2 h-4 w-4" />
            Google로 가입
          </Button>
        </div>

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
