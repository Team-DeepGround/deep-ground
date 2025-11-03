"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ImageIcon, Send, X, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  fetchFeedComments,
  createFeedComment,
  updateFeedComment,
  deleteFeedComment,
  likeFeedComment,
  unlikeFeedComment,
  createFeedReply,
  updateFeedReply,
  deleteFeedReply,
  likeFeedReply,
  unlikeFeedReply,
  fetchFeedReplies,
  FetchFeedCommentResponse,
  FetchFeedReplyResponse
} from "@/lib/api/feed"
import { FeedReplies } from "./feed-replies"
import ReactMarkdown from "react-markdown"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api-client"

interface FeedCommentsProps {
  feedId: number
  onShow?: boolean
}

export function FeedComments({ feedId, onShow }: FeedCommentsProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [commentImages, setCommentImages] = useState<Record<number, File[]>>({})
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({})
  const [comments, setComments] = useState<Record<number, FetchFeedCommentResponse[]>>({})
  const [showComments, setShowComments] = useState<Record<number, boolean>>({})
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentContent, setEditCommentContent] = useState("")
  const [editCommentImages, setEditCommentImages] = useState<File[]>([])
  const [editCommentOriginImages, setEditCommentOriginImages] = useState<number[]>([])
  const [friendPopoverOpen, setFriendPopoverOpen] = useState<number | null>(null)
  const [friendLoading, setFriendLoading] = useState(false)
  const [friendError, setFriendError] = useState<string | null>(null)
  const [friendSuccess, setFriendSuccess] = useState<string | null>(null)

  // 컴포넌트가 마운트되거나 onShow가 true일 때 댓글 로드
  useEffect(() => {
    if (onShow) {
      loadComments(feedId)
    }
  }, [onShow, feedId])

  // 댓글 불러오기
  const loadComments = async (feedId: number) => {
    setCommentLoading((prev) => ({ ...prev, [feedId]: true }))
    try {
      const res = await fetchFeedComments(feedId)
      
      if (res.result?.feedComments) {
        setComments((prev) => ({ ...prev, [feedId]: res.result!.feedComments }))
      } else {
        setComments((prev) => ({ ...prev, [feedId]: [] }))
      }
    } catch (error) {
    } finally {
      setCommentLoading((prev) => ({ ...prev, [feedId]: false }))
    }
  }

  // 댓글 입력값 변경
  const handleCommentInputChange = (feedId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [feedId]: value }))
  }

  // 댓글 작성
  const handleCreateComment = async (feedId: number) => {
    const content = commentInputs[feedId]?.trim() || ""
    if (!content) {
      toast({ title: "댓글 내용 필요", description: "댓글 내용을 입력해주세요.", variant: "destructive" })
      return
    }
    const formData = new FormData()
    formData.append("feedId", String(feedId))
    formData.append("content", content)
    await createFeedComment(formData)
    toast({ title: "댓글 등록", description: "댓글이 등록되었습니다." })
    setCommentInputs((prev) => ({ ...prev, [feedId]: "" }))
    await loadComments(feedId)
  }

  // 댓글 토글
  const handleToggleComments = async (feedId: number) => {
    setShowComments((prev) => ({ ...prev, [feedId]: !prev[feedId] }))
    if (!showComments[feedId]) {
      await loadComments(feedId)
    }
  }

  // 답글 토글
  const handleToggleReplies = async (feedCommentId: number) => {
    
    setShowComments((prev) => {
      const newState = { ...prev, [feedCommentId]: !prev[feedCommentId] }
      return newState
    })
  }

  // 댓글 좋아요 토글
  const handleLikeComment = async (feedId: number, comment: FetchFeedCommentResponse) => {
    if (comment.liked) {
      await unlikeFeedComment(comment.feedCommentId)
      toast({ title: "댓글 좋아요 취소", description: "댓글 좋아요를 취소했습니다." })
    } else {
      await likeFeedComment(comment.feedCommentId)
      toast({ title: "댓글 좋아요", description: "댓글에 좋아요를 표시했습니다." })
    }
    await loadComments(feedId)
  }

  // 댓글 삭제
  const handleDeleteComment = async (feedId: number, feedCommentId: number) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return
    await deleteFeedComment(feedCommentId)
    toast({ title: "댓글 삭제", description: "댓글이 삭제되었습니다." })
    await loadComments(feedId)
  }

  // 댓글 수정 모드 진입
  const handleEditComment = (comment: FetchFeedCommentResponse) => {
    setEditingCommentId(comment.feedCommentId)
    setEditCommentContent(comment.content)
    setEditCommentOriginImages([])
    setEditCommentImages([])
  }

  // 댓글 수정 취소
  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditCommentContent("")
    setEditCommentImages([])
    setEditCommentOriginImages([])
  }

  // 댓글 수정 저장
  const handleUpdateComment = async (feedId: number, feedCommentId: number) => {
    const currentEditImages = editCommentImages || []
    const currentOriginImages = editCommentOriginImages || []
    if (!editCommentContent.trim() && currentEditImages.length === 0 && currentOriginImages.length === 0) {
      toast({ title: "댓글 내용 필요", description: "댓글 내용을 입력하거나 이미지를 첨부해주세요.", variant: "destructive" })
      return
    }
    const formData = new FormData()
    formData.append("content", editCommentContent)
    currentEditImages.forEach((file) => formData.append("images", file))
    await updateFeedComment(feedCommentId, formData)
    toast({ title: "댓글 수정", description: "댓글이 수정되었습니다." })
    setEditingCommentId(null)
    setEditCommentContent("")
    setEditCommentImages([])
    setEditCommentOriginImages([])
    await loadComments(feedId)
  }

  const handleAddFriend = async (publicId: string, memberName: string) => {
    setFriendLoading(true)
    setFriendError(null)
    setFriendSuccess(null)
    try {
      const res = await api.get(`/members/profile/${publicId}`)
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
    <div className="px-4 pt-4 pb-4">
      {/* 댓글 목록 */}
      {commentLoading[feedId] ? (
        <div className="text-muted-foreground text-sm py-2">댓글 로딩 중...</div>
      ) : comments[feedId] && comments[feedId].length > 0 ? (
        <div className="space-y-3 mb-2">
          {comments[feedId].map((comment) => (
            <div key={comment.feedCommentId} className="flex gap-2 items-start">
              {user?.publicId === comment.publicId ? (
                // 내 댓글인 경우: 클릭 불가
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profileImageUrl || "/placeholder.svg"} alt={comment.memberName} />
                  <AvatarFallback>{comment.memberName[0]}</AvatarFallback>
                </Avatar>
              ) : (
                // 다른 사람 댓글인 경우: 클릭 가능
                <button onClick={() => router.push(`/profile/${comment.publicId}`)} className="flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profileImageUrl || "/placeholder.svg"} alt={comment.memberName} />
                    <AvatarFallback>{comment.memberName[0]}</AvatarFallback>
                  </Avatar>
                </button>
              )}
              <div className="flex-1">
                <div className="bg-muted rounded-md px-3 py-2 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {user?.publicId === comment.publicId ? (
                        <span className="font-medium text-sm">{comment.memberName}</span>
                      ) : (
                        <Popover open={friendPopoverOpen === comment.feedCommentId} onOpenChange={open => setFriendPopoverOpen(open ? comment.feedCommentId : null)}>
                          <PopoverTrigger asChild>
                            <button onClick={() => router.push(`/profile/${comment.publicId}`)} className="font-medium text-sm hover:underline focus:outline-none" type="button">
                              {comment.memberName}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-56 p-4">
                            <div className="mb-2 font-semibold">친구 추가</div>
                            <div className="mb-2 text-xs text-muted-foreground">{comment.memberName}님과 친구를 맺어보세요.</div>
                            <Button
                              size="sm"
                              disabled={friendLoading}
                              onClick={() => handleAddFriend(comment.publicId, comment.memberName)}
                              className="w-full"
                            >
                              {friendLoading ? "요청 중..." : "친구 요청 보내기"}
                            </Button>
                            {friendSuccess && <div className="text-green-600 text-xs mt-2">{friendSuccess}</div>}
                            {friendError && <div className="text-destructive text-xs mt-2">{friendError}</div>}
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    {/* 더보기 버튼 (수정/삭제) */}
                    {user?.publicId === comment.publicId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>수정</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteComment(feedId, comment.feedCommentId)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>삭제</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                {/* 댓글 수정 모드 */}
                {editingCommentId === comment.feedCommentId ? (
                  <div className="mt-2">
                    <Textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleUpdateComment(feedId, comment.feedCommentId)}>저장</Button>
                      <Button size="sm" variant="secondary" onClick={handleCancelEditComment}>취소</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="prose max-w-none text-sm mt-1">
                      <ReactMarkdown>{comment.content}</ReactMarkdown>
                    </div>
                    {/* 답글 n개 불러오기 버튼 */}
                    {comment.replyCount > 0 && (
                      <button
                        className="text-xs text-muted-foreground mt-2 ml-1 hover:underline"
                        style={{ fontWeight: 500, background: "none", border: "none", padding: 0, cursor: "pointer" }}
                        onClick={() => handleToggleReplies(comment.feedCommentId)}
                      >
                        답글 {comment.replyCount}개 불러오기
                      </button>
                    )}
                    {/* 답글 목록 렌더링 */}
                    {showComments[comment.feedCommentId] && (
                      <FeedReplies feedCommentId={comment.feedCommentId} onShow={true} />
                    )}
                  </>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center">
                    {/* 좋아요 버튼 */}
                    <Button
                      variant="ghost"
                      className={`h-auto p-1 text-xs ${comment.liked ? "text-primary" : "text-muted-foreground"}`}
                      onClick={() => handleLikeComment(feedId, comment)}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.liked ? "fill-primary" : ""}`} />
                      <span>{comment.likeCount}</span>
                    </Button>
                  </div>
                </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm py-2">댓글이 없습니다.</div>
      )}
      {/* 댓글 입력창 */}
      <div className="flex gap-2 items-end mt-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.profileImageUrl || "/placeholder.svg"} alt={user?.nickname || "사용자"} />
          <AvatarFallback>{user?.nickname?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="댓글을 입력하세요"
            rows={2}
            value={commentInputs[feedId] || ""}
            onChange={(e) => handleCommentInputChange(feedId, e.target.value)}
            className="resize-none"
          />
        </div>
        <Button
          size="icon"
          className="mb-2"
          onClick={() => handleCreateComment(feedId)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 