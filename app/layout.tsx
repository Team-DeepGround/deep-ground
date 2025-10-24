import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import AuthProvider from "@/components/auth-provider"
import { NotificationProvider } from "@/components/notification/notification-provider"
import OnlineStatusProvider from "@/components/online-status-provider"
import FloatingChatButton from "@/components/floating-chat-button"
import { ChatProvider } from "@/components/chat/chat-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Studen - 개발자들의 성장 놀이터",
  description: "개발자들이 함께 공부하고, 질문하고, 성장하는 온라인 커뮤니티",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <NotificationProvider>
              <OnlineStatusProvider>
                <ChatProvider>
                  <div className="flex min-h-screen flex-col">
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Toaster />
                    <FloatingChatButton />
                  </div>
                </ChatProvider>
              </OnlineStatusProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
