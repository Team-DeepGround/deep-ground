import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudyList } from "./StudyList"
import { StudyPagination } from "./StudyPagination"

interface MyStudy {
  id: number
  title: string
  createdAt: string
  groupStatus: "RECRUITING" | "IN_PROGRESS" | "COMPLETED"
}

interface StudyTabsProps {
  createdStudies: MyStudy[]
  joinedStudies: MyStudy[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function StudyTabs({ 
  createdStudies, 
  joinedStudies, 
  currentPage, 
  totalPages, 
  onPageChange 
}: StudyTabsProps) {
  return (
    <Tabs defaultValue="created" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="created">내가 만든 스터디</TabsTrigger>
        <TabsTrigger value="joined">참여 중인 스터디</TabsTrigger>
      </TabsList>
      <TabsContent value="created">
        <StudyList 
          studies={createdStudies} 
          emptyMessage="아직 만든 스터디가 없습니다." 
          isCreated 
        />
        <StudyPagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      </TabsContent>
      <TabsContent value="joined">
        <StudyList 
          studies={joinedStudies} 
          emptyMessage="아직 참여 중인 스터디가 없습니다." 
        />
        <StudyPagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      </TabsContent>
    </Tabs>
  )
} 