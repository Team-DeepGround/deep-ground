"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal, ImageIcon, Send } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

// 임시 데이터
const feedPosts = [
  {
    id: 1,
    content:
      "오늘 Next.js 14가 출시되었네요! 서버 컴포넌트와 스트리밍 기능이 더욱 개선되었다고 합니다. 곧 프로젝트에 적용해봐야겠어요!",
    author: {
      name: "김프론트",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-05-10T09:30:00Z",
    commentCount: 5,
    likeCount: 24,
    shareCount: 3,
    image: "/placeholder.svg?height=300&width=600",
    comments: [
      {
        id: 101,
        content: "저도 적용해봐야겠네요! 어떤 기능이 가장 기대되시나요?",
        author: {
          name: "이리액트",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        createdAt: "2023-05-10T10:15:00Z",
        likeCount: 3,
      },
      {
        id: 102,
        content: "서버 컴포넌트의 성능 개선이 정말 기대됩니다!",
        author: {
          name: "박넥스트",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        createdAt: "2023-05-10T11:30:00Z",
        likeCount: 2,
      },
    ],
  },
  {
    id: 2,
    content:
      "GraphQL을 처음 도입했는데, REST API보다 클라이언트에서 필요한 데이터만 가져올 수 있어서 효율적인 것 같습니다. 다들 어떤 API 방식을 선호하시나요?",
    author: {
      name: "박백엔드",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-05-09T14:20:00Z",
    commentCount: 12,
    likeCount: 18,
    shareCount: 2,
    image: null,
    comments: [
      {
        id: 201,
        content: "저는 여전히 REST API를 선호합니다. 단순하고 직관적이라서요.",
        author: {
          name: "최API",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        createdAt: "2023-05-09T15:10:00Z",
        likeCount: 5,
      },
      {
        id: 202,
        content: "GraphQL의 장점은 확실히 있지만, 러닝 커브가 있는 것 같아요.",
        author: {
          name: "정풀스택",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        createdAt: "2023-05-09T16:45:00Z",
        likeCount: 4,
      },
    ],
  },
  {
    id: 3,
    content:
      "TypeScript 5.0의 새로운 기능들을 살펴보고 있는데, 정말 인상적이네요. 특히 const type parameters와 decorators 개선이 마음에 듭니다.",
    author: {
      name: "이타입",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-05-08T11:15:00Z",
    commentCount: 7,
    likeCount: 15,
    shareCount: 4,
    image: "/placeholder.svg?height=300&width=600",
    comments: [],
  },
]

export default function FeedPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [newPostContent, setNewPostContent] = useState("")
  const [expandedComments, setExpandedComments] = useState<number[]>([])
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({})

  const toggleComments = (postId: number) => {
    if (expandedComments.includes(postId)) {
      setExpandedComments(expandedComments.filter((id) => id !== postId))
    } else {
      setExpandedComments([...expandedComments, postId])
    }
  }

  const handleLike = (postId: number) => {
    toast({
      title: "좋아요",
      description: "게시물에 좋아요를 표시했습니다.",
    })
  }

  const handleShare = (postId: number) => {
    toast({
      title: "공유하기",
      description: "게시물 공유 기능은 준비 중입니다.",
    })
  }

  const handleCommentSubmit = (postId: number) => {
    if (!commentInputs[postId]?.trim()) {
      toast({
        title: "댓글 내용 필요",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "댓글 등록",
      description: "댓글이 등록되었습니다.",
    })

    // 댓글 입력 초기화
    setCommentInputs({
      ...commentInputs,
      [postId]: "",
    })
  }

  const handleNewPost = () => {
    if (!newPostContent.trim()) {
      toast({
        title: "게시물 내용 필요",
        description: "게시물 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "게시물 등록",
      description: "게시물이 등록되었습니다.",
    })

    // 게시물 입력 초기화
    setNewPostContent("")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">기술 피드</h1>

        {/* 새 게시물 작성 */}
        <Card className="mb-8">
          <CardHeader className="p-4 pb-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt={user?.email || "사용자"} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{user?.email || "게스트"}</h3>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Textarea
              placeholder="무슨 생각을 하고 계신가요?"
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="resize-none"
            />
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <Button variant="outline" size="sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              이미지
            </Button>
            <Button size="sm" onClick={handleNewPost}>
              게시하기
            </Button>
          </CardFooter>
        </Card>

        {/* 피드 게시물 */}
        <div className="space-y-6">
          {feedPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{post.author.name}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
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
                      <DropdownMenuItem>신고하기</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm whitespace-pre-line">{post.content}</p>
                {post.image && (
                  <div className="mt-3 rounded-md overflow-hidden">
                    <img src={post.image || "/placeholder.svg"} alt="Post content" className="w-full h-auto" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleLike(post.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likeCount}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.commentCount}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleShare(post.id)}
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{post.shareCount}</span>
                  </Button>
                </div>
              </CardFooter>

              {/* 댓글 섹션 */}
              {expandedComments.includes(post.id) && (
                <div className="px-4 pb-4 border-t">
                  {post.comments && post.comments.length > 0 ? (
                    <div className="space-y-4 pt-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                            <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-muted p-3 rounded-lg">
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-sm">{comment.author.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-1 ml-2">
                              <button className="text-xs text-muted-foreground hover:text-foreground">
                                좋아요 {comment.likeCount}
                              </button>
                              <button className="text-xs text-muted-foreground hover:text-foreground">답글 달기</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-muted-foreground text-sm">
                      아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                    </div>
                  )}

                  {/* 댓글 입력 */}
                  <div className="flex items-center gap-3 mt-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.email || "사용자"} />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Textarea
                        placeholder="댓글을 입력하세요..."
                        rows={1}
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs({
                            ...commentInputs,
                            [post.id]: e.target.value,
                          })
                        }
                        className="resize-none min-h-[40px] py-2"
                      />
                      <Button size="icon" onClick={() => handleCommentSubmit(post.id)} className="h-10 w-10">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
