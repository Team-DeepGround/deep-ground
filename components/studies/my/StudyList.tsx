import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Users } from "lucide-react"
import Link from "next/link"

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
}

const ITEMS_PER_PAGE = 8

export function StudyList({ 
  studies, 
  emptyMessage, 
  isCreated = false,
  currentPage,
  totalPages,
  onPageChange
}: StudyListProps) {
  const router = useRouter()

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
            onClick={() => router.push(isCreated ? `/studies/manage/${study.id}` : `/studies/${study.id}`)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {study.title}
              </CardTitle>
              {getStatusBadge(study.groupStatus)}
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
    </>
  )
} 