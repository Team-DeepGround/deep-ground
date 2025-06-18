"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { api } from "@/lib/api-client"
import { StudyList } from "@/components/studies/my/StudyList"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

interface MyStudy {
  id: number
  title: string
  createdAt: string
  groupStatus: "RECRUITING" | "IN_PROGRESS" | "COMPLETED"
}

interface JoinedStudy {
  studyGroupId: number
  title: string
  createdBy: string
  participatedAt: string
}

const ITEMS_PER_PAGE = 8

export default function MyStudiesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [createdStudies, setCreatedStudies] = useState<MyStudy[]>([])
  const [joinedStudies, setJoinedStudies] = useState<MyStudy[]>([])
  const [createdCurrentPage, setCreatedCurrentPage] = useState(1)
  const [joinedCurrentPage, setJoinedCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 데이터 가져오기
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setError(null)
        const createdResponse = await api.get("/study-group/my")
        if (createdResponse.status === 200 && createdResponse.result) {
          setCreatedStudies(createdResponse.result)
        } else if (createdResponse.status === 401) {
          toast({
            title: "로그인이 필요합니다",
            description: "스터디 목록을 보려면 로그인해주세요.",
            variant: "destructive",
          })
          router.push("/auth/login")
          return
        }

        const joinedResponse = await api.get("/study-group/joined")
        if (joinedResponse.status === 200 && joinedResponse.result) {
          // 참여한 스터디 데이터 형식 변환
          const formattedJoinedStudies: MyStudy[] = joinedResponse.result.map((study: JoinedStudy) => ({
            id: study.studyGroupId,
            title: study.title,
            createdAt: study.participatedAt,
            groupStatus: "IN_PROGRESS" as const // 참여한 스터디는 진행중 상태로 표시
          }))
          setJoinedStudies(formattedJoinedStudies)
        } else if (joinedResponse.status === 401) {
          toast({
            title: "로그인이 필요합니다",
            description: "스터디 목록을 보려면 로그인해주세요.",
            variant: "destructive",
          })
          router.push("/auth/login")
          return
        }
      } catch (error) {
        console.error("Failed to fetch studies:", error)
        setError("스터디 목록을 불러오는데 실패했습니다")
        toast({
          title: "스터디 목록을 불러오는데 실패했습니다",
          description: "잠시 후 다시 시도해주세요.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudies()
  }, [router, toast])

  // 페이지 번호 리셋
  useEffect(() => {
    const createdTotalPages = Math.ceil(createdStudies.length / ITEMS_PER_PAGE)
    const joinedTotalPages = Math.ceil(joinedStudies.length / ITEMS_PER_PAGE)

    if (createdCurrentPage > createdTotalPages && createdTotalPages > 0) {
      setCreatedCurrentPage(1)
    }
    if (joinedCurrentPage > joinedTotalPages && joinedTotalPages > 0) {
      setJoinedCurrentPage(1)
    }
  }, [createdStudies, joinedStudies, createdCurrentPage, joinedCurrentPage])

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </div>
    )
  }

  const createdTotalPages = Math.ceil(createdStudies.length / ITEMS_PER_PAGE)
  const joinedTotalPages = Math.ceil(joinedStudies.length / ITEMS_PER_PAGE)

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

        <div className="space-y-12">
          {/* 내가 만든 스터디 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">내가 만든 스터디</h2>
              <span className="text-sm text-muted-foreground">{createdStudies.length}개</span>
            </div>
            <StudyList 
              studies={createdStudies}
              emptyMessage="아직 만든 스터디가 없습니다."
              isCreated
              currentPage={createdCurrentPage}
              totalPages={createdTotalPages}
              onPageChange={setCreatedCurrentPage}
            />
          </div>

          <Separator className="my-8" />

          {/* 내가 참여한 스터디 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">내가 참여한 스터디</h2>
              <span className="text-sm text-muted-foreground">{joinedStudies.length}개</span>
            </div>
            <StudyList 
              studies={joinedStudies}
              emptyMessage="아직 참여한 스터디가 없습니다."
              currentPage={joinedCurrentPage}
              totalPages={joinedTotalPages}
              onPageChange={setJoinedCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
