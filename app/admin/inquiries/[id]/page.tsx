"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  fetchAdminInquiryDetail,
  patchAdminInquiryStatus,
  postAdminInquiryAnswer,
  type AdminInquiryDetail,
  type InquiryStatus,
} from "@/lib/api/admin-inquiries"
import InquiryStatusBadge from "@/components/admin/InquiryStatusBadge"

export default function AdminInquiryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { role, isAuthenticated } = useAuth()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AdminInquiryDetail | null>(null)
  const [answer, setAnswer] = useState("")
  const [saving, setSaving] = useState(false)
  const [changing, setChanging] = useState(false)
  const [status, setStatus] = useState<InquiryStatus | null>(null)

  const id = String(params.id)

  useEffect(() => {
    if (!isAuthenticated || role !== "ROLE_ADMIN") {
      toast({ title: "접근 권한이 없습니다.", variant: "destructive" })
      router.replace("/")
      return
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, role])

  async function load() {
    setLoading(true)
    try {
      const d = await fetchAdminInquiryDetail(id)
      setData(d)
      setStatus(d.status)
    } catch (e: any) {
      toast({ title: "상세 조회 실패", description: e?.message ?? "잠시 후 다시 시도해주세요.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function submitAnswer() {
    if (!answer.trim()) {
      toast({ title: "내용을 입력하세요.", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      await postAdminInquiryAnswer(id, answer.trim())
      setAnswer("")
      toast({ title: "답변이 등록되었습니다." })
      await load()
    } catch (e: any) {
      toast({ title: "답변 등록 실패", description: e?.message ?? "잠시 후 다시 시도해주세요.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function changeStatus(next: InquiryStatus) {
    if (!data) return
    setChanging(true)
    try {
      await patchAdminInquiryStatus(id, next)
      toast({ title: "상태가 변경되었습니다." })
      await load()
    } catch (e: any) {
      toast({ title: "상태 변경 실패", description: e?.message ?? "잠시 후 다시 시도해주세요.", variant: "destructive" })
    } finally {
      setChanging(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> 불러오는 중…
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        문의를 찾을 수 없습니다.
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">문의 상세</h1>
        <div className="flex items-center gap-2">
          <InquiryStatusBadge status={data.status} />
          <Select value={status ?? data.status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="상태 변경" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">접수</SelectItem>
              <SelectItem value="IN_PROGRESS">진행중</SelectItem>
              <SelectItem value="ANSWERED">답변완료</SelectItem>
              <SelectItem value="CLOSED">종결</SelectItem>
            </SelectContent>
          </Select>
          <Button disabled={changing || !status || status === data.status} onClick={() => changeStatus(status!)}>
            {changing ? <Loader2 className="h-4 w-4 animate-spin" /> : "상태 저장"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{data.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="whitespace-pre-wrap text-sm leading-6">{data.content}</div>
          <div className="text-xs text-muted-foreground">
            작성: {new Date(data.createdAt).toLocaleString()} / 수정: {new Date(data.updatedAt).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">답변</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.answers.length === 0 ? (
            <div className="text-sm text-muted-foreground">등록된 답변이 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {data.answers.map((a) => (
                <div key={a.id} className="rounded border p-3">
                  <div className="text-sm whitespace-pre-wrap">{a.content}</div>
                  <Separator className="my-2" />
                  <div className="text-xs text-muted-foreground">
                    관리자: {a.adminNickname} · {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Textarea
              placeholder="답변 내용을 입력하세요."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end">
              <Button onClick={submitAnswer} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "답변 등록"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
