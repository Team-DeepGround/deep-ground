"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api-client"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { User, AlertTriangle, FileText, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 문의 상태 타입 (백엔드 enum과 동일하게)
type InquiryStatus = "PENDING" | "IN_PROGRESS" | "ANSWERED" | "CLOSED"

interface AdminDashboardStatsResponse {
  totalMembers: number
  newMembersToday: number
  totalPosts: number
  totalStudyGroups: number
  totalReports: number
  todayReports: number
  pendingReports: number
}

interface AdminInquirySummary {
  id: number
  title: string
  status: InquiryStatus
  createdAt: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStatsResponse | null>(null)

  // 문의 통계 추가
  const [inquiryList, setInquiryList] = useState<AdminInquirySummary[]>([])
  const [inqLoading, setInqLoading] = useState(true)

  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      const token = await auth.getToken()
      const role = await auth.getRole()

      if (!token || role !== "ROLE_ADMIN") {
        setUnauthorized(true)
        router.replace("/") // 관리자가 아니면 홈으로
        return
      }

      try {
        // ✅ 대시보드 기본 통계
        const response = await api.get<{ result: AdminDashboardStatsResponse }>("/admin/dashboard")
        setStats(response.result)

        // ✅ 문의 목록(전체) 불러와서 클라에서 개수만 집계
        setInqLoading(true)
        const inqRes = await api.get<{ result: AdminInquirySummary[] }>("/admin/inquiries")
        setInquiryList(inqRes.result ?? [])
      } catch (error) {
        console.error("대시보드 통계 로딩 실패:", error)
        toast({
          title: "대시보드 로딩 실패",
          description: "통계를 불러오는 중 문제가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setInqLoading(false)
      }
    }

    fetchStats()
  }, [router, toast])

  if (unauthorized) return null

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  // ---- 문의 통계 계산 ----
  const totalInquiries = inquiryList.length
  const pendingCount = inquiryList.filter(i => i.status === "PENDING").length
  const inProgressCount = inquiryList.filter(i => i.status === "IN_PROGRESS").length
  const answeredCount = inquiryList.filter(i => i.status === "ANSWERED").length
  const closedCount = inquiryList.filter(i => i.status === "CLOSED").length

  // 기존 신고 차트
  const reportChartData = [
    { name: "전체 신고", value: stats.totalReports },
    { name: "오늘 신고", value: stats.todayReports },
    { name: "검토 필요", value: stats.pendingReports },
  ]

  // 문의 상태 차트
  const inquiryChartData = [
    { name: "접수", value: pendingCount },
    { name: "진행중", value: inProgressCount },
    { name: "답변완료", value: answeredCount },
    { name: "종결", value: closedCount },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📊 관리자 대시보드</h1>

      {/* 1) 회원/피드/스터디 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="전체 회원 수" value={stats.totalMembers} icon={<User className="text-blue-600" />} />
        <StatCard title="오늘 가입" value={stats.newMembersToday} icon={<User className="text-green-600" />} />
        <StatCard title="전체 피드 수" value={stats.totalPosts} icon={<FileText className="text-purple-600" />} />
        <StatCard title="전체 스터디 수" value={stats.totalStudyGroups} icon={<User className="text-teal-600" />} />
      </div>

      {/* 2) 신고 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            신고 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3) 문의 통계 요약 + 차트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="전체 문의"
          value={totalInquiries}
          icon={<HelpCircle className="text-sky-600" />}
          loading={inqLoading}
        />
        <StatCard title="접수" value={pendingCount} icon={<HelpCircle className="text-gray-500" />} loading={inqLoading} />
        <StatCard
          title="진행중"
          value={inProgressCount}
          icon={<HelpCircle className="text-amber-600" />}
          loading={inqLoading}
        />
        <StatCard
          title="답변완료"
          value={answeredCount}
          icon={<HelpCircle className="text-emerald-600" />}
          loading={inqLoading}
        />
        <StatCard title="종결" value={closedCount} icon={<HelpCircle className="text-rose-600" />} loading={inqLoading} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="text-sky-600" />
            문의 상태 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inqLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inquiryChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string
  value: number
  icon: React.ReactNode
  loading?: boolean
}) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-24 rounded-md" /> : <p className="text-3xl font-bold">{value}</p>}
      </CardContent>
    </Card>
  )
}
