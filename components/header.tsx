"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, MessageSquare, Bell, Menu, Users, User, LogIn, Search } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

const navigation = [
  { name: "스터디", href: "/studies", icon: BookOpen },
  { name: "캘린더", href: "/calendar", icon: Calendar },
  { name: "Q&A", href: "/questions", icon: MessageSquare },
  { name: "피드", href: "/feed", icon: Users },
]

export default function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link href="/" className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-bold">DeepGround</span>
                </Link>
              </div>
              <nav className="flex flex-col gap-4 px-2 pt-8">
                {navigation.map((item) => (
                  <SheetClose asChild key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground",
                        pathname.startsWith(item.href) && "bg-accent text-accent-foreground",
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
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <span className="hidden font-bold sm:inline-block">DeepGround</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground",
                  pathname.startsWith(item.href) && "text-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="relative hidden md:block">
              <Input placeholder="검색..." className="w-[200px] pl-8" autoFocus onBlur={() => setSearchOpen(false)} />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="hidden md:flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">검색</span>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">3</Badge>
            <span className="sr-only">알림</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.email || "사용자"} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>프로필</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/friends">
                    <Users className="mr-2 h-4 w-4" />
                    <span>친구</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>로그아웃</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
