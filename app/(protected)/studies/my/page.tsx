"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { api } from "@/lib/api-client"
import { StudyList } from "@/components/studies/my/StudyList"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"

interface MyStudy {
  id: number;
  title: string;
  createdAt: string;
  organizer: {
    nickname: string;
  };
  groupStatus: "RECRUITING" | "IN_PROGRESS" | "COMPLETED";
}

interface JoinedStudy {
  studyGroupId?: number
  id?: number
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
          const formattedJoinedStudies: MyStudy[] = joinedResponse.result.map((study: any) => {
            const studyId = study.studyGroupId || study.id
            return {
              id: studyId, // studyGroupId가 없으면 id 사용
              title: study.title,
              createdAt: study.participatedAt, 
              organizer: {
                nickname: study.createdBy || study.writer || 'unknown',
              },
              groupStatus: "IN_PROGRESS" as const // 참여한 스터디는 진행중 상태로 표시
            }
          }).filter((study: MyStudy) => {
            return study.id && study.id !== undefined
          }) // id가 있는 스터디만 필터링
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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">내 스터디</h1>
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>

          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">내가 만든 스터디</h2>
                <div className="h-5 w-12 bg-muted rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="h-5 bg-muted rounded animate-pulse mb-1.5 w-2/3" />
                          <div className="flex items-center gap-1">
                            <div className="h-3.5 w-3.5 bg-muted rounded animate-pulse" />
                            <div className="h-3.5 bg-muted rounded animate-pulse w-20" />
                          </div>
                        </div>
                        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="h-3.5 w-3.5 bg-muted rounded animate-pulse" />
                          <div className="h-3.5 bg-muted rounded animate-pulse w-20" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3.5 w-3.5 bg-muted rounded animate-pulse" />
                          <div className="h-3.5 bg-muted rounded animate-pulse w-12" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="h-px bg-border" />

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">내가 참여한 스터디</h2>
                <div className="h-5 w-12 bg-muted rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="h-5 bg-muted rounded animate-pulse mb-1.5 w-2/3" />
                          <div className="flex items-center gap-1">
                            <div className="h-3.5 w-3.5 bg-muted rounded animate-pulse" />
                            <div className="h-3.5 bg-muted rounded animate-pulse w-20" />
                          </div>
                        </div>
                        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="h-3.5 w-3.5 bg-muted rounded animate-pulse" />
                          <div className="h-3.5 bg-muted rounded animate-pulse w-20" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3.5 w-3.5 bg-muted rounded animate-pulse" />
                          <div className="h-3.5 bg-muted rounded animate-pulse w-12" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
              onStudyDelete={(studyId) => {
                setCreatedStudies(prev => prev.filter(study => study.id !== studyId))
                if (createdCurrentPage > 1 && createdStudies.length <= (createdCurrentPage - 1) * ITEMS_PER_PAGE) {
                  setCreatedCurrentPage(createdCurrentPage - 1)
                }
              }}
            />
          </div>

          <Separator className="my-8" />

          {/* 내가 참여한 스터디 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">내가 참여한 스터디</h2>
              <span className="text-sm text-muted-foreground">{joinedStudies.length}</span>
            </div>
            <StudyList 
              studies={joinedStudies}
              emptyMessage="아직 참여한 스터디가 없습니다."
              currentPage={joinedCurrentPage}
              totalPages={joinedTotalPages}
              onPageChange={setJoinedCurrentPage}
              onStudyLeave={(studyId) => {
                setJoinedStudies(prev => prev.filter(study => study.id !== studyId))
                if (joinedCurrentPage > 1 && joinedStudies.length <= (joinedCurrentPage - 1) * ITEMS_PER_PAGE) {
                  setJoinedCurrentPage(joinedCurrentPage - 1)
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
