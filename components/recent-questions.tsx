import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, ThumbsUp, CheckCircle2 } from "lucide-react"
import Link from "next/link"

// 임시 데이터
const recentQuestions = [
  {
    id: 1,
    title: "React에서 상태 관리 라이브러리 추천해주세요",
    content:
      "React 프로젝트에서 상태 관리를 위한 라이브러리를 고민 중입니다. Redux, MobX, Recoil 등 어떤 것이 좋을까요?",
    tags: ["React", "상태관리", "Frontend"],
    author: {
      name: "김리액트",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-05-10T09:30:00Z",
    commentCount: 8,
    likeCount: 12,
    isResolved: false,
  },
  {
    id: 2,
    title: "Spring Security와 JWT 인증 구현 방법",
    content: "Spring Boot 프로젝트에서 JWT를 이용한 인증 시스템을 구현하려고 합니다. 좋은 예제나 방법이 있을까요?",
    tags: ["Spring", "Security", "JWT", "Backend"],
    author: {
      name: "박스프링",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-05-09T14:20:00Z",
    commentCount: 5,
    likeCount: 7,
    isResolved: true,
  },
  {
    id: 3,
    title: "TypeScript에서 제네릭 사용 시 주의사항",
    content: "TypeScript에서 제네릭을 사용할 때 자주 발생하는 실수나 주의해야 할 점이 있을까요?",
    tags: ["TypeScript", "Generic", "JavaScript"],
    author: {
      name: "이타입",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-05-08T11:15:00Z",
    commentCount: 3,
    likeCount: 5,
    isResolved: false,
  },
]

export default function RecentQuestions() {
  return (
    <div className="space-y-4">
      {recentQuestions.map((question) => (
        <Card key={question.id}>
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={question.author.avatar || "/placeholder.svg"} alt={question.author.name} />
                  <AvatarFallback>{question.author.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{question.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mt-1 flex items-center gap-2">
                    {question.title}
                    {question.isResolved && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </h3>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground line-clamp-2">{question.content}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                {question.commentCount}
              </div>
              <div className="text-sm text-muted-foreground flex items-center">
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                {question.likeCount}
              </div>
            </div>
            <Button asChild size="sm">
              <Link href={`/questions/${question.id}`}>답변하기</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
