import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function StudyFilterSidebarSkeleton() {
  return (
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
              disabled
              placeholder="스터디 검색..."
              className="pl-8 opacity-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">스터디 장소</label>
          <Select disabled>
            <SelectTrigger className="opacity-50">
              <SelectValue placeholder="모든 장소" />
            </SelectTrigger>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">기술 태그</label>
          <div className="flex flex-wrap gap-2 min-h-[200px]">
            {/* 실제 태그 개수만큼 빈 공간 생성 */}
            {Array.from({ length: 50 }).map((_, index) => (
              <div
                key={index}
                className="w-0 h-0"
                style={{ 
                  width: `${Math.floor(Math.random() * 60) + 40}px`,
                  height: '24px'
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 