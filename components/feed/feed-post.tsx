"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal, ImageIcon, Send, X, Repeat } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  likeFeed,
  unlikeFeed,
  FetchFeedResponse
} from "@/lib/api/feed"
import { FeedComments } from "./feed-comments"
import { ShareFeedDialog } from "./share-feed-dialog"
import { AuthImage } from "@/components/ui/auth-image"
import { ReportModal } from "@/components/report/report-modal"
import ReactMarkdown from "react-markdown"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useState } from "react"
import { api } from "@/lib/api-client"

interface FeedPostProps {
  post: FetchFeedResponse
  onRefresh: () => void
}

export function FeedPost({ post: initialPost, onRefresh }: FeedPostProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [post, setPost] = useState(initialPost)
  const [showComments, setShowComments] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [friendPopoverOpen, setFriendPopoverOpen] = useState(false)
  const [friendLoading, setFriendLoading] = useState(false)
  const [friendError, setFriendError] = useState<string | null>(null)
  const [friendSuccess, setFriendSuccess] = useState<string | null>(null)

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
      if (!email) throw new Error("이메일 정보를 찾을 수 없습니다.")
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
        {sharedFeed.mediaIds && sharedFeed.mediaIds.length > 0 && (
          <div className="mt-2 rounded-md overflow-hidden">
            {sharedFeed.mediaIds.map((id) => (
              <AuthImage 
                key={id} 
                mediaId={id} 
                type="feed" 
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
                {post.profileImageId ? (
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
                <Popover open={friendPopoverOpen} onOpenChange={setFriendPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button className="font-medium hover:underline focus:outline-none" type="button">
                      {post.memberName}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-56 p-4">
                    <div className="mb-2 font-semibold">친구 추가</div>
                    <div className="mb-2 text-xs text-muted-foreground">{post.memberName}님과 친구를 맺어보세요.</div>
                    <Button
                      size="sm"
                      disabled={friendLoading}
                      onClick={() => handleAddFriend(post.memberId, post.memberName)}
                      className="w-full"
                    >
                      {friendLoading ? "요청 중..." : "친구 요청 보내기"}
                    </Button>
                    {friendSuccess && <div className="text-green-600 text-xs mt-2">{friendSuccess}</div>}
                    {friendError && <div className="text-destructive text-xs mt-2">{friendError}</div>}
                  </PopoverContent>
                </Popover>
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
                <DropdownMenuItem>저장하기</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowReportModal(true)}>신고하기</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent 
          className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors" 
          onClick={() => router.push(`/feed/${post.feedId}`)}
        >
          <div className="prose max-w-none text-sm">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
          {post.mediaIds && post.mediaIds.length > 0 && (
            <div className="mt-3 rounded-md overflow-hidden">
              {post.mediaIds.map((id) => (
                <AuthImage 
                  key={id} 
                  mediaId={id} 
                  type="feed" 
                  alt="피드 이미지" 
                  className="w-full h-auto mb-2" 
                />
              ))}
            </div>
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