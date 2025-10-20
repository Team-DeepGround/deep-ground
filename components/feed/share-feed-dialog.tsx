"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { shareFeed } from "@/lib/api/feed"
import { FetchFeedResponse } from "@/lib/api/feed"
import ReactMarkdown from "react-markdown"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { api } from "@/lib/api-client"

interface ShareFeedDialogProps {
  isOpen: boolean
  onClose: () => void
  originalFeed: FetchFeedResponse
  onSuccess: () => void
}

export function ShareFeedDialog({ isOpen, onClose, originalFeed, onSuccess }: ShareFeedDialogProps) {
  const { toast } = useToast()
  const [content, setContent] = useState("")
  const [isSharing, setIsSharing] = useState(false)
  const [friendPopoverOpen, setFriendPopoverOpen] = useState(false)
  const [friendLoading, setFriendLoading] = useState(false)
  const [friendError, setFriendError] = useState<string | null>(null)
  const [friendSuccess, setFriendSuccess] = useState<string | null>(null)

  const handleShare = async () => {
    if (!content.trim()) {
      toast({ title: "내용 필요", description: "공유할 내용을 입력해주세요.", variant: "destructive" })
      return
    }

    if (isSharing) return

    setIsSharing(true)
    try {
      await shareFeed(content, originalFeed.feedId)
      toast({ title: "피드 공유", description: "피드를 성공적으로 공유했습니다." })
      setContent("")
      onSuccess()
      onClose()
    } catch (error) {
      toast({ title: "공유 실패", description: "피드 공유에 실패했습니다.", variant: "destructive" })
    } finally {
      setIsSharing(false)
    }
  }

  const handleClose = () => {
    setContent("")
    onClose()
  }

  const handleAddFriend = async (memberId: number, memberName: string) => {
    setFriendLoading(true)
    setFriendError(null)
    setFriendSuccess(null)
    try {
      const res = await api.get(`/members/${memberId}`)
      const email = res?.result?.email
      if (!email) throw new Error("이메일 정보를 찾을 수 없습니다.")
      const response = await api.post('/friends/request', { receiverEmail: email })
      if (response?.status === 200) {
        setFriendSuccess(`${memberName}님에게 친구 요청을 보냈습니다.`)
      } else {
        setFriendError(response?.message || "친구 요청에 실패했습니다.")
      }
    } catch (e: any) {
      setFriendError(e?.message || "친구 요청에 실패했습니다.")
    } finally {
      setFriendLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>피드 공유하기</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 원본 피드 미리보기 */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {originalFeed.memberId && originalFeed.memberName ? (
                <Popover open={friendPopoverOpen} onOpenChange={setFriendPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button className="text-sm font-medium text-gray-600 hover:underline focus:outline-none" type="button">
                      {originalFeed.memberName}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-56 p-4">
                    <div className="mb-2 font-semibold">친구 추가</div>
                    <div className="mb-2 text-xs text-muted-foreground">{originalFeed.memberName}님과 친구를 맺어보세요.</div>
                    <Button
                      size="sm"
                      disabled={friendLoading}
                      onClick={() => handleAddFriend(originalFeed.memberId, originalFeed.memberName)}
                      className="w-full"
                    >
                      {friendLoading ? "요청 중..." : "친구 요청 보내기"}
                    </Button>
                    {friendSuccess && <div className="text-green-600 text-xs mt-2">{friendSuccess}</div>}
                    {friendError && <div className="text-destructive text-xs mt-2">{friendError}</div>}
                  </PopoverContent>
                </Popover>
              ) : (
                <span className="text-sm font-medium text-gray-600">원본 피드</span>
              )}
            </div>
            <div className="prose max-w-none text-sm text-gray-700 line-clamp-3">
              <ReactMarkdown>{originalFeed.content}</ReactMarkdown>
            </div>
            {originalFeed.mediaUrls && originalFeed.mediaUrls.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">📷 이미지 {originalFeed.mediaUrls.length}개</p>
            )}
          </div>

          {/* 공유할 내용 입력 */}
          <div>
            <label className="text-sm font-medium mb-2 block">공유할 내용</label>
            <Textarea
              placeholder="이 피드에 대한 생각을 공유해보세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSharing}>
            취소
          </Button>
          <Button onClick={handleShare} disabled={isSharing}>
            {isSharing ? "공유 중..." : "공유하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 