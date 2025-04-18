"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, Mail, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [email, setEmail] = useState("")
  const [remainingTime, setRemainingTime] = useState(300) // 5분 = 300초
  const [resendDisabled, setResendDisabled] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(60) // 재발송 대기 시간 (60초)

  useEffect(() => {
    // URL에서 이메일 파라미터 가져오기
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // 이메일 파라미터가 없으면 경고 표시
      toast({
        title: "이메일 정보 없음",
        description: "이메일 정보가 없습니다. 회원가입 페이지로 이동합니다.",
        variant: "destructive",
      })
      // 잠시 후 회원가입 페이지로 리다이렉트
      setTimeout(() => {
        router.push("/auth/register")
      }, 3000)
    }

    // 인증 코드 유효 시간 타이머 설정
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // 재발송 대기 시간 타이머 설정
    const resendTimer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(resendTimer)
          setResendDisabled(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
      clearInterval(resendTimer)
    }
  }, [searchParams, router, toast])

  // 남은 시간 포맷팅 (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "인증 코드 오류",
        description: "6자리 인증 코드를 정확히 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (remainingTime <= 0) {
      toast({
        title: "인증 시간 만료",
        description: "인증 시간이 만료되었습니다. 코드를 재발송해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // 실제로는 API 호출을 통해 인증 코드 검증
      // 여기서는 임시로 타임아웃 후 성공 처리
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 인증 성공 처리
      setIsVerified(true)
      setIsLoading(false)

      toast({
        title: "이메일 인증 완료",
        description: "이메일 인증이 완료되었습니다.",
      })
    } catch (error) {
      setIsLoading(false)
      toast({
        title: "인증 실패",
        description: "인증 코드가 올바르지 않습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  const handleResendCode = async () => {
    if (resendDisabled) {
      toast({
        title: "재발송 대기 중",
        description: `${resendCountdown}초 후에 재발송할 수 있습니다.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // 실제로는 API 호출을 통해 인증 코드 재발송
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 타이머 리셋
      setRemainingTime(300)
      setResendDisabled(true)
      setResendCountdown(60)

      // 재발송 대기 시간 타이머 재설정
      const resendTimer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(resendTimer)
            setResendDisabled(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      setIsLoading(false)
      toast({
        title: "인증 코드 재발송",
        description: "새로운 인증 코드가 이메일로 발송되었습니다.",
      })
    } catch (error) {
      setIsLoading(false)
      toast({
        title: "재발송 실패",
        description: "인증 코드 재발송에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto flex max-w-md flex-col justify-center space-y-6 px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">이메일 인증</CardTitle>
          <CardDescription>
            {email ? `${email}로 발송된 인증 코드를 입력해주세요.` : "이메일로 발송된 인증 코드를 입력해주세요."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!email && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>이메일 정보 없음</AlertTitle>
              <AlertDescription>이메일 정보가 없습니다. 잠시 후 회원가입 페이지로 이동합니다.</AlertDescription>
            </Alert>
          )}

          {!isVerified ? (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground">
                  인증 코드는 <span className="font-medium text-foreground">{formatTime(remainingTime)}</span> 동안
                  유효합니다
                </p>
                {remainingTime <= 60 && (
                  <p className="text-xs text-red-500 mt-1">
                    인증 시간이 얼마 남지 않았습니다. 필요하면 코드를 재발송해주세요.
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="verificationCode">인증 코드</Label>
                <Input
                  id="verificationCode"
                  placeholder="6자리 인증 코드"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  disabled={isLoading || isVerified || !email}
                />
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-12 border rounded-md flex items-center justify-center text-lg font-medium"
                    >
                      {verificationCode[index] || ""}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                  onClick={handleResendCode}
                  disabled={isLoading || resendDisabled || !email}
                >
                  {resendDisabled ? `인증 코드 재발송 (${resendCountdown}초 후 가능)` : "인증 코드 재발송"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium">인증 완료</h3>
              <p className="text-muted-foreground">
                이메일 인증이 성공적으로 완료되었습니다. 이제 DeepGround의 모든 기능을 이용하실 수 있습니다.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {!isVerified ? (
            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={isLoading || verificationCode.length !== 6 || remainingTime <= 0 || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  인증 중...
                </>
              ) : (
                "인증하기"
              )}
            </Button>
          ) : (
            <Button className="w-full" asChild>
              <Link href="/auth/login">로그인 페이지로 이동</Link>
            </Button>
          )}

          <Button variant="outline" className="w-full" asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
