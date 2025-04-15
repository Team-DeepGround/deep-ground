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
import { Github, Mail } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { signUp } = useAuth()

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

    try {
      setIsLoading(true)
      await signUp(email, password)
      toast({
        title: "회원가입 성공",
        description: "이메일 인증을 완료해주세요.",
      })
      router.push("/auth/verify-email")
    } catch (error) {
      toast({
        title: "회원가입 실패",
        description: "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
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
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="사용할 닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={isLoading}
              />
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
            <div className="grid gap-2">
              <Label htmlFor="techStack">주요 기술 스택</Label>
              <Select disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="기술 스택 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">프론트엔드</SelectItem>
                  <SelectItem value="backend">백엔드</SelectItem>
                  <SelectItem value="fullstack">풀스택</SelectItem>
                  <SelectItem value="mobile">모바일</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="ai">AI/ML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
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
              {isLoading ? "가입 중..." : "회원가입"}
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
