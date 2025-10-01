"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Comment, Reply } from "@/types/study"
import { formatDate } from "@/lib/utils"
import { X } from "lucide-react"

interface CommentSectionProps {
  comments: Comment[]
  studyId: number
  onCommentSubmit: (content: string) => Promise<void>
  onReplySubmit: (commentId: number, content: string) => Promise<void>
}

export function CommentSection({
  comments,
  studyId,
  onCommentSubmit,
  onReplySubmit,
}: CommentSectionProps) {
  const { toast } = useToast()
  const [commentText, setCommentText] = useState("")
  const [replyText, setReplyText] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())

  const handleReply = (commentId: number) => {
    setReplyingTo(commentId)
    setExpandedComments((prev) => {
      const next = new Set(prev)
      next.add(commentId)
      return next
    })
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
    setReplyText("")
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast({
        title: "댓글을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    try {
      await onCommentSubmit(commentText)
      setCommentText("")
      toast({
        title: "댓글이 작성되었습니다",
      })
    } catch (error) {
      toast({
        title: "댓글 작성에 실패했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      })
    }
  }

  const handleSubmitReply = async (commentId: number) => {
    if (!replyText.trim()) {
      toast({
        title: "답글을 입력해주세요",
        variant: "destructive",
      })
      return
    }

    try {
      await onReplySubmit(commentId, replyText)
      setReplyText("")
      setReplyingTo(null)
      toast({
        title: "답글이 작성되었습니다",
      })
    } catch (error) {
      toast({
        title: "답글 작성에 실패했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      })
    }
  }

  const toggleReplies = (commentId: number) => {
    setExpandedComments((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.commentId} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>
                    {comment.nickname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {comment.nickname}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReply(comment.commentId)}
                  >
                    답글
                  </Button>
                </div>
              </div>

              {replyingTo === comment.commentId && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">
                      {comment.nickname}님의 댓글에 답글 작성
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelReply}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    placeholder="답글을 입력하세요"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[100px] mb-2"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSubmitReply(comment.commentId)}
                    >
                      답글 작성
                    </Button>
                  </div>
                </div>
              )}

              {comment.replies.length > 0 && (
                <div className="space-y-3">
                  {expandedComments.has(comment.commentId) ? (
                    comment.replies.map((reply) => (
                      <div
                        key={reply.replyId}
                        className="bg-muted/50 rounded-lg p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {reply.nickname[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {reply.nickname}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(reply.createdAt)}
                              </div>
                            </div>
                            <p className="text-sm">{reply.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReplies(comment.commentId)}
                    >
                      답글 {comment.replies.length}개 보기
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="댓글을 입력하세요"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmitComment}>
            댓글 작성
          </Button>
        </div>
      </div>
    </div>
  )
} 