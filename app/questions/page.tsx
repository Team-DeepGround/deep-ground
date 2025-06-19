"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, CheckCircle2, Search, Plus, SortAsc, SortDesc } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { api } from "@/lib/api-client"

// 미리 정의된 태그 목록 (질문 생성과 동일)
const predefinedTags = [
  "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express", "NestJS", "Spring", "Django", "Flask", "Java", "Python", "C#", "Go", "Rust", "PHP", "Ruby", "HTML", "CSS", "Tailwind", "Bootstrap", "SASS", "GraphQL", "REST API", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab", "Testing", "TDD", "DevOps", "Algorithm", "Data Structure", "Machine Learning", "AI", "Frontend", "Backend", "Database", "Mobile", "Web"
]

export default function QuestionsPage() {
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true)
      try {
        const res = await api.get("/questions", { params: { size: "100" } })
        setAllQuestions(res.result?.questions || [])
      } catch (e) {
        setAllQuestions([])
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<string>("latest")
  const router = useRouter()

  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 // 페이지당 표시할 항목 수

  // 필터링된 질문
  const filteredQuestions = allQuestions.filter((question) => {
    const matchesSearch =
      question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.content.toLowerCase().includes(searchTerm.toLowerCase())

    const tags = question.tags || [];
    const matchesTags = selectedTags.length === 0 || tags.some((tag: any) => selectedTags.includes(tag))

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

  // 페이지네이션 적용
  const totalPages = Math.ceil(sortedQuestions.length / itemsPerPage)
  const paginatedQuestions = sortedQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // 질문 상세 페이지로 이동하는 함수
  const navigateToQuestion = (questionId: number) => {
    router.push(`/questions/${questionId}`)
  }

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
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1) // 검색어 변경 시 첫 페이지로 이동
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">정렬</label>
              <Select
                value={sortOrder}
                onValueChange={(value) => {
                  setSortOrder(value)
                  setCurrentPage(1) // 정렬 변경 시 첫 페이지로 이동
                }}
              >
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
                {(
                  Array.from(new Set([
                    ...predefinedTags,
                    ...allQuestions.flatMap((question: any) => question.tags || [])
                  ]))
                ).map((tag: any, idx: number) => (
                  <Badge
                    key={tag + '-' + idx}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag))
                      } else {
                        setSelectedTags([...selectedTags, tag])
                      }
                      setCurrentPage(1) // 태그 변경 시 첫 페이지로 이동
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
              {paginatedQuestions.length > 0 ? (
                <div className="space-y-4">
                  {paginatedQuestions.map((question, idx) => (
                    <QuestionCard
                      key={(question.id ?? question.questionId ?? idx) + '-' + idx}
                      question={question}
                      onTitleClick={() => navigateToQuestion(question.id)}
                    />
                  ))}

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page, idx) => (
                          <PaginationItem key={page + '-' + idx}>
                            <PaginationLink
                              isActive={page === currentPage}
                              onClick={() => setCurrentPage(page)}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="unresolved" className="mt-6">
              <div className="space-y-4">
                {paginatedQuestions
                  .filter((question) => !question.isResolved)
                  .map((question, idx) => (
                    <QuestionCard
                      key={(question.id ?? question.questionId ?? idx) + '-' + idx}
                      question={question}
                      onTitleClick={() => navigateToQuestion(question.id)}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="resolved" className="mt-6">
              <div className="space-y-4">
                {paginatedQuestions
                  .filter((question) => question.isResolved)
                  .map((question, idx) => (
                    <QuestionCard
                      key={(question.id ?? question.questionId ?? idx) + '-' + idx}
                      question={question}
                      onTitleClick={() => navigateToQuestion(question.id)}
                    />
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
  question: any
  onTitleClick: () => void
}

function QuestionCard({ question, onTitleClick }: QuestionCardProps) {
  const authorName = question.author?.name || question.memberId || "알 수 없음";
  const authorAvatar = question.author?.avatar || "/placeholder.svg";
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback>{authorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(question.createdAt).toISOString().slice(0, 10)}
                </span>
              </div>
              <h3 className="text-lg font-semibold mt-1 flex items-center gap-2">
                <button
                  onClick={() => {
                    const qid = question.questionId ?? question.id;
                    if (qid) {
                      window.location.href = `/questions/${qid}`;
                    } else {
                      alert('질문 ID가 없습니다!');
                    }
                  }}
                  className="text-left hover:underline hover:text-primary transition-colors focus:outline-none"
                >
                  {question.title}
                </button>
                {question.isResolved && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </h3>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{question.content}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {question.tags && question.tags.map((tag: any, idx: number) => (
            <Badge key={tag + '-' + idx} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            {question.commentCount ?? question.answerCount ?? 0}
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
            {question.likeCount ?? 0}
          </div>
        </div>
        <Button asChild size="sm">
          <Link href={`/questions/${question.id}`}>답변하기</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
