"use client"

import { useState } from "react"
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

// 임시 데이터 - 더 많은 데이터 추가
const allStudyGroups = [
  {
    id: 1,
    title: "React와 Next.js 마스터하기",
    description: "React와 Next.js의 기본부터 고급 기능까지 함께 학습하는 스터디입니다.",
    period: "2023.05.01 ~ 2023.06.30",
    recruitmentPeriod: "2023.04.15 ~ 2023.04.30",
    tags: ["React", "Next.js", "Frontend"],
    maxMembers: 8,
    currentMembers: 6,
    organizer: {
      name: "김개발",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: true,
    location: null,
  },
  {
    id: 2,
    title: "알고리즘 문제 풀이 스터디",
    description: "매주 알고리즘 문제를 함께 풀고 리뷰하는 스터디입니다.",
    period: "2023.05.15 ~ 2023.07.15",
    recruitmentPeriod: "2023.04.20 ~ 2023.05.10",
    tags: ["Algorithm", "Data Structure", "Problem Solving"],
    maxMembers: 10,
    currentMembers: 8,
    organizer: {
      name: "이코딩",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: true,
    location: null,
  },
  {
    id: 3,
    title: "백엔드 개발자를 위한 Spring Boot",
    description: "Spring Boot를 활용한 백엔드 개발 스터디입니다.",
    period: "2023.06.01 ~ 2023.08.31",
    recruitmentPeriod: "2023.05.01 ~ 2023.05.25",
    tags: ["Java", "Spring Boot", "Backend"],
    maxMembers: 6,
    currentMembers: 4,
    organizer: {
      name: "박서버",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: false,
    location: "서울 강남구",
  },
  {
    id: 4,
    title: "Docker와 Kubernetes 실전 활용",
    description: "컨테이너화 및 오케스트레이션 기술을 실습하는 스터디입니다.",
    period: "2023.06.15 ~ 2023.08.15",
    recruitmentPeriod: "2023.05.15 ~ 2023.06.10",
    tags: ["Docker", "Kubernetes", "DevOps"],
    maxMembers: 8,
    currentMembers: 3,
    organizer: {
      name: "최데브옵스",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: true,
    location: null,
  },
  {
    id: 5,
    title: "모던 자바스크립트 심화 학습",
    description: "ES6+ 기능과 최신 자바스크립트 패턴을 학습하는 스터디입니다.",
    period: "2023.07.01 ~ 2023.08.31",
    recruitmentPeriod: "2023.06.01 ~ 2023.06.25",
    tags: ["JavaScript", "ES6", "Frontend"],
    maxMembers: 12,
    currentMembers: 5,
    organizer: {
      name: "정자바",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: false,
    location: "서울 송파구",
  },
  {
    id: 6,
    title: "머신러닝 기초부터 실전까지",
    description: "머신러닝의 기본 개념부터 실제 프로젝트 적용까지 배우는 스터디입니다.",
    period: "2023.07.15 ~ 2023.09.30",
    recruitmentPeriod: "2023.06.15 ~ 2023.07.10",
    tags: ["Machine Learning", "Python", "AI"],
    maxMembers: 8,
    currentMembers: 2,
    organizer: {
      name: "한인공",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: true,
    location: null,
  },
  {
    id: 7,
    title: "웹 접근성과 시맨틱 HTML",
    description: "웹 접근성 향상을 위한 시맨틱 HTML 작성법과 ARIA 속성 활용법을 학습합니다.",
    period: "2023.08.01 ~ 2023.09.15",
    recruitmentPeriod: "2023.07.01 ~ 2023.07.25",
    tags: ["HTML", "Accessibility", "Frontend"],
    maxMembers: 10,
    currentMembers: 3,
    organizer: {
      name: "웹접근성전문가",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: true,
    location: null,
  },
  {
    id: 8,
    title: "GraphQL API 설계와 구현",
    description: "GraphQL을 활용한 효율적인 API 설계 및 구현 방법을 학습합니다.",
    period: "2023.08.15 ~ 2023.10.15",
    recruitmentPeriod: "2023.07.15 ~ 2023.08.10",
    tags: ["GraphQL", "API", "Backend"],
    maxMembers: 8,
    currentMembers: 4,
    organizer: {
      name: "그래프큐엘러",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: false,
    location: "서울 마포구",
  },
  {
    id: 9,
    title: "모바일 앱 UI/UX 디자인 스터디",
    description: "모바일 앱의 사용자 경험을 향상시키는 UI/UX 디자인 원칙과 패턴을 학습합니다.",
    period: "2023.09.01 ~ 2023.10.31",
    recruitmentPeriod: "2023.08.01 ~ 2023.08.25",
    tags: ["UI/UX", "Mobile", "Design"],
    maxMembers: 6,
    currentMembers: 2,
    organizer: {
      name: "디자이너",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: true,
    location: null,
  },
  {
    id: 10,
    title: "블록체인 기술과 스마트 컨트랙트",
    description: "블록체인 기술의 기본 개념과 이더리움 기반 스마트 컨트랙트 개발을 학습합니다.",
    period: "2023.09.15 ~ 2023.11.30",
    recruitmentPeriod: "2023.08.15 ~ 2023.09.10",
    tags: ["Blockchain", "Ethereum", "Smart Contract"],
    maxMembers: 8,
    currentMembers: 3,
    organizer: {
      name: "블록체인개발자",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: false,
    location: "서울 강남구",
  },
]

export default function StudiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [locationFilter, setLocationFilter] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<string>("latest")

  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // 페이지당 표시할 항목 수

  // 필터링된 스터디 그룹
  const filteredStudies = allStudyGroups.filter((study) => {
    const matchesSearch =
      study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTags = selectedTags.length === 0 || study.tags.some((tag) => selectedTags.includes(tag))

    const matchesLocation =
      !locationFilter ||
      (locationFilter === "online" && study.isOnline) ||
      (locationFilter === "offline" && !study.isOnline)

    return matchesSearch && matchesTags && matchesLocation
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

  // 페이지네이션 적용
  const totalPages = Math.ceil(sortedStudies.length / itemsPerPage)
  const paginatedStudies = sortedStudies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
                {Array.from(new Set(allStudyGroups.flatMap((study) => study.tags))).map((tag) => (
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
              {paginatedStudies.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paginatedStudies.map((study) => (
                      <StudyCard key={study.id} study={study} />
                    ))}
                  </div>

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

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
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
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recruiting" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedStudies
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
                {paginatedStudies
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
                {paginatedStudies
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
        </div>
      </div>
    </div>
  )
}

interface StudyCardProps {
  study: (typeof allStudyGroups)[0]
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
              {tag}
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
