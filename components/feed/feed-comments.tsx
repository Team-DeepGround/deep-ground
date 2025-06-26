"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ImageIcon, Send, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import {
  fetchFeedComments,
  createFeedComment,
  updateFeedComment,
  deleteFeedComment,
  likeFeedComment,
  unlikeFeedComment,
  getFeedCommentMediaUrl,
  getProfileMediaUrl,
  createFeedReply,
  updateFeedReply,
  deleteFeedReply,
  likeFeedReply,
  unlikeFeedReply,
  fetchFeedReplies,
  getFeedReplyMediaUrl,
  FetchFeedCommentResponse,
  FetchFeedReplyResponse
} from "@/lib/api/feed"
import { FeedReplies } from "./feed-replies"
import { AuthImage } from "@/components/ui/auth-image"

interface FeedCommentsProps {
  feedId: number
  onShow?: boolean
}

export function FeedComments({ feedId, onShow }: FeedCommentsProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})
  const [commentImages, setCommentImages] = useState<Record<number, File[]>>({})
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({})
  const [comments, setComments] = useState<Record<number, FetchFeedCommentResponse[]>>({})
  const [showComments, setShowComments] = useState<Record<number, boolean>>({})
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentContent, setEditCommentContent] = useState("")
  const [editCommentImages, setEditCommentImages] = useState<File[]>([])
  const [editCommentOriginImages, setEditCommentOriginImages] = useState<number[]>([])

  // 컴포넌트가 마운트되거나 onShow가 true일 때 댓글 로드
  useEffect(() => {
    if (onShow) {
      console.log('FeedComments 컴포넌트 마운트 - 자동 댓글 로드 시작')
      loadComments(feedId)
    }
  }, [onShow, feedId])

  // 댓글 불러오기
  const loadComments = async (feedId: number) => {
    console.log('댓글 로딩 시작 - feedId:', feedId)
    setCommentLoading((prev) => ({ ...prev, [feedId]: true }))
    try {
      const res = await fetchFeedComments(feedId)
      console.log('댓글 API 응답:', res)
      
      if (res.result?.feedComments) {
        console.log('댓글 데이터:', res.result.feedComments)
        console.log('댓글 개수:', res.result.feedComments.length)
        setComments((prev) => ({ ...prev, [feedId]: res.result!.feedComments }))
      } else {
        console.log('댓글 데이터가 없음')
        setComments((prev) => ({ ...prev, [feedId]: [] }))
      }
    } catch (error) {
      console.error('댓글 로딩 오류:', error)
    } finally {
      setCommentLoading((prev) => ({ ...prev, [feedId]: false }))
    }
  }

  // 댓글 입력값 변경
  const handleCommentInputChange = (feedId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [feedId]: value }))
  }

  // 댓글 이미지 선택
  const handleCommentImageChange = (feedId: number, files: FileList | null) => {
    setCommentImages((prev) => ({ ...prev, [feedId]: files ? Array.from(files) : [] }))
  }

  // 댓글 작성
  const handleCreateComment = async (feedId: number) => {
    const content = commentInputs[feedId]?.trim() || ""
    const currentImages = commentImages[feedId] || []
    if (!content && currentImages.length === 0) {
      toast({ title: "댓글 내용 필요", description: "댓글 내용을 입력하거나 이미지를 첨부해주세요.", variant: "destructive" })
      return
    }
    const formData = new FormData()
    formData.append("feedId", String(feedId))
    formData.append("content", content)
    if (currentImages.length > 0) {
      currentImages.forEach((file) => formData.append("images", file))
    }
    await createFeedComment(formData)
    toast({ title: "댓글 등록", description: "댓글이 등록되었습니다." })
    setCommentInputs((prev) => ({ ...prev, [feedId]: "" }))
    setCommentImages((prev) => ({ ...prev, [feedId]: [] }))
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
    console.log('답글 토글 클릭 - feedCommentId:', feedCommentId)
    console.log('현재 showComments 상태:', showComments)
    console.log('현재 feedCommentId의 상태:', showComments[feedCommentId])
    
    setShowComments((prev) => {
      const newState = { ...prev, [feedCommentId]: !prev[feedCommentId] }
      console.log('새로운 showComments 상태:', newState)
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
    setEditCommentOriginImages(comment.mediaIds || [])
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

  return (
    <div className="px-4 pb-4">
      {/* 댓글 목록 */}
      {commentLoading[feedId] ? (
        <div className="text-muted-foreground text-sm py-2">댓글 로딩 중...</div>
      ) : comments[feedId] && comments[feedId].length > 0 ? (
        <div className="space-y-3 mb-2">
          {comments[feedId].map((comment) => (
            <div key={comment.feedCommentId} className="flex gap-2 items-start">
              <Avatar className="h-8 w-8">
                {comment.profileImageId ? (
                  <AuthImage 
                    mediaId={comment.profileImageId} 
                    type="profile" 
                    alt={comment.memberName} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <AvatarImage src="/placeholder.svg" alt={comment.memberName} />
                )}
                <AvatarFallback>{comment.memberName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-muted rounded-md px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.memberName}</span>
                  <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  {/* 좋아요 버튼 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`ml-2 ${comment.liked ? "text-primary" : ""}`}
                    onClick={() => handleLikeComment(feedId, comment)}
                  >
                    <ThumbsUp className={`h-4 w-4 ${comment.liked ? "fill-primary" : ""}`} />
                    <span className="text-xs ml-1">{comment.likeCount}</span>
                  </Button>
                  {/* 수정/삭제 버튼 (본인만 노출) */}
                  {(user?.id as number) === comment.memberId && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleEditComment(comment)}><span className="sr-only">수정</span>✏️</Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteComment(feedId, comment.feedCommentId)}><span className="sr-only">삭제</span>🗑️</Button>
                    </>
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
                    {/* 기존 이미지 미리보기 */}
                    {(editCommentOriginImages || []).length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {(editCommentOriginImages || []).map((id, idx) => (
                          <AuthImage 
                            key={id} 
                            mediaId={id} 
                            type="comment" 
                            alt="댓글 이미지" 
                            className="h-12 rounded" 
                          />
                        ))}
                      </div>
                    )}
                    {/* 새로 첨부한 이미지 미리보기 */}
                    {(editCommentImages || []).length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {(editCommentImages || []).map((file, idx) => (
                          <div key={idx} className="relative">
                            <img src={URL.createObjectURL(file)} alt="첨부 이미지" className="h-12 rounded" />
                            <button
                              type="button"
                              className="absolute top-0 right-0 bg-white/80 rounded-full p-0.5"
                              onClick={() => setEditCommentImages((prev) => (prev || []).filter((_, i) => i !== idx))}
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id={`edit-comment-image-input-${comment.feedCommentId}`}
                      style={{ display: "none" }}
                      onChange={(e) => setEditCommentImages(e.target.files ? Array.from(e.target.files) : [])}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => document.getElementById(`edit-comment-image-input-${comment.feedCommentId}`)?.click()}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleUpdateComment(feedId, comment.feedCommentId)}>저장</Button>
                      <Button size="sm" variant="secondary" onClick={handleCancelEditComment}>취소</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm whitespace-pre-line">{comment.content}</div>
                    {comment.mediaIds && comment.mediaIds.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {comment.mediaIds.map((id) => (
                          <AuthImage 
                            key={id} 
                            mediaId={id} 
                            type="comment" 
                            alt="댓글 이미지" 
                            className="h-16 rounded" 
                          />
                        ))}
                      </div>
                    )}
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
          <AvatarImage src="/placeholder.svg" alt={user?.email || "사용자"} />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="댓글을 입력하세요"
            rows={2}
            value={commentInputs[feedId] || ""}
            onChange={(e) => handleCommentInputChange(feedId, e.target.value)}
            className="resize-none"
          />
          {/* 이미지 미리보기 */}
          {(commentImages[feedId] || []).length > 0 && (
            <div className="flex gap-2 mt-1">
              {(commentImages[feedId] || []).map((file, idx) => (
                <div key={idx} className="relative">
                  <img src={URL.createObjectURL(file)} alt="첨부 이미지" className="h-12 rounded" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-white/80 rounded-full p-0.5"
                    onClick={() => setCommentImages((prev) => ({ ...prev, [feedId]: (prev[feedId] || []).filter((_, i) => i !== idx) }))}
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          id={`comment-image-input-${feedId}`}
          style={{ display: "none" }}
          onChange={(e) => handleCommentImageChange(feedId, e.target.files)}
        />
        <Button
          variant="outline"
          size="icon"
          className="mb-2"
          onClick={() => document.getElementById(`comment-image-input-${feedId}`)?.click()}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
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