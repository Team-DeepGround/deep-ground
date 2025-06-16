"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users, Search, Filter, Plus, MapPin } from "lucide-react"
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
import { TECH_TAG_LABELS, toServerTechTag, toClientTechTag, AVAILABLE_TECH_TAGS } from "@/lib/constants/tech-tags"

interface StudyGroup {
  id: number;
  title: string;
  description: string;
  period: string;
  recruitmentPeriod: string;
  tags: string[];
  maxMembers: number;
  currentMembers: number;
  organizer: {
    name: string;
    avatar: string;
  };
  isOnline: boolean;
  location: string;
}

interface StudyGroupSearchResponse {
  status: number;
  message: string;
  result: {
    content: StudyGroup[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      offset: number;
      unpaged: boolean;
      paged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
  };
}

export default function StudiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [locationFilter, setLocationFilter] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<string>("latest")
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // 페이지당 표시할 항목 수
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchStudyGroups = async () => {
      try {
        const params: any = {
          keyword: searchTerm,
          groupStatus: "RECRUITING",
          page: String(currentPage - 1),
          size: String(itemsPerPage),
        };
        if (selectedTags.length > 0) {
          params.techTags = selectedTags.map(toServerTechTag);
        }
        const response = await api.get('/study-group/search', {
          params
        }) as StudyGroupSearchResponse;
        setStudyGroups(response.result.content)
        setTotalPages(response.result.totalPages)
      } catch (error) {
        console.error('스터디 목록 조회 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudyGroups()
  }, [searchTerm, currentPage, selectedTags])

  // 필터링된 스터디 그룹
  const filteredStudies = studyGroups.filter((study) => {
    const matchesLocation =
      !locationFilter ||
      (locationFilter === "online" && study.isOnline) ||
      (locationFilter === "offline" && !study.isOnline)

    return matchesLocation
  })

  // 정렬된 스터디
  const sortedStudies = [...filteredStudies].sort((a, b) => {
    if (sortOrder === "latest") {
      return (
        new Date(b.recruitmentPeriod.split(" ~ ")[0]).getTime() -
        new Date(a.recruitmentPeriod.split(" ~ ")[0]).getTime()
      )
    } else if (sortOrder === "popular") {
      return b.currentMembers / b.maxMembers - a.currentMembers / a.maxMembers
    } else if (sortOrder === "closing") {
      return (
        new Date(a.recruitmentPeriod.split(" ~ ")[1]).getTime() -
        new Date(b.recruitmentPeriod.split(" ~ ")[1]).getTime()
      )
    }
    return 0
  })

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">스터디 찾기</h1>
          <p className="text-muted-foreground mt-1">관심 있는 스터디를 찾아보세요</p>
        </div>
        <Button asChild>
          <Link href="/studies/create">
            <Plus className="mr-2 h-4 w-4" />
            스터디 개설하기
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
                  placeholder="스터디 검색..."
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
              <label className="text-sm font-medium">스터디 장소</label>
              <Select
                value={locationFilter || ""}
                onValueChange={(value) => {
                  setLocationFilter(value === "all" ? null : value)
                  setCurrentPage(1) // 필터 변경 시 첫 페이지로 이동
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="모든 장소" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 장소</SelectItem>
                  <SelectItem value="online">온라인</SelectItem>
                  <SelectItem value="offline">오프라인</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">기술 태그</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TECH_TAGS.map((tag) => (
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

        {/* 스터디 목록 */}
        <div className="space-y-6">
          <Tabs defaultValue="all">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="recruiting">모집 중</TabsTrigger>
                <TabsTrigger value="upcoming">시작 예정</TabsTrigger>
                <TabsTrigger value="ongoing">진행 중</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  defaultValue="latest"
                  value={sortOrder}
                  onValueChange={(value) => {
                    setSortOrder(value)
                    setCurrentPage(1) // 정렬 변경 시 첫 페이지로 이동
                  }}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="정렬" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">최신순</SelectItem>
                    <SelectItem value="popular">인기순</SelectItem>
                    <SelectItem value="closing">마감임박순</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="mt-6">
              {sortedStudies.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedStudies.map((study) => (
                      <StudyCard key={study.id} study={study} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recruiting" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedStudies
                  .filter((study) => {
                    const now = new Date()
                    const recruitEnd = new Date(study.recruitmentPeriod.split(" ~ ")[1])
                    return recruitEnd >= now
                  })
                  .map((study) => (
                    <StudyCard key={study.id} study={study} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedStudies
                  .filter((study) => {
                    const now = new Date()
                    const studyStart = new Date(study.period.split(" ~ ")[0])
                    return studyStart > now
                  })
                  .map((study) => (
                    <StudyCard key={study.id} study={study} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="ongoing" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedStudies
                  .filter((study) => {
                    const now = new Date()
                    const studyStart = new Date(study.period.split(" ~ ")[0])
                    const studyEnd = new Date(study.period.split(" ~ ")[1])
                    return studyStart <= now && studyEnd >= now
                  })
                  .map((study) => (
                    <StudyCard key={study.id} study={study} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  )
}

interface StudyCardProps {
  study: StudyGroup
}

function StudyCard({ study }: StudyCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold line-clamp-1">{study.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">{study.period}</span>
            </p>
          </div>
          <Badge variant={study.isOnline ? "default" : "outline"} className="whitespace-nowrap flex-shrink-0">
            {study.isOnline ? "온라인" : "오프라인"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 h-10">{study.description}</p>
        {study.location && (
          <p className="text-sm text-muted-foreground mt-2 flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{study.location}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {study.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {toClientTechTag(tag)}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={study.organizer.avatar || "/placeholder.svg"} alt={study.organizer.name} />
            <AvatarFallback>{study.organizer.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm truncate">{study.organizer.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center">
            <Users className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span>
              {study.currentMembers}/{study.maxMembers}
            </span>
          </div>
          <Button asChild size="sm" className="flex-shrink-0">
            <Link href={`/studies/${study.id}`}>상세보기</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
