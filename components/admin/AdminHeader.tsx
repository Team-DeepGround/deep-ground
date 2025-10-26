"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShieldAlert,
  ListOrdered,
  HelpCircle, // ✅ 문의 관리 아이콘
} from "lucide-react"

const adminNavigation = [
  { name: "대시보드", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "전체 신고 내역", href: "/admin/reports/all", icon: ListOrdered },
  { name: "검토할 신고 목록", href: "/admin/reports", icon: ShieldAlert },
  { name: "문의 관리", href: "/admin/inquiries", icon: HelpCircle }, // ✅ 추가
]

export default function AdminHeader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="max-w-screen-xl mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-bold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          Admin Dashboard
        </Link>
        <nav className="flex gap-6">
          {adminNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground",
                pathname.startsWith(item.href) && "text-foreground font-semibold"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
