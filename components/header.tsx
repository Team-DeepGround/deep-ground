"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  Calendar,
  MessageSquare,
  Bell,
  Menu,
  Users,
  User,
  Shield,
  LogOut,
  LogIn,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { useNotificationContext } from "./notification/notification-provider"
import { useUnreadChatCount } from "@/hooks/use-unread-chat-count"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { NotificationDropdown } from "./notification/notification-dropdown"
import { api } from "@/lib/api-client"

const navigation = [
  { name: "스터디", href: "/studies", icon: BookOpen },
  { name: "캘린더", href: "/calendar", icon: Calendar },
  { name: "Q&A", href: "/questions", icon: MessageSquare },
  { name: "피드", href: "/feed", icon: Users },
]

export default function Header() {
  const pathname = usePathname()
  const { isAuthenticated, logout, role } = useAuth()
  const { unreadCount, isConnected } = useNotificationContext()
  const { unreadCount: chatUnreadCount } = useUnreadChatCount()

  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string>("")

  // ✅ 로그인 상태일 때 프로필 이미지 불러오기
  useEffect(() => {
    if (!isAuthenticated) return
    ;(async () => {
      try {
        const res = await api.get("/members/profile/me")
        console.log("백엔드에서 받은 프로필 이미지:", res?.result?.profileImage)
        setProfileImage(res?.result?.profileImage || null)
        setNickname(res?.result?.nickname || "")
      } catch (e) {
        console.error("프로필 불러오기 실패:", e)
      }
    })()
  }, [isAuthenticated])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-screen-2xl mx-auto px-4 flex h-16 items-center justify-between">
        {/* 좌측 네비게이션 */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* 모바일 메뉴 */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link href="/" className="flex items-center gap-2">
                  <img
                    src="/studen-logo.png"
                    alt="Studen"
                    className="w-auto"
                    style={{ height: "68px" }}
                  />
                </Link>
              </div>
              <nav className="flex flex-col gap-4 px-2 pt-8">
                {navigation.map((item) => (
                  <SheetClose asChild key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground",
                        pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/studen-logo.png"
              alt="Studen"
              className="w-auto"
              style={{ height: "130px" }}
            />
          </Link>

          {/* 상단 메뉴 */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground",
                  pathname.startsWith(item.href) && "text-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
            {role === "ROLE_ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive"
              >
                <Shield className="h-4 w-4" />
                관리자
              </Link>
            )}
          </nav>
        </div>

        {/* 우측 영역 */}
        <div className="flex items-center gap-2">
          {/* 알림 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="relative group hover:bg-accent/50 transition-colors"
            onClick={() => setNotificationOpen(!notificationOpen)}
          >
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
            {!isConnected && isAuthenticated && (
              <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse shadow-sm border border-white" />
            )}
          </Button>

          {/* 로그인 전 */}
          {!isAuthenticated ? (
            <Button asChild variant="default" size="sm">
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Link>
            </Button>
          ) : (
            /* 로그인 후: 프로필 드롭다운 */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8 border border-gray-200 shadow-sm">
                    {profileImage ? (
                      <AvatarImage
                        src={profileImage}
                        alt="프로필 이미지"
                        onError={() => setProfileImage(null)}
                      />
                    ) : (
                      <AvatarFallback>
                        {nickname ? nickname.charAt(0) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>프로필</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/friends" className="cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      <span>친구</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/studies/my" className="cursor-pointer">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>내 스터디</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 알림 드롭다운 */}
      <NotificationDropdown
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </header>
  )
}
