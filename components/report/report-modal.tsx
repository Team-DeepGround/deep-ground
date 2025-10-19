"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import axios, { isAxiosError } from "axios"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

function extractServerErrorMessage(err: unknown): string {
  if (!isAxiosError(err)) {
    // Axios 에러가 아닌 경우
    // Error 객체면 message, 아니면 문자열화
    if (err instanceof Error) return err.message || "알 수 없는 오류가 발생했습니다."
    return typeof err === "string" ? err : "알 수 없는 오류가 발생했습니다."
  }

  const res = err.response
  if (!res) {
    // 네트워크/타임아웃 등으로 response가 없는 경우
    return err.message || "네트워크 오류가 발생했습니다."
  }

  // response.data가 Blob/String일 수도 있으니 최대한 안전하게 파싱
  const data = res.data

  // 1) 문자열이면 그대로
  if (typeof data === "string") return data

  // 2) Blob(JSON)일 수 있음 → 동기 파싱은 불가라 우선 statusText 사용
  if (data instanceof Blob) {
    // 서버가 JSON Blob을 보냈을 수도 있으므로 힌트 제공
    return res.statusText || "요청이 실패했습니다."
  }

  // 3) 일반 객체(JSON)일 때 필드 우선순위대로 메시지 추출
  //    (백엔드 포맷에 맞춰 커스텀)
  const msg =
    data?.message ||
    data?.error ||
    data?.detail ||
    (Array.isArray(data?.errors) && data.errors.map((e: any) => e.reason || e.defaultMessage || e.message).filter(Boolean).join("\n")) ||
    data?.title ||
    data?.msg ||
    res.statusText ||
    err.message

  // 4) 최종 fallback
  return msg || "요청이 실패했습니다."
}

interface ReportModalProps {
  targetId: number
  targetType: "FEED" | "MEMBER" | "QUESTION"
  reportedMemberId?: number
  triggerText?: string
  open?: boolean
  setOpen?: (value: boolean) => void
  children?: React.ReactNode
}

export function ReportModal({
  targetId,
  targetType,
  reportedMemberId,
  triggerText = "신고",
  open,
  setOpen,
  children,
}: ReportModalProps) {
  const { toast } = useToast()
  const [reason, setReason] = useState<"ABUSE" | "SEXUAL_CONTENT" | "SPAM" | "OTHER" | "">("")
  const [content, setContent] = useState("")

  const [internalOpen, setInternalOpen] = useState(false)
  const dialogOpen = open !== undefined ? open : internalOpen
  const handleOpenChange = setOpen ?? setInternalOpen

  const handleSubmit = async () => {
    if (!reason || !content.trim()) return

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({ title: "인증 실패", description: "로그인이 필요합니다.", variant: "destructive" })
        return
      }

      await axios.post(
        "/api/v1/report",
        {
          targetType,
          targetId,
          reportedMemberId,
          reason,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast({
        title: "신고 완료",
        description: "관리자가 확인 후 조치할 예정입니다.",
      })
      handleOpenChange(false)
      setReason("")
      setContent("")
    } catch (error) {
      const description = extractServerErrorMessage(error)
      toast({
        title: "신고 실패",
        description,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (triggerText && (
          <Button variant="ghost" className="text-red-500 text-sm">
            {triggerText}
          </Button>
        ))}
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <h2 className="text-lg font-semibold">신고하기</h2>

        <div className="space-y-2">
          <Label>신고 사유</Label>
          <Select value={reason} onValueChange={(value) => setReason(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="신고 사유를 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ABUSE">욕설</SelectItem>
              <SelectItem value="SEXUAL_CONTENT">음란성</SelectItem>
              <SelectItem value="SPAM">광고</SelectItem>
              <SelectItem value="OTHER">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>상세 내용</Label>
          <Textarea
            placeholder="상세한 신고 사유를 입력해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <Button onClick={handleSubmit} disabled={!reason || !content.trim()}>
          신고 제출
        </Button>
      </DialogContent>
    </Dialog>
  )
}