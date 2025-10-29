import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Users, LogOut, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { api } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface MyStudy {
  id: number
  title: string
  createdAt: string
  groupStatus: "RECRUITING" | "IN_PROGRESS" | "COMPLETED"
}

interface StudyListProps {
  studies: MyStudy[]
  emptyMessage: string
  isCreated?: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onStudyLeave?: (studyId: number) => void
  onStudyDelete?: (studyId: number) => void
}

const ITEMS_PER_PAGE = 8

export function StudyList({ 
  studies, 
  emptyMessage, 
  isCreated = false,
  currentPage,
  totalPages,
  onPageChange,
  onStudyLeave,
  onStudyDelete
}: StudyListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null)

  const getStatusBadge = (status: MyStudy["groupStatus"]) => {
    switch (status) {
      case "RECRUITING":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">모집중</Badge>
      case "IN_PROGRESS":
        return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">진행중</Badge>
      case "COMPLETED":
        return <Badge variant="outline" className="border-gray-300 text-gray-500">완료</Badge>
      default:
        return null
    }
  }

  const handlePageChange = (page: number) => {
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleLeaveClick = (e: React.MouseEvent, studyId: number) => {
    e.stopPropagation()
    setSelectedStudyId(studyId)
    setShowLeaveDialog(true)
  }

  const handleLeaveConfirm = async () => {
    if (!selectedStudyId) return

    try {
      await api.delete(`/study-group/${selectedStudyId}/leave`)
      toast({
        title: "스터디에서 나갔습니다",
        description: "스터디 참여가 취소되었습니다",
      })
      setShowLeaveDialog(false)
      setSelectedStudyId(null)
      if (onStudyLeave) {
        onStudyLeave(selectedStudyId)
      }
    } catch (error) {
      toast({
        title: "스터디 나가기에 실패했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, studyId: number) => {
    e.stopPropagation()
    setSelectedStudyId(studyId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedStudyId) return

    try {
      await api.delete(`/study-group/${selectedStudyId}`)
      toast({
        title: "스터디가 삭제되었습니다",
        description: "스터디가 성공적으로 삭제되었습니다",
      })
      setShowDeleteDialog(false)
      setSelectedStudyId(null)
      if (onStudyDelete) {
        onStudyDelete(selectedStudyId)
      }
    } catch (error) {
      toast({
        title: "스터디 삭제에 실패했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      })
    }
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageChange(page)}
            className="h-8 w-8"
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (studies.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground text-lg mb-4">{emptyMessage}</p>
          {isCreated ? (
            <Button className="mt-4" size="lg" asChild>
              <Link href="/studies/create">스터디 만들기</Link>
            </Button>
          ) : (
            <Button className="mt-4" size="lg" asChild>
              <Link href="/studies">스터디 찾아보기</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentStudies = studies.slice(startIndex, endIndex)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentStudies.map((study) => (
          <Card 
            key={study.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 hover:scale-[1.02] group" 
            onClick={() => {
              if (study.id) {
                const url = isCreated ? `/studies/manage/${study.id}` : `/studies/${study.id}`
                router.push(url)
              } else {
                console.error("스터디 ID가 없습니다:", study)
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {study.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(study.groupStatus)}
                {study.id && (
                  <>
                    {isCreated ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => handleDeleteClick(e, study.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => handleLeaveClick(e, study.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 group-hover:text-primary transition-colors" />
                  <span>{new Date(study.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 group-hover:text-primary transition-colors" />
                  <span>{isCreated ? "스터디장" : "참여자"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {renderPagination()}

      {/* 스터디 나가기 확인 다이얼로그 */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>스터디에서 나가시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 스터디에서 나가시겠습니까? 나가면 다시 참여하려면 스터디장의 승인이 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              나가기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 스터디 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>스터디를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 스터디를 삭제하시겠습니까? 삭제된 스터디는 복구할 수 없으며, 모든 참여자들이 스터디에서 제외됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 