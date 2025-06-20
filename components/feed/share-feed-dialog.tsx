"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { shareFeed } from "@/lib/api-client"
import { FetchFeedResponse } from "@/lib/api-types"

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
              <span className="text-sm font-medium text-gray-600">원본 피드</span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-3">{originalFeed.content}</p>
            {originalFeed.mediaIds && originalFeed.mediaIds.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">📷 이미지 {originalFeed.mediaIds.length}개</p>
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