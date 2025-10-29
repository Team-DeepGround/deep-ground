"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { Report } from "@/types/report"
import { ReportList } from "@/components/admin/report-list"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/auth"

export default function AdminAllReportsPage() {
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
        // ✅ 백엔드 응답 구조 반영
        const response = await api.get("/admin/report")
        setReports(response.result?.content ?? [])
      } catch (error) {
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
        <h1 className="text-2xl font-bold">전체 신고 목록</h1>
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">전체 신고 목록</h1>
      {reports.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">신고 내역이 없습니다.</p>
      ) : (
        <ReportList reports={reports} />
      )}
    </div>
  )
}
