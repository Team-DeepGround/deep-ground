"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type InquiryStatus = "PENDING" | "IN_PROGRESS" | "ANSWERED" | "CLOSED"

interface InquirySummary {
  id: number
  title: string
  status: InquiryStatus
  createdAt: string
}

export default function MyInquiriesPage() {
  const [items, setItems] = useState<InquirySummary[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/support/inquiries/me")
        setItems(res?.result ?? [])
      } catch (e) {
        toast({
          title: "불러오기 실패",
          description: "내 문의 목록을 가져오지 못했어요. 잠시 후 다시 시도해주세요.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const renderStatus = (s: InquiryStatus) => {
    switch (s) {
      case "PENDING":
        return <Badge variant="secondary">접수</Badge>
      case "IN_PROGRESS":
        return <Badge>처리중</Badge>
      case "ANSWERED":
        return <Badge variant="outline">답변완료</Badge>
      case "CLOSED":
        return <Badge variant="secondary">종결</Badge>
      default:
        return <Badge variant="secondary">{s}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 문의</h1>
        <Button asChild>
          {/* 문의 작성 페이지 경로: 네가 만든 작성 페이지로 맞춰줘 (예: /inquiries/new 또는 /inquiries) */}
          <Link href="/inquiries/new">
            <Plus className="h-4 w-4 mr-2" />
            문의하기
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">아직 작성한 문의가 없습니다.</p>
            <Button className="mt-4" asChild>
              <Link href="/inquiries/new">첫 문의 작성하기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((q) => (
            <Card
              key={q.id}
              className="hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/inquiries/${q.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base line-clamp-1">{q.title}</CardTitle>
                  {renderStatus(q.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(q.createdAt), "yyyy.MM.dd HH:mm")}
                </p>
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/inquiries/${q.id}`)
                    }}
                  >
                    상세보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
