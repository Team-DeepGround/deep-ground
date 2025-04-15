import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  },
]

export default function TechFeed() {
  return (
    <div className="space-y-6">
      {feedPosts.map((post) => (
        <Card key={post.id}>
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
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{post.likeCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{post.commentCount}</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span>{post.shareCount}</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
