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

// 임시 데이터
const studyGroups = [
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
]

export default function StudiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [locationFilter, setLocationFilter] = useState<string | null>(null)

  // 필터링된 스터디 그룹
  const filteredStudies = studyGroups.filter((study) => {
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">스터디 장소</label>
              <Select value={locationFilter || ""} onValueChange={setLocationFilter}>
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
                {Array.from(new Set(studyGroups.flatMap((study) => study.tags))).map((tag) => (
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
                <Select defaultValue="latest">
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
              {filteredStudies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredStudies.map((study) => (
                    <StudyCard key={study.id} study={study} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recruiting" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStudies.slice(0, 3).map((study) => (
                  <StudyCard key={study.id} study={study} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStudies.slice(3, 5).map((study) => (
                  <StudyCard key={study.id} study={study} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ongoing" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredStudies.slice(1, 4).map((study) => (
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
  study: (typeof studyGroups)[0]
}

function StudyCard({ study }: StudyCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold line-clamp-1">{study.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {study.period}
            </p>
          </div>
          <Badge variant={study.isOnline ? "default" : "outline"}>{study.isOnline ? "온라인" : "오프라인"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 h-10">{study.description}</p>
        {study.location && (
          <p className="text-sm text-muted-foreground mt-2 flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            {study.location}
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
          <span className="text-sm">{study.organizer.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center">
            <Users className="h-3.5 w-3.5 mr-1" />
            {study.currentMembers}/{study.maxMembers}
          </div>
          <Button asChild size="sm">
            <Link href={`/studies/${study.id}`}>상세보기</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
