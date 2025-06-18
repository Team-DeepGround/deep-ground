"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { api } from "@/lib/api-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MyStudy {
  id: number
  title: string
  createdAt: string
  groupStatus: "RECRUITING" | "IN_PROGRESS" | "COMPLETED"
}

interface ApiResponse {
  status: number
  message: string
  result: MyStudy[]
}

const ITEMS_PER_PAGE = 8

export default function MyStudiesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [myStudies, setMyStudies] = useState<MyStudy[]>([])
  const [joinedStudies, setJoinedStudies] = useState<MyStudy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCreatedTab, setActiveCreatedTab] = useState("all")
  const [activeJoinedTab, setActiveJoinedTab] = useState("all")
  const [currentCreatedPage, setCurrentCreatedPage] = useState(1)
  const [currentJoinedPage, setCurrentJoinedPage] = useState(1)

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const createdResponse = await api.get("/study-group/my")
        if (createdResponse.status === 200 && createdResponse.result) {
          setMyStudies(createdResponse.result)
        }

        const joinedResponse = await api.get("/study-group/joined")
        if (joinedResponse.status === 200 && joinedResponse.result) {
          setJoinedStudies(joinedResponse.result)
        }
        
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch studies:", error)
        setIsLoading(false)
      }
    }

    fetchStudies()
  }, [])

  const getStatusBadge = (status: MyStudy["groupStatus"]) => {
    switch (status) {
      case "RECRUITING":
        return <Badge variant="secondary">모집중</Badge>
      case "IN_PROGRESS":
        return <Badge variant="default">진행중</Badge>
      case "COMPLETED":
        return <Badge variant="outline">완료</Badge>
      default:
        return null
    }
  }

  const filterStudies = (studies: MyStudy[], activeTab: string) => {
    if (activeTab === "all") return studies
    return studies.filter((study) => study.groupStatus === activeTab)
  }

  const getPaginatedStudies = (studies: MyStudy[], currentPage: number) => {
    const totalPages = Math.ceil(studies.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return {
      studies: studies.slice(startIndex, endIndex),
      totalPages
    }
  }

  const handlePageChange = (page: number, setPage: (page: number) => void) => {
    setPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  const renderPagination = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1, onPageChange)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageChange(page, onPageChange)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1, onPageChange)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const renderStudyList = (studies: MyStudy[], activeTab: string, emptyMessage: string, isCreated: boolean = false) => {
    if (studies.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
            {isCreated ? (
              <Button className="mt-4" asChild>
                <Link href="/studies/create">스터디 만들기</Link>
              </Button>
            ) : (
              <Button className="mt-4" asChild>
                <Link href="/studies">스터디 찾아보기</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studies.map((study) => (
            <Card 
              key={study.id} 
              className="cursor-pointer hover:bg-accent/50" 
              onClick={() => router.push(isCreated ? `/studies/manage/${study.id}` : `/studies/${study.id}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">{study.title}</CardTitle>
                {getStatusBadge(study.groupStatus)}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  생성일: {new Date(study.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    )
  }

  const filteredCreatedStudies = filterStudies(myStudies, activeCreatedTab)
  const filteredJoinedStudies = filterStudies(joinedStudies, activeJoinedTab)
  const { studies: currentCreatedStudies, totalPages: totalCreatedPages } = getPaginatedStudies(filteredCreatedStudies, currentCreatedPage)
  const { studies: currentJoinedStudies, totalPages: totalJoinedPages } = getPaginatedStudies(filteredJoinedStudies, currentJoinedPage)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">내 스터디</h1>
          <Button onClick={() => router.push("/studies/create")}>
            <Plus className="mr-2 h-4 w-4" />
            스터디 만들기
          </Button>
        </div>

        <div className="space-y-8">
          {/* 내가 만든 스터디 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">내가 만든 스터디</h2>
              <span className="text-sm text-muted-foreground">{myStudies.length}개</span>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={(value) => {
              setActiveCreatedTab(value)
              setCurrentCreatedPage(1)
            }}>
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="RECRUITING">모집중</TabsTrigger>
                <TabsTrigger value="IN_PROGRESS">진행중</TabsTrigger>
                <TabsTrigger value="COMPLETED">완료</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {renderStudyList(currentCreatedStudies, activeCreatedTab, "아직 만든 스터디가 없습니다.", true)}
                {renderPagination(currentCreatedPage, totalCreatedPages, setCurrentCreatedPage)}
              </TabsContent>

              <TabsContent value="RECRUITING" className="mt-0">
                {renderStudyList(currentCreatedStudies, activeCreatedTab, "모집중인 스터디가 없습니다.", true)}
                {renderPagination(currentCreatedPage, totalCreatedPages, setCurrentCreatedPage)}
              </TabsContent>

              <TabsContent value="IN_PROGRESS" className="mt-0">
                {renderStudyList(currentCreatedStudies, activeCreatedTab, "진행중인 스터디가 없습니다.", true)}
                {renderPagination(currentCreatedPage, totalCreatedPages, setCurrentCreatedPage)}
              </TabsContent>

              <TabsContent value="COMPLETED" className="mt-0">
                {renderStudyList(currentCreatedStudies, activeCreatedTab, "완료된 스터디가 없습니다.", true)}
                {renderPagination(currentCreatedPage, totalCreatedPages, setCurrentCreatedPage)}
              </TabsContent>
            </Tabs>
          </div>

          {/* 내가 참여한 스터디 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">내가 참여한 스터디</h2>
              <span className="text-sm text-muted-foreground">{joinedStudies.length}개</span>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={(value) => {
              setActiveJoinedTab(value)
              setCurrentJoinedPage(1)
            }}>
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="RECRUITING">모집중</TabsTrigger>
                <TabsTrigger value="IN_PROGRESS">진행중</TabsTrigger>
                <TabsTrigger value="COMPLETED">완료</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {renderStudyList(currentJoinedStudies, activeJoinedTab, "아직 참여한 스터디가 없습니다.")}
                {renderPagination(currentJoinedPage, totalJoinedPages, setCurrentJoinedPage)}
              </TabsContent>

              <TabsContent value="RECRUITING" className="mt-0">
                {renderStudyList(currentJoinedStudies, activeJoinedTab, "모집중인 스터디가 없습니다.")}
                {renderPagination(currentJoinedPage, totalJoinedPages, setCurrentJoinedPage)}
              </TabsContent>

              <TabsContent value="IN_PROGRESS" className="mt-0">
                {renderStudyList(currentJoinedStudies, activeJoinedTab, "진행중인 스터디가 없습니다.")}
                {renderPagination(currentJoinedPage, totalJoinedPages, setCurrentJoinedPage)}
              </TabsContent>

              <TabsContent value="COMPLETED" className="mt-0">
                {renderStudyList(currentJoinedStudies, activeJoinedTab, "완료된 스터디가 없습니다.")}
                {renderPagination(currentJoinedPage, totalJoinedPages, setCurrentJoinedPage)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
