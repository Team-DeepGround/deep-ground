"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal, Repeat, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  likeFeed,
  unlikeFeed,
  deleteFeed,
  FetchFeedResponse
} from "@/lib/api/feed"
import { FeedComments } from "./feed-comments"
import HybridShareButton from "@/components/share/shareButton"
import { ReportModal } from "@/components/report/report-modal"
import ReactMarkdown from "react-markdown"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"

interface FeedPostProps {
  post: FetchFeedResponse
  onRefresh: () => void
}

export function FeedPost({ post: initialPost, onRefresh }: FeedPostProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { memberId } = useAuth()
  const [post, setPost] = useState(initialPost)
  const [showComments, setShowComments] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  // 공유는 HybridShareButton 사용 (Web Share / 카카오 / 링크복사)
  const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '')
  const shareUrl = new URL(`/feed/${post.feedId}`, origin).toString()

  // 댓글 토글
  const handleToggleComments = () => setShowComments(!showComments)

  // 피드 삭제
  const handleDelete = async () => {
    if (!confirm('정말로 이 피드를 삭제하시겠습니까?')) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteFeed(post.feedId)
      toast({ 
        title: "피드 삭제", 
        description: "피드가 성공적으로 삭제되었습니다." 
      })
      onRefresh() // 피드 목록 새로고침
    } catch (error) {
      console.error('피드 삭제 오류:', error)
      toast({ 
        title: "삭제 실패", 
        description: "피드 삭제 중 오류가 발생했습니다.", 
        variant: "destructive" 
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // 현재 사용자가 피드 작성자인지 확인
  const isOwner = memberId === post.memberId

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
            {/* ✅ URL 직접 사용으로 변경 */}
            <AvatarImage src={sharedFeed.profileImageUrl || "/placeholder.svg"} alt={sharedFeed.memberName} />
            <AvatarFallback className="text-xs">{sharedFeed.memberName[0]}</AvatarFallback>
          </Avatar>

          {/* ✅ 공유된 피드 작성자 프로필로 이동 */}
          <button
            className="text-sm font-medium hover:underline focus:outline-none"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/profile/${sharedFeed.profileId}`)
            }}
          >
            {sharedFeed.memberName}
          </button>

          <span className="text-xs text-muted-foreground">
            {new Date(sharedFeed.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="prose max-w-none text-sm text-gray-700">
          <ReactMarkdown>{sharedFeed.content}</ReactMarkdown>
        </div>

        {sharedFeed.mediaUrls && sharedFeed.mediaUrls.length > 0 && (
          <div className="mt-2 rounded-md overflow-hidden">
            {sharedFeed.mediaUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt="공유된 피드 이미지"
                className="w-full h-auto max-h-48 object-cover mb-2"
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
                <AvatarImage src={post.profileImageUrl || "/placeholder.svg"} alt={post.memberName} />
                <AvatarFallback>{post.memberName[0]}</AvatarFallback>
              </Avatar>

              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/profile/${post.profileId}`);
                  }}
                  className="font-medium hover:underline focus:outline-none"
                  type="button"
                >
                  {post.memberName}
                </button>

                <p className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>

                {post.isShared && (post as any).sharedBy && (
                  <div className="flex items-center gap-1 mt-1">
                    <Repeat className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600">
                      {(post as any).sharedBy.memberName}님이 공유함
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
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="text-destructive focus:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? '삭제 중...' : '삭제하기'}
                  </DropdownMenuItem>
                )}
                {!isOwner && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReportModal(true);
                    }}
                  >
                    신고하기
                  </DropdownMenuItem>
                )}
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

          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="mt-3 rounded-md overflow-hidden">
              {post.mediaUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt="피드 이미지"
                  className="w-full h-auto mb-2 rounded-md"
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
              className={`flex items-center gap-1 ${
                post.liked ? 'text-primary' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleLike(post.feedId, post.liked);
              }}
            >
              <ThumbsUp
                className={`h-4 w-4 ${post.liked ? 'fill-primary' : ''}`}
              />
              <span>{post.likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${
                showComments ? 'text-primary' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleComments();
              }}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount}</span>
            </Button>

            {/* 공유된 피드가 아닌 경우에만 공유 버튼 표시 */}
            {!post.isShared && (
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <HybridShareButton
                  shareUrl={shareUrl}
                  shareTitle={post.memberName + '님의 피드'}
                  shareText={post.content.substring(0, 100)} // 내용은 일부만 잘라서 전달
                  shareImageUrl={
                    post.mediaUrls && post.mediaUrls.length > 0
                      ? post.mediaUrls[0] // 첫 번째 이미지 URL을 썸네일로 사용
                      : undefined
                  }
                />
                <span className="text-sm">{post.shareCount}</span>
              </div>
            )}
          </div>
        </CardFooter>

        {showComments && <FeedComments feedId={post.feedId} onShow={true} />}
      </Card>

      {/* 공유 다이얼로그 제거: HybridShareButton 사용 */}

      {/* 신고 모달 */}
      <ReportModal
        targetId={post.feedId}
        targetType="FEED"
        open={showReportModal}
        setOpen={setShowReportModal}
        triggerText={''}
      />
    </>
  );
}
