"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"
import ChatPopup from "@/components/chat-popup"
import { useAuth } from "@/components/auth-provider"
import { useUnreadChatCount } from "@/hooks/use-unread-chat-count"

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated } = useAuth() // 로그인 상태 확인을 위해 useAuth 훅 사용
  const { unreadCount, isLoading } = useUnreadChatCount() // 읽지 않은 메시지 수

  // 로그인하지 않은 경우 채팅 버튼을 표시하지 않음
  if (!isAuthenticated) return null

  // Update the toggleChat function to handle positioning better
  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button onClick={toggleChat} className="h-14 w-14 rounded-full shadow-lg" size="icon">
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageSquare className="h-6 w-6" />
            )}
          </Button>
          
          {/* 읽지 않은 메시지 개수 배지 */}
          {!isOpen && unreadCount > 0 && !isLoading && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] shadow-lg">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </div>

      {/* 채팅 팝업 */}
      <ChatPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
