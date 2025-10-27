"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

type InquiryStatus = "PENDING" | "IN_PROGRESS" | "ANSWERED" | "CLOSED"

interface InquiryAnswer {
  id: number
  inquiryId: number
  adminId: number
  adminNickname: string
  content: string
  createdAt: string
}

interface InquiryDetail {
  id: number
  title: string
  content: string
  status: InquiryStatus
  createdAt: string
  updatedAt: string
  answers: InquiryAnswer[]
}

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<InquiryDetail | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get(`/support/inquiries/${id}`)
        setData(res.result)
      } catch (err: any) {
        const msg = err?.result?.message || "문의 상세 조회에 실패했습니다."
        toast({ title: "오류", description: msg, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id, toast])

  if (loading) {
    return <div className="container max-w-3xl mx-auto py-8">Loading...</div>
  }
  if (!data) {
    return <div className="container max-w-3xl mx-auto py-8">데이터가 없습니다.</div>
  }

  const statusVariant =
    data.status === "PENDING" ? "outline" :
    data.status === "IN_PROGRESS" ? "secondary" :
    data.status === "ANSWERED" ? "default" : "outline"

  return (
    <div className="container max-w-3xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">문의 상세</h1>
        <Button variant="outline" onClick={() => router.push("/profile")}>내 프로필로</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{data.title}</CardTitle>
            <Badge variant={statusVariant as any}>{data.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{data.content}</p>
          <Separator className="my-6" />
          <h3 className="font-semibold mb-3">답변</h3>
          {data.answers?.length ? (
            <div className="space-y-4">
              {data.answers.map((a) => (
                <div key={a.id} className="rounded-md border p-3">
                  <div className="text-sm font-medium mb-1">{a.adminNickname}</div>
                  <div className="text-sm whitespace-pre-wrap">{a.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">아직 답변이 없습니다.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
