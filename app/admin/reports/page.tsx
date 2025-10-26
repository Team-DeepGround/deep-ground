// app/admin/reports/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Report } from "@/types/report"
import { ReportList } from "@/components/admin/report-list"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/auth"
import { api } from "@/lib/api-client"

export default function AdminPendingReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchReports = async () => {
      const token = await auth.getToken()
      const role = await auth.getRole()

      if (!token || role !== "ROLE_ADMIN") {
        setUnauthorized(true)
        router.replace("/")
        return
      }

      try {
        // ✅ 기존 axios 대신 api-client 사용
        const response = await api.get("/admin/report/pending")
        // ✅ 백엔드 구조: { status, message, result }
        setReports(response.result ?? [])
      } catch (error) {
        console.error("검토할 신고 목록 로딩 실패:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [router])

  if (unauthorized) return null

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">검토가 필요한 신고 목록</h1>
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">검토가 필요한 신고 목록</h1>
      {reports.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">검토할 신고가 없습니다.</p>
      ) : (
        <ReportList reports={reports.filter((r) => !r.processed)} />
      )}
    </div>
  )
}
