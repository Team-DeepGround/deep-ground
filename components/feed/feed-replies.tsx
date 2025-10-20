"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ImageIcon, Send, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  createFeedReply,
  updateFeedReply,
  deleteFeedReply,
  likeFeedReply,
  unlikeFeedReply,
  fetchFeedReplies,
  FetchFeedReplyResponse
} from "@/lib/api/feed"
import ReactMarkdown from "react-markdown"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { api } from "@/lib/api-client"

interface FeedRepliesProps {
  feedCommentId: number
  onShow?: boolean
}

export function FeedReplies({ feedCommentId, onShow }: FeedRepliesProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [replyStates, setReplyStates] = useState<Record<number, {
    loading: boolean;
    replies: FetchFeedReplyResponse[];
    show: boolean;
  }>>({})
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({})
  const [replyImages, setReplyImages] = useState<Record<number, File[]>>({})
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null)
  const [editReplyContent, setEditReplyContent] = useState("")
  const [editReplyImages, setEditReplyImages] = useState<File[]>([])
  const [editReplyOriginImages, setEditReplyOriginImages] = useState<number[]>([])
  const [friendPopoverOpen, setFriendPopoverOpen] = useState<number | null>(null)
  const [friendLoading, setFriendLoading] = useState(false)
  const [friendError, setFriendError] = useState<string | null>(null)
  const [friendSuccess, setFriendSuccess] = useState<string | null>(null)

  // 컴포넌트가 마운트되거나 onShow가 true일 때 답글 로드
  useEffect(() => {
    if (onShow) {
      console.log('FeedReplies 컴포넌트 마운트 - 자동 답글 로드 시작')
      loadReplies(feedCommentId)
    }
  }, [onShow, feedCommentId])

  // 답글 불러오기
  const loadReplies = async (feedCommentId: number) => {
    console.log('답글 로딩 시작 - feedCommentId:', feedCommentId)
    setReplyStates((prev) => ({
      ...prev,
      [feedCommentId]: { ...(prev[feedCommentId] || {}), loading: true }
    }))
    try {
      const res = await fetchFeedReplies(feedCommentId)
      console.log('답글 API 응답:', res)
      
      if (res.result?.feedReplies) {
        console.log('답글 데이터:', res.result.feedReplies)
        console.log('답글 개수:', res.result.feedReplies.length)
        setReplyStates((prev) => ({
          ...prev,
          [feedCommentId]: {
            loading: false,
            replies: res.result!.feedReplies,
            show: true,
          },
        }))
      } else {
        console.log('답글 데이터가 없음')
        setReplyStates((prev) => ({
          ...prev,
          [feedCommentId]: {
            loading: false,
            replies: [],
            show: true,
          },
        }))
      }
    } catch (e) {
      console.error('답글 로딩 오류:', e)
      setReplyStates((prev) => ({
        ...prev,
        [feedCommentId]: { ...(prev[feedCommentId] || {}), loading: false }
      }))
      toast({ title: "답글 로딩 실패", description: "답글을 불러오지 못했습니다.", variant: "destructive" })
    }
  }

  const handleToggleReplies = async (feedCommentId: number, replyCount: number) => {
    if (!replyStates[feedCommentId]?.show) {
      await loadReplies(feedCommentId)
    } else {
      setReplyStates((prev) => ({
        ...prev,
        [feedCommentId]: { ...prev[feedCommentId], show: false }
      }))
    }
  }

  // 답글 입력값 변경
  const handleReplyInputChange = (feedCommentId: number, value: string) => {
    setReplyInputs((prev) => ({ ...prev, [feedCommentId]: value }))
  }

  // 답글 작성
  const handleCreateReply = async (feedCommentId: number) => {
    const content = replyInputs[feedCommentId]?.trim() || ""
    if (!content) {
      toast({ title: "답글 내용 필요", description: "답글 내용을 입력해주세요.", variant: "destructive" })
      return
    }
    const formData = new FormData()
    formData.append("feedCommentId", String(feedCommentId))
    formData.append("content", content)
    try {
      const result = await createFeedReply(formData)
      toast({ title: "답글 등록", description: "답글이 등록되었습니다." })
      setReplyInputs((prev) => ({ ...prev, [feedCommentId]: "" }))
      await loadReplies(feedCommentId)
    } catch (error) {
      toast({ title: "답글 등록 실패", description: "답글 등록에 실패했습니다.", variant: "destructive" })
    }
  }

  // 답글 수정 모드 진입
  const handleEditReply = (reply: FetchFeedReplyResponse) => {
    setEditingReplyId(reply.feedReplyId)
    setEditReplyContent(reply.content)
    setEditReplyOriginImages([])
    setEditReplyImages([])
  }

  // 답글 수정 취소
  const handleCancelEditReply = () => {
    setEditingReplyId(null)
    setEditReplyContent("")
    setEditReplyImages([])
    setEditReplyOriginImages([])
  }

  // 답글 수정 저장
  const handleUpdateReply = async (feedCommentId: number, feedReplyId: number) => {
    const currentEditImages = editReplyImages || []
    const currentOriginImages = editReplyOriginImages || []
    if (!editReplyContent.trim() && currentEditImages.length === 0 && currentOriginImages.length === 0) {
      toast({ title: "답글 내용 필요", description: "답글 내용을 입력하거나 이미지를 첨부해주세요.", variant: "destructive" })
      return
    }
    const formData = new FormData()
    formData.append("content", editReplyContent)
    currentEditImages.forEach((file) => formData.append("images", file))
    await updateFeedReply(feedReplyId, formData)
    toast({ title: "답글 수정", description: "답글이 수정되었습니다." })
    setEditingReplyId(null)
    setEditReplyContent("")
    setEditReplyImages([])
    setEditReplyOriginImages([])
    await loadReplies(feedCommentId)
  }

  // 답글 삭제
  const handleDeleteReply = async (feedCommentId: number, feedReplyId: number) => {
    if (!window.confirm("답글을 삭제하시겠습니까?")) return
    await deleteFeedReply(feedReplyId)
    toast({ title: "답글 삭제", description: "답글이 삭제되었습니다." })
    await loadReplies(feedCommentId)
  }

  // 답글 좋아요 토글
  const handleLikeReply = async (feedCommentId: number, reply: FetchFeedReplyResponse) => {
    if (reply.liked) {
      await unlikeFeedReply(reply.feedReplyId)
      toast({ title: "답글 좋아요 취소", description: "답글 좋아요를 취소했습니다." })
    } else {
      await likeFeedReply(reply.feedReplyId)
      toast({ title: "답글 좋아요", description: "답글에 좋아요를 표시했습니다." })
    }
    await loadReplies(feedCommentId)
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
    <div className="ml-6 mt-2">
      {replyStates[feedCommentId]?.loading ? (
        <div className="text-xs text-muted-foreground">답글 로딩 중...</div>
      ) : (
        <>
          {replyStates[feedCommentId]?.replies?.length > 0 ? (
            <div className="space-y-2">
              {replyStates[feedCommentId].replies.map((reply) => (
                <div key={reply.feedReplyId} className="flex gap-2 items-start">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={reply.profileImageUrl || "/placeholder.svg"} alt={reply.memberName} />
                    <AvatarFallback>{reply.memberName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-background rounded-md px-2 py-1 border border-muted">
                    <div className="flex items-center gap-2">
                      <Popover open={friendPopoverOpen === reply.feedReplyId} onOpenChange={open => setFriendPopoverOpen(open ? reply.feedReplyId : null)}>
                        <PopoverTrigger asChild>
                          <button className="font-medium text-xs hover:underline focus:outline-none" type="button">
                            {reply.memberName}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-56 p-4">
                          <div className="mb-2 font-semibold">친구 추가</div>
                          <div className="mb-2 text-xs text-muted-foreground">{reply.memberName}님과 친구를 맺어보세요.</div>
                          <Button
                            size="sm"
                            disabled={friendLoading}
                            onClick={() => handleAddFriend(reply.memberId, reply.memberName)}
                            className="w-full"
                          >
                            {friendLoading ? "요청 중..." : "친구 요청 보내기"}
                          </Button>
                          {friendSuccess && <div className="text-green-600 text-xs mt-2">{friendSuccess}</div>}
                          {friendError && <div className="text-destructive text-xs mt-2">{friendError}</div>}
                        </PopoverContent>
                      </Popover>
                      <span className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleDateString()}</span>
                      {/* 좋아요 버튼 */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`ml-2 ${reply.liked ? "text-primary" : ""}`}
                        onClick={() => handleLikeReply(feedCommentId, reply)}
                      >
                        <ThumbsUp className={`h-4 w-4 ${reply.liked ? "fill-primary" : ""}`} />
                        <span className="text-xs ml-1">{reply.likeCount}</span>
                      </Button>
                      {/* 수정/삭제 버튼 (본인만 노출) */}
                      {(user?.id as number) === reply.memberId && (
                        <>
                          {editingReplyId === reply.feedReplyId ? (
                            <>
                              <Button size="icon" variant="ghost" onClick={handleCancelEditReply}><span className="sr-only">취소</span>❌</Button>
                            </>
                          ) : (
                            <>
                              <Button size="icon" variant="ghost" onClick={() => handleEditReply(reply)}><span className="sr-only">수정</span>✏️</Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteReply(feedCommentId, reply.feedReplyId)}><span className="sr-only">삭제</span>🗑️</Button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    {/* 답글 수정 모드 */}
                    {editingReplyId === reply.feedReplyId ? (
                      <div className="mt-2">
                        <Textarea
                          value={editReplyContent}
                          onChange={(e) => setEditReplyContent(e.target.value)}
                          rows={2}
                          className="resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => handleUpdateReply(feedCommentId, reply.feedReplyId)}>저장</Button>
                          <Button size="sm" variant="secondary" onClick={handleCancelEditReply}>취소</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="prose max-w-none text-xs">
                          <ReactMarkdown>{reply.content}</ReactMarkdown>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">답글이 없습니다.</div>
          )}
          {/* 답글 입력창 */}
          <div className="flex gap-2 items-end mt-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user?.profileImageUrl || "/placeholder.svg"} alt={user?.nickname || "사용자"} />
              <AvatarFallback>{user?.nickname?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="답글을 입력하세요"
                rows={2}
                value={replyInputs[feedCommentId] || ""}
                onChange={(e) => handleReplyInputChange(feedCommentId, e.target.value)}
                className="resize-none"
              />
            </div>
            <Button
              size="icon"
              className="mb-2"
              onClick={() => handleCreateReply(feedCommentId)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
} 