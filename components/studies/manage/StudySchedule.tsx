import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, MapPin, Settings, Users } from "lucide-react"

// 더미 일정 데이터
const dummySchedules = [
  {
    id: 1,
    title: "React 기초 학습",
    date: "2024-03-01",
    time: "19:00",
    location: "온라인",
    description: "React의 기본 개념과 컴포넌트 구조에 대해 학습합니다.",
    participants: 5
  },
  {
    id: 2,
    title: "TypeScript 심화",
    date: "2024-03-08",
    time: "19:00",
    location: "온라인",
    description: "TypeScript의 고급 타입과 제네릭에 대해 학습합니다.",
    participants: 4
  },
  {
    id: 3,
    title: "프로젝트 기획 회의",
    date: "2024-03-15",
    time: "19:00",
    location: "온라인",
    description: "최종 프로젝트 주제 선정 및 역할 분담을 진행합니다.",
    participants: 6
  }
]

export function StudySchedule() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>일정 관리</CardTitle>
          <CardDescription>스터디 일정을 관리하세요</CardDescription>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          일정 추가
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dummySchedules.map((schedule) => (
            <div key={schedule.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{schedule.title}</h3>
                  <Badge variant="outline">
                    {schedule.date} {schedule.time}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{schedule.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {schedule.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {schedule.participants}명 참여
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  상세보기
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  수정
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 