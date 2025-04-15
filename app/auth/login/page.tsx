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

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await signIn(email, password)
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "로그인 실패",
        description: "이메일 또는 비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex h-screen max-w-sm flex-col justify-center space-y-6 px-2 py-12">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold">로그인</h1>
        <p className="text-sm text-muted-foreground">DeepGround에 오신 것을 환영합니다</p>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">비밀번호</Label>
                <Link
                  href="/auth/reset-password"
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
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
            GitHub로 로그인
          </Button>
          <Button variant="outline" type="button" disabled={isLoading}>
            <Mail className="mr-2 h-4 w-4" />
            Google로 로그인
          </Button>
        </div>

        <div className="text-center text-sm">
          계정이 없으신가요?{" "}
          <Link href="/auth/register" className="underline underline-offset-4 hover:text-primary">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}
