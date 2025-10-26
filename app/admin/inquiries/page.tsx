"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  fetchAdminInquiryList,
  type AdminInquirySummary,
  type InquiryStatus,
} from "@/lib/api/admin-inquiries"
import InquiryStatusBadge from "@/components/admin/InquiryStatusBadge"

const ALL: InquiryStatus | "ALL" = "ALL"

export default function AdminInquiryListPage() {
  const { role, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [status, setStatus] = useState<InquiryStatus | "ALL">(ALL)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<AdminInquirySummary[]>([])
  const [q, setQ] = useState("")

  useEffect(() => {
    // 아직 role이 결정되지 않았거나 인증 여부 로딩 중이면 대기
    if (role === undefined) return

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
      const data = await fetchAdminInquiryList(status === ALL ? undefined : status)
      // 간단 키워드 필터(제목)
      const filtered = q ? data.filter(d => d.title.toLowerCase().includes(q.toLowerCase())) : data
      setItems(filtered)
    } catch (e: any) {
      toast({ title: "목록 조회 실패", description: e?.message ?? "잠시 후 다시 시도해주세요.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">문의 관리</h1>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">필터</CardTitle>
          <div className="flex gap-2 items-center">
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체</SelectItem>
                <SelectItem value="PENDING">접수</SelectItem>
                <SelectItem value="IN_PROGRESS">진행중</SelectItem>
                <SelectItem value="ANSWERED">답변완료</SelectItem>
                <SelectItem value="CLOSED">종결</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="제목 검색"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
              />
            </div>

            <Button onClick={load}>검색</Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> 불러오는 중…
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">조회된 문의가 없습니다.</div>
          ) : (
            <div className="divide-y">
              {items.map((i) => (
                <Link key={i.id} href={`/admin/inquiries/${i.id}`} className="block hover:bg-accent/50">
                  <div className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <div className="font-medium">{i.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(i.createdAt).toLocaleString()}</div>
                    </div>
                    <InquiryStatusBadge status={i.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
