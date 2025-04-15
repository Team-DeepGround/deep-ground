"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, CheckCircle2, Search, Plus, SortAsc, SortDesc } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 임시 데이터
const questions = [
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
  {
    id: 4,
    title: "Docker 컨테이너 간 통신 문제",
    content: "Docker 컨테이너 간 네트워크 통신이 되지 않는 문제가 있습니다. 네트워크 설정을 어떻게 해야 할까요?",
    tags: ["Docker", "Network", "DevOps"],
    author: {
      name: "최도커",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-05-07T16:45:00Z",
    commentCount: 6,
    likeCount: 9,
    isResolved: true,
  },
  {
    id: 5,
    title: "Next.js 13 App Router에서 데이터 페칭 방법",
    content: "Next.js 13의 App Router에서 서버 컴포넌트를 사용할 때 가장 효율적인 데이터 페칭 방법은 무엇인가요?",
    tags: ["Next.js", "React", "Server Components"],
    author: {
      name: "정넥스트",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-05-06T10:30:00Z",
    commentCount: 4,
    likeCount: 15,
    isResolved: false,
  },
  {
    id: 6,
    title: "Python에서 비동기 프로그래밍 구현 방법",
    content: "Python에서 asyncio를 사용한 비동기 프로그래밍 구현 시 주의할 점과 좋은 패턴이 있을까요?",
    tags: ["Python", "Asyncio", "Backend"],
    author: {
      name: "한파이썬",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-05-05T13:20:00Z",
    commentCount: 7,
    likeCount: 11,
    isResolved: true,
  },
]

export default function QuestionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<string>("latest")

  // 필터링된 질문
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTags = selectedTags.length === 0 || question.tags.some((tag) => selectedTags.includes(tag))

    return matchesSearch && matchesTags
  })

  // 정렬된 질문
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortOrder === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortOrder === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortOrder === "most_likes") {
      return b.likeCount - a.likeCount
    } else if (sortOrder === "most_comments") {
      return b.commentCount - a.commentCount
    }
    return 0
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Q&A 게시판</h1>
          <p className="text-muted-foreground mt-1">개발 관련 질문을 하고 답변을 받아보세요</p>
        </div>
        <Button asChild>
          <Link href="/questions/create">
            <Plus className="mr-2 h-4 w-4" />
            질문하기
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 mb-8">
        {/* 필터 사이드바 */}
        <Card className="h-fit">
          <CardHeader>
            <h2 className="text-lg font-semibold">필터</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">검색</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="질문 검색..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">정렬</label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">
                    <div className="flex items-center">
                      <SortDesc className="mr-2 h-4 w-4" />
                      <span>최신순</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center">
                      <SortAsc className="mr-2 h-4 w-4" />
                      <span>오래된순</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="most_likes">
                    <div className="flex items-center">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      <span>좋아요순</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="most_comments">
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>댓글순</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">기술 태그</label>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(questions.flatMap((question) => question.tags))).map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag))
                      } else {
                        setSelectedTags([...selectedTags, tag])
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 질문 목록 */}
        <div className="space-y-6">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="unresolved">미해결</TabsTrigger>
              <TabsTrigger value="resolved">해결됨</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {sortedQuestions.length > 0 ? (
                <div className="space-y-4">
                  {sortedQuestions.map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unresolved" className="mt-6">
              <div className="space-y-4">
                {sortedQuestions
                  .filter((question) => !question.isResolved)
                  .map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="resolved" className="mt-6">
              <div className="space-y-4">
                {sortedQuestions
                  .filter((question) => question.isResolved)
                  .map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

interface QuestionCardProps {
  question: (typeof questions)[0]
}

function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card>
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
  )
}
