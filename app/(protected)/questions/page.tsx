"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ThumbsUp, CheckCircle2, Search, Plus, SortAsc, SortDesc, Calendar, AlertTriangle } from "lucide-react"
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
import { formatReadableDate } from "@/lib/utils";
import { ReportModal } from "@/components/report/report-modal";

// 미리 정의된 태그 목록 (질문 생성과 동일)
const predefinedTags = [
  "Java", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express", "NestJS", "Spring", "Django", "Flask", "Java", "Python", "C#", "Go", "Rust", "PHP", "Ruby", "HTML", "CSS", "Tailwind", "Bootstrap", "SASS", "GraphQL", "REST API", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab", "Testing", "TDD", "DevOps", "Algorithm", "Data Structure", "Machine Learning", "AI", "Frontend", "Backend", "Database", "Mobile", "Web"
]

export default function QuestionsPage() {
  const [allQuestions, setAllQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const res = await api.get("/questions", { params: { size: "100" } })
      
      const questions = res.result?.questions || []
      
      // 각 질문의 상태 정보 상세 로깅
      questions.forEach((q: any, idx: number) => {
      });
      
      setAllQuestions(questions)
    } catch (e) {
      setAllQuestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  // 페이지 포커스 시 데이터 새로고침 (질문 상세보기에서 돌아올 때)
  useEffect(() => {
    const handleFocus = () => {
      fetchQuestions()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<string>("latest")
  const [statusFilter, setStatusFilter] = useState<string>("all") // 상태별 필터 추가
  const router = useRouter()

  // statusFilter 상태 변경 감지
  useEffect(() => {
  }, [statusFilter])

  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 // 페이지당 표시할 항목 수

  // 필터링된 질문
  const filteredQuestions = allQuestions.filter((question) => {
    const title = question.title ?? "";
    const content = question.content ?? "";
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.toLowerCase().includes(searchTerm.toLowerCase());

    const tags = question.tags || question.techStacks || [];
    const matchesTags = selectedTags.length === 0 || tags.some((tag: any) => selectedTags.includes(tag));

    // 상태별 필터링 추가 (status 필드 직접 사용)
    let matchesStatus = false;
    
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "OPEN") {
      matchesStatus = question.status === "OPEN";
    } else if (statusFilter === "RESOLVED") {
      matchesStatus = question.status === "RESOLVED";
    } else if (statusFilter === "CLOSED") {
      matchesStatus = question.status === "CLOSED";
    }
    
    // 디버깅 로그 (모든 질문에 대해)
    if (statusFilter !== "all") {
    }

    return matchesSearch && matchesTags && matchesStatus;
  })

  // 정렬된 질문
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortOrder === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortOrder === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortOrder === "most_answers") {
      return b.answerCount - a.answerCount
    }
    return 0
  })

  // 필터링 결과 로깅 (브라우저에서만)
  if (typeof window !== 'undefined') {
  }

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
                  <SelectItem value="most_answers">
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>답변순</span>
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
                    ...allQuestions.flatMap((question: any) => question.tags || question.techStacks || [])
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

            <div className="space-y-2">
              <label className="text-sm font-medium">상태별 필터</label>
              <div className="flex flex-col gap-2">
                <button
                  className={`px-3 py-2 text-sm rounded border ${
                    statusFilter === "all" 
                      ? "bg-blue-500 text-white" 
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                  onClick={() => {
                    setStatusFilter("all")
                    setCurrentPage(1)
                  }}
                >
                  전체
                </button>
                <button
                  className={`px-3 py-2 text-sm rounded border ${
                    statusFilter === "OPEN" 
                      ? "bg-blue-500 text-white" 
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                  onClick={() => {
                    setStatusFilter("OPEN")
                    setCurrentPage(1)
                  }}
                >
                  미해결
                </button>
                <button
                  className={`px-3 py-2 text-sm rounded border ${
                    statusFilter === "RESOLVED" 
                      ? "bg-blue-500 text-white" 
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                  onClick={() => {
                    setStatusFilter("RESOLVED")
                    setCurrentPage(1)
                  }}
                >
                  해결중
                </button>
                <button
                  className={`px-3 py-2 text-sm rounded border ${
                    statusFilter === "CLOSED" 
                      ? "bg-blue-500 text-white" 
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                  onClick={() => {
                    setStatusFilter("CLOSED")
                    setCurrentPage(1)
                  }}
                >
                  해결완료
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 질문 목록 */}
        <div className="space-y-6">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger 
                value="all"
                onClick={() => {
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
              >
                전체
              </TabsTrigger>
              <TabsTrigger 
                value="OPEN"
                onClick={() => {
                  setStatusFilter("OPEN");
                  setCurrentPage(1);
                }}
              >
                미해결
              </TabsTrigger>
              <TabsTrigger 
                value="RESOLVED"
                onClick={() => {
                  setStatusFilter("RESOLVED");
                  setCurrentPage(1);
                }}
              >
                해결중
              </TabsTrigger>
              <TabsTrigger 
                value="CLOSED"
                onClick={() => {
                  setStatusFilter("CLOSED");
                  setCurrentPage(1);
                }}
              >
                해결됨
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {paginatedQuestions.length > 0 ? (
                <div className="space-y-4">
                  {paginatedQuestions.map((q, idx) => (
                    <QuestionCard
                      key={q.questionId}
                      question={{ ...q, id: q.questionId }}
                      onTitleClick={() => navigateToQuestion(q.questionId)}
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

            <TabsContent value="RESOLVED" className="mt-6">
              {filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((q, idx) => (
                      <QuestionCard
                        key={q.questionId}
                        question={{ ...q, id: q.questionId }}
                        onTitleClick={() => navigateToQuestion(q.questionId)}
                      />
                    ))}

                  {/* 페이지네이션 */}
                  {Math.ceil(filteredQuestions.length / itemsPerPage) > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>

                        {Array.from({ length: Math.ceil(filteredQuestions.length / itemsPerPage) }, (_, i) => i + 1).map((page, idx) => (
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
                            onClick={() => setCurrentPage(Math.min(Math.ceil(filteredQuestions.length / itemsPerPage), currentPage + 1))}
                            className={currentPage === Math.ceil(filteredQuestions.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">해결중인 질문이 없습니다.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="OPEN" className="mt-6">
              {filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((q, idx) => (
                      <QuestionCard
                        key={q.questionId}
                        question={{ ...q, id: q.questionId }}
                        onTitleClick={() => navigateToQuestion(q.questionId)}
                      />
                    ))}

                  {/* 페이지네이션 */}
                  {Math.ceil(filteredQuestions.length / itemsPerPage) > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>

                        {Array.from({ length: Math.ceil(filteredQuestions.length / itemsPerPage) }, (_, i) => i + 1).map((page, idx) => (
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
                            onClick={() => setCurrentPage(Math.min(Math.ceil(filteredQuestions.length / itemsPerPage), currentPage + 1))}
                            className={currentPage === Math.ceil(filteredQuestions.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">미해결 질문이 없습니다.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="CLOSED" className="mt-6">
              {filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((q, idx) => (
                      <QuestionCard
                        key={q.questionId}
                        question={{ ...q, id: q.questionId }}
                        onTitleClick={() => navigateToQuestion(q.questionId)}
                      />
                    ))}

                  {/* 페이지네이션 */}
                  {Math.ceil(filteredQuestions.length / itemsPerPage) > 1 && (
                    <Pagination className="mt-6">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>

                        {Array.from({ length: Math.ceil(filteredQuestions.length / itemsPerPage) }, (_, i) => i + 1).map((page, idx) => (
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
                            onClick={() => setCurrentPage(Math.min(Math.ceil(filteredQuestions.length / itemsPerPage), currentPage + 1))}
                            className={currentPage === Math.ceil(filteredQuestions.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">해결완료된 질문이 없습니다.</p>
                </div>
              )}
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
  const router = useRouter();
  const authorName = question.nickname || "알 수 없음";
  const authorAvatar = question.imageUrl || question.author?.avatar || "/placeholder.svg";
  const questionUrl = `/questions/${question.nickname}/${question.id}`;
  
  // 상태 한글 변환 함수
  const statusLabel = (status?: string) => {
    if (status === "OPEN") return "미해결";
    if (status === "RESOLVED") return "해결중";
    if (status === "CLOSED") return "해결완료";
    return "미해결";
  };

  const handleProfileClick = async () => {
    const profileId = question.memberProfileId || question.profileId || question.memberId;
    if (profileId) {
      try {
        // API 클라이언트를 사용하여 프로필 존재 여부 확인
        await api.get(`/members/profile/${profileId}`);
        router.push(`/profile/${profileId}`);
      } catch (error: any) {
        if (error.status === 400) {
          alert('해당 사용자의 프로필이 존재하지 않습니다.');
        } else {
          alert('프로필을 조회하는 중 오류가 발생했습니다.');
        }
      }
    }
  };
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
                <button 
                  className="text-sm font-medium hover:underline focus:outline-none" 
                  type="button"
                  onClick={handleProfileClick}
                >
                  {authorName}
                </button>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {question.createdAt ? formatReadableDate(question.createdAt) : ''}
                </span>
              </div>
              <h3 className="text-lg font-semibold mt-1 flex items-center gap-2">
                <button
                  onClick={() => router.push(questionUrl)}
                  className="text-left hover:underline hover:text-primary transition-colors focus:outline-none"
                >
                  {question.title}
                </button>
                {question.isResolved && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </h3>
              {/* 기술 스택 표시 */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {question.techStacks && question.techStacks.map((tag: any, idx: number) => (
                  <Badge key={tag + '-' + idx} variant="secondary" className="font-normal text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {/* 상태 pill과 신고 버튼 */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full border-2 shadow-sm text-black bg-gray-200 border-gray-400 min-w-[60px] text-center whitespace-nowrap"
              style={{
                color: '#111',
                background: "#e5e7eb",
                borderColor: "#9ca3af",
                lineHeight: "1.2",
                fontWeight: 600,
                fontSize: "0.75rem",
                minWidth: "60px",
                textAlign: "center"
              }}
            >
              {statusLabel(question.status)}
            </span>
            <ReportModal
              targetId={question.questionId || question.id}
              targetType="QUESTION"
              reportedMemberId={question.memberId}
              triggerText=""
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                title="신고하기"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
              </Button>
            </ReportModal>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{question.content}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            {question.commentCount ?? question.answerCount ?? 0}
          </div>
        </div>
        <Button asChild size="sm">
          <Link href={questionUrl}>답변하기</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
