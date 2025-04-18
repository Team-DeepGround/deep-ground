"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"
import ChatPopup from "@/components/chat-popup"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = 2 // 읽지 않은 메시지 수 (실제로는 API에서 가져옴)
  const { user } = useAuth() // 로그인 상태 확인을 위해 useAuth 훅 사용

  // 로그인하지 않은 경우 채팅 버튼을 표시하지 않음
  if (!user) return null

  // Update the toggleChat function to handle positioning better
  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={toggleChat} className="h-14 w-14 rounded-full shadow-lg" size="icon">
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MessageSquare className="h-6 w-6" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </>
          )}
        </Button>
      </div>

      {/* 채팅 팝업 */}
      <ChatPopup isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
