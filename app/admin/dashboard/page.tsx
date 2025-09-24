"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { User, AlertTriangle, FileText } from "lucide-react"

interface AdminDashboardStatsResponse {
  totalMembers: number
  newMembersToday: number
  totalPosts: number
  totalStudyGroups: number
  totalReports: number
  todayReports: number
  pendingReports: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const router = useRouter()

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
        const response = await axios.get("/api/v1/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setStats(response.data.result)
      } catch (error) {
        console.error("대시보드 통계 로딩 실패:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  if (unauthorized) return null

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  const chartData = [
    { name: "전체 신고", value: stats.totalReports },
    { name: "오늘 신고", value: stats.todayReports },
    { name: "검토 필요", value: stats.pendingReports },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 관리자 대시보드</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard title="전체 회원 수" value={stats.totalMembers} icon={<User className="text-blue-600" />} />
        <StatCard title="오늘 가입" value={stats.newMembersToday} icon={<User className="text-green-600" />} />
        <StatCard title="전체 피드 수" value={stats.totalPosts} icon={<FileText className="text-purple-600" />} />
        <StatCard title="전체 스터디 수" value={stats.totalStudyGroups} icon={<User className="text-teal-600" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            신고 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}