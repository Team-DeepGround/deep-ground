"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal, ImageIcon, Send, X, Repeat, Trash2, Pencil } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  likeFeed,
  unlikeFeed,
  deleteFeed,
  updateFeed,
  FetchFeedResponse
} from "@/lib/api/feed"
import { FeedComments } from "./feed-comments"
import { ShareFeedDialog } from "./share-feed-dialog"
import { AuthImage } from "@/components/ui/auth-image"
import { ReportModal } from "@/components/report/report-modal"
import ReactMarkdown from "react-markdown"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api-client"
import { useAuth } from "@/components/auth-provider"

interface FeedPostProps {
  post: FetchFeedResponse
  onRefresh: () => void
}

export function FeedPost({ post: initialPost, onRefresh }: FeedPostProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const [post, setPost] = useState(initialPost)
  const [showComments, setShowComments] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [friendPopoverOpen, setFriendPopoverOpen] = useState(false)
  const [friendLoading, setFriendLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [friendError, setFriendError] = useState<string | null>(null)
  const [friendSuccess, setFriendSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const [editedImages, setEditedImages] = useState<File[]>([])
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 좋아요/좋아요 취소
  const handleLike = async (feedId: number, liked: boolean) => {
    if (liked) {
      await unlikeFeed(feedId)
      toast({ title: "좋아요 취소", description: "게시물에 좋아요를 취소했습니다." })
      setPost((prev) => ({
        ...prev,
        liked: false,
        likeCount: prev.likeCount - 1
      }))
    } else {
      await likeFeed(feedId)
      toast({ title: "좋아요", description: "게시물에 좋아요를 표시했습니다." })
      setPost((prev) => ({
        ...prev,
        liked: true,
        likeCount: prev.likeCount + 1
      }))
    }
  }

  // 공유 다이얼로그 열기
  const handleShareClick = () => {
    setShowShareDialog(true)
  }

  // 공유 성공 시 전체 피드 리프레시
  const handleShareSuccess = () => {
    setShowShareDialog(false)
    onRefresh()
  }

  // 댓글 토글
  const handleToggleComments = () => {
    setShowComments(!showComments)
  }

  const handleAddFriend = async (memberId: number, memberName: string) => {
    setFriendLoading(true)
    setFriendError(null)
    setFriendSuccess(null)
    try {
      // 1. memberId로 이메일 조회
      const res = await api.get(`/members/${memberId}`)
      
      const email = res?.result?.email
      if (!email) {
        throw new Error("이메일 정보를 찾을 수 없습니다.")
      }
      
      
      // 2. 친구 추가 요청
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

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 피드를 삭제하시겠습니까?")) return

    setIsDeleting(true)
    try {
      await deleteFeed(post.feedId)
      toast({ title: "피드 삭제", description: "피드가 성공적으로 삭제되었습니다." })
      onRefresh() // 피드 목록 새로고침
    } catch (error) {
      toast({ title: "삭제 실패", description: "피드 삭제 중 오류가 발생했습니다.", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  // 수정 모드 진입
  const handleEdit = () => {
    setIsEditing(true)
    setEditedContent(post.content)
    setEditedImages([])
    setExistingImageUrls(post.mediaUrls || [])
  }

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  // 수정 저장
  const handleUpdate = async () => {
    if (!editedContent.trim() && editedImages.length === 0 && existingImageUrls.length === 0) {
      toast({ title: "내용 필요", description: "게시물 내용을 입력하거나 이미지를 첨부해주세요.", variant: "destructive" })
      return
    }

    setIsUpdating(true)
    const formData = new FormData()
    formData.append("content", editedContent)
    editedImages.forEach(file => formData.append("images", file))
    // 기존 이미지 URL 목록도 전송 (백엔드에서 처리)
    existingImageUrls.forEach(url => formData.append("existingMediaUrls", url))

    try {
      const updatedPost = await updateFeed(post.feedId, formData)
      setIsEditing(false)
      onRefresh() // 수정 후 목록 전체를 새로고침하여 데이터 정합성을 보장합니다.
      toast({ title: "피드 수정", description: "피드가 성공적으로 수정되었습니다." })
    } catch (error) {
      toast({ title: "수정 실패", description: "피드 수정 중 오류가 발생했습니다.", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  // 수정 시 이미지 선택
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setEditedImages(prev => [...prev, ...files])
    }
  }

  // 새로 추가한 이미지 제거
  const removeNewImage = (index: number) => {
    setEditedImages(prev => prev.filter((_, i) => i !== index))
  }

  // 기존 이미지 제거
  const removeExistingImage = (url: string) => {
    setExistingImageUrls(prev => prev.filter(u => u !== url))
  }

  const isOwner = user?.memberId === post.memberId

  // 공유된 피드 렌더링
  const renderSharedFeed = (sharedFeed: FetchFeedResponse) => (
    <Card className="mt-3 border-l-4 border-l-blue-500 bg-blue-50/50">
      <CardHeader className="p-3 pb-0">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-blue-600 font-medium">공유된 피드</span>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            {sharedFeed.profileImageId ? (
              <AuthImage 
                mediaId={sharedFeed.profileImageId} 
                type="profile" 
                alt={sharedFeed.memberName} 
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <AvatarImage src="/placeholder.svg" alt={sharedFeed.memberName} />
            )}
            <AvatarFallback className="text-xs">{sharedFeed.memberName[0]}</AvatarFallback>
          </Avatar>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-sm font-medium hover:underline focus:outline-none" type="button">
                {sharedFeed.memberName}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-4">
              <div className="mb-2 font-semibold">친구 추가</div>
              <div className="mb-2 text-xs text-muted-foreground">{sharedFeed.memberName}님과 친구를 맺어보세요.</div>
              <Button
                size="sm"
                onClick={() => handleAddFriend(sharedFeed.memberId, sharedFeed.memberName)}
                className="w-full"
              >
                친구 요청 보내기
              </Button>
            </PopoverContent>
          </Popover>
          <span className="text-xs text-muted-foreground">
            {new Date(sharedFeed.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="prose max-w-none text-sm text-gray-700">
          <ReactMarkdown>{sharedFeed.content}</ReactMarkdown>
        </div>
            {sharedFeed.mediaUrls && sharedFeed.mediaUrls.length > 0 && (
              <div className="mt-2 rounded-md overflow-hidden">
                {sharedFeed.mediaUrls.map((url: string, index: number) => (
                  <img 
                    key={index}
                    src={url} 
                    alt="공유된 피드 이미지" 
                    className="w-full h-auto max-h-48 object-cover" 
                  />
                ))}
              </div>
            )}
      </CardContent>
    </Card>
  )

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {(post as any).profileImageUrl ? (
                  <AvatarImage 
                    src={(post as any).profileImageUrl} 
                    alt={post.memberName} 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (post as any).profileImage ? (
                  <AvatarImage 
                    src={(post as any).profileImage} 
                    alt={post.memberName} 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : post.profileImageId ? (
                  <AuthImage 
                    mediaId={post.profileImageId} 
                    type="profile" 
                    alt={post.memberName} 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <AvatarImage src="/placeholder.svg" alt={post.memberName} />
                )}
                <AvatarFallback>{post.memberName[0]}</AvatarFallback>
              </Avatar>
              <div>
                {/* ✅ 작성자 이름 클릭 시 해당 프로필로 이동 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/profile/${post.profileId}`)
                  }}
                  className="font-medium hover:underline focus:outline-none"
                  type="button"
                >
                  {post.memberName}
                </button>
                <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                {post.isShared && post.sharedBy && (
                  <div className="flex items-center gap-1 mt-1">
                    <Repeat className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600">
                      {post.sharedBy.memberName}님이 공유함
                    </span>
                  </div>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
                      <Pencil className="h-4 w-4 mr-2" /> 수정하기
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="text-destructive focus:text-destructive" disabled={isDeleting}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? "삭제 중..." : "삭제하기"}
                    </DropdownMenuItem>
                  </>
                )}
                {!isOwner && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowReportModal(true); }}>신고하기</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent 
          className={`p-4 ${!isEditing && "cursor-pointer hover:bg-gray-50/50 transition-colors"}`}
          onClick={() => !isEditing && router.push(`/feed/${post.feedId}`)}
        >
          {isEditing ? (
            // 수정 모드 UI
            <div className="space-y-4">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={4}
                className="resize-none"
              />
              {/* 이미지 미리보기 */}
              <div className="flex flex-wrap gap-2">
                {existingImageUrls.map((url) => (
                  <div key={url} className="relative">
                    <img src={url} alt="기존 이미지" className="h-20 w-20 object-cover rounded" />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 bg-white/80 rounded-full p-0.5"
                      onClick={() => removeExistingImage(url)}
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}
                {editedImages.map((file, idx) => (
                  <div key={idx} className="relative">
                    <img src={URL.createObjectURL(file)} alt="새 이미지" className="h-20 w-20 object-cover rounded" />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 bg-white/80 rounded-full p-0.5"
                      onClick={() => removeNewImage(idx)}
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} multiple accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="h-4 w-4 mr-2" /> 이미지 추가
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCancelEdit}>취소</Button>
                  <Button size="sm" onClick={handleUpdate} disabled={isUpdating}>{isUpdating ? "저장 중..." : "저장"}</Button>
                </div>
              </div>
            </div>
          ) : (
            // 일반 모드 UI
            <>
              <div className="prose max-w-none text-sm">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="mt-3 rounded-md overflow-hidden grid grid-cols-2 gap-1">
                  {post.mediaUrls.map((url: string, index: number) => (
                    <img key={index} src={url} alt="피드 이미지" className="w-full h-auto object-cover" />
                  ))}
                </div>
              )}
            </>
          )}
          {/* 공유된 피드가 있으면 표시 */}
          {post.sharedFeed && renderSharedFeed(post.sharedFeed)}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${post.liked ? "text-primary" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleLike(post.feedId, post.liked)
              }}
            >
              <ThumbsUp className={`h-4 w-4 ${post.liked ? "fill-primary" : ""}`} />
              <span>{post.likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${showComments ? "text-primary" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                handleToggleComments()
              }}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount}</span>
            </Button>
            {/* 공유된 피드가 아닌 경우에만 공유 버튼 표시 */}
            {!post.isShared && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShareClick()
                }}
              >
                <Share2 className="h-4 w-4" />
                <span>{post.shareCount}</span>
              </Button>
            )}
          </div>
        </CardFooter>
        {showComments && <FeedComments feedId={post.feedId} onShow={true} />}
      </Card>

      {/* 공유 다이얼로그 */}
      <ShareFeedDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        originalFeed={post}
        onSuccess={handleShareSuccess}
      />
      {/* 신고 모달 */}
      <ReportModal
        targetId={post.feedId}
        targetType="FEED"
        open={showReportModal}
        setOpen={setShowReportModal}
        triggerText={""}
      />

    </>
  )
} 