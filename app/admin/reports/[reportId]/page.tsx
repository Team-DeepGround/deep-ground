"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { useRouter, useParams } from "next/navigation"
import { ReportDetail } from "@/types/report"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { auth } from "@/lib/auth"

export default function ReportDetailPage() {
  const { reportId } = useParams()
  const router = useRouter()
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [banDays, setBanDays] = useState(7)

  useEffect(() => {
    const fetchDetail = async () => {
      const token = await auth.getToken()
      const role = await auth.getRole()
      if (!token || role !== "ROLE_ADMIN") {
        setUnauthorized(true)
        router.replace("/")
        return
      }

      try {
        const res = await api.get(`/admin/report/${reportId}`)
        setReport(res.result)
      } catch (error) {
        console.error("신고 상세 조회 실패:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [reportId, router])

  if (unauthorized) return null
  if (loading) return <p className="p-6">로딩 중...</p>
  if (!report) return <p className="p-6">신고 데이터를 찾을 수 없습니다.</p>

  const handle = async (endpoint: string, message: string) => {
    try {
      await api.post(`/admin/report/${reportId}/${endpoint}`)
      alert(message)
      router.push("/admin/reports")
    } catch (e) {
      alert("처리 중 오류 발생")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">신고 상세</h1>
      <Card>
        <CardHeader>
          <CardTitle>{report.targetType === "FEED" ? "피드 신고" : "회원 신고"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><Label>신고자</Label> {report.reporterNickname}</p>
          <p><Label>대상자</Label> {report.reportedNickname}</p>
          <p><Label>사유</Label> {report.reason}</p>
          <p><Label>내용</Label> {report.content}</p>

          {report.targetType === "FEED" && (
            <div>
              <Label>피드 내용</Label>
              <Textarea disabled value={report.feedContent ?? "(삭제됨)"} />
              <div className="flex gap-2 mt-3">
                <Button variant="destructive" onClick={() => handle("delete-feed", "피드 삭제 완료")}>
                  피드 삭제
                </Button>
                <Button variant="secondary" onClick={() => handle("keep-feed", "피드 유지 처리 완료")}>
                  유지 처리
                </Button>
              </div>
            </div>
          )}

          {report.targetType === "MEMBER" && (
            <div className="space-y-3">
              <Label>정지 일수</Label>
              <Input type="number" min={1} value={banDays} onChange={e => setBanDays(+e.target.value)} />
              <div className="flex gap-2">
                <Button variant="destructive" onClick={() => handle(`ban-member?days=${banDays}`, "회원 정지 완료")}>
                  회원 정지
                </Button>
                <Button variant="secondary" onClick={() => handle("keep-member", "무시 처리 완료")}>
                  무시 처리
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
