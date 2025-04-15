"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, CalendarIcon, Clock, Users, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

// 임시 일정 데이터
const events = [
  {
    id: 1,
    title: "React 스터디 모임",
    date: "2023-05-15",
    startTime: "19:00",
    endTime: "21:00",
    description: "React 훅스와 상태 관리에 대해 논의합니다.",
    studyGroup: "React와 Next.js 마스터하기",
    location: "온라인 (Zoom)",
    isImportant: true,
  },
  {
    id: 2,
    title: "알고리즘 문제 풀이",
    date: "2023-05-18",
    startTime: "20:00",
    endTime: "22:00",
    description: "그래프 알고리즘 관련 문제를 함께 풀어봅니다.",
    studyGroup: "알고리즘 문제 풀이 스터디",
    location: "온라인 (Discord)",
    isImportant: false,
  },
  {
    id: 3,
    title: "Spring Security 실습",
    date: "2023-05-20",
    startTime: "14:00",
    endTime: "17:00",
    description: "JWT 인증 구현 실습을 진행합니다.",
    studyGroup: "백엔드 개발자를 위한 Spring Boot",
    location: "서울 강남구 스터디 카페",
    isImportant: true,
  },
  {
    id: 4,
    title: "Docker 컨테이너 실습",
    date: "2023-05-22",
    startTime: "19:30",
    endTime: "21:30",
    description: "Docker 컨테이너 네트워크 설정에 대해 학습합니다.",
    studyGroup: "Docker와 Kubernetes 실전 활용",
    location: "온라인 (Google Meet)",
    isImportant: false,
  },
]

// 임시 스터디 그룹 데이터
const studyGroups = [
  { id: 1, name: "React와 Next.js 마스터하기" },
  { id: 2, name: "알고리즘 문제 풀이 스터디" },
  { id: 3, name: "백엔드 개발자를 위한 Spring Boot" },
  { id: 4, name: "Docker와 Kubernetes 실전 활용" },
  { id: 5, name: "모던 자바스크립트 심화 학습" },
  { id: 6, name: "머신러닝 기초부터 실전까지" },
]

export default function CalendarPage() {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<(typeof events)[0] | null>(null)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)

  // 새 일정 상태
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
    description: "",
    studyGroup: "",
    location: "",
    isImportant: false,
    isRecurring: false,
    recurrenceType: "weekly",
  })

  // 선택된 날짜의 이벤트 필터링
  const selectedDateEvents = date ? events.filter((event) => event.date === format(date, "yyyy-MM-dd")) : []

  const handleAddEvent = () => {
    // 필수 필드 검증
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime || !newEvent.studyGroup) {
      toast({
        title: "필수 정보 누락",
        description: "제목, 날짜, 시간, 스터디 그룹은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    // 시간 검증
    if (newEvent.startTime >= newEvent.endTime) {
      toast({
        title: "시간 오류",
        description: "종료 시간은 시작 시간보다 이후여야 합니다.",
        variant: "destructive",
      })
      return
    }

    // 일정 추가 성공 (실제로는 API 호출)
    toast({
      title: "일정 추가 성공",
      description: "일정이 성공적으로 추가되었습니다.",
    })

    // 다이얼로그 닫기 및 폼 초기화
    setIsAddEventOpen(false)
    setNewEvent({
      title: "",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "10:00",
      description: "",
      studyGroup: "",
      location: "",
      isImportant: false,
      isRecurring: false,
      recurrenceType: "weekly",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">스터디 캘린더</h1>
          <p className="text-muted-foreground mt-1">스터디 일정을 관리하세요</p>
        </div>
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              일정 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>새 일정 추가</DialogTitle>
              <DialogDescription>스터디 일정 정보를 입력하세요.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">일정 제목</Label>
                <Input
                  id="title"
                  placeholder="일정 제목을 입력하세요"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">날짜</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="studyGroup">스터디 그룹</Label>
                  <Select
                    value={newEvent.studyGroup}
                    onValueChange={(value) => setNewEvent({ ...newEvent, studyGroup: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="스터디 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyGroups.map((group) => (
                        <SelectItem key={group.id} value={group.name}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">시작 시간</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">종료 시간</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">장소</Label>
                <Input
                  id="location"
                  placeholder="온라인 또는 오프라인 장소를 입력하세요"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  placeholder="일정에 대한 설명을 입력하세요"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isImportant" className="cursor-pointer">
                  중요 일정으로 표시
                </Label>
                <Switch
                  id="isImportant"
                  checked={newEvent.isImportant}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, isImportant: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isRecurring" className="cursor-pointer">
                  반복 일정
                </Label>
                <Switch
                  id="isRecurring"
                  checked={newEvent.isRecurring}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, isRecurring: checked })}
                />
              </div>
              {newEvent.isRecurring && (
                <div className="grid gap-2">
                  <Label htmlFor="recurrenceType">반복 주기</Label>
                  <Select
                    value={newEvent.recurrenceType}
                    onValueChange={(value) => setNewEvent({ ...newEvent, recurrenceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="반복 주기 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">매일</SelectItem>
                      <SelectItem value="weekly">매주</SelectItem>
                      <SelectItem value="biweekly">격주</SelectItem>
                      <SelectItem value="monthly">매월</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAddEvent}>일정 추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6">
        {/* 캘린더 */}
        <Card>
          <CardHeader>
            <CardTitle>날짜 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" locale={ko} />
          </CardContent>
        </Card>

        {/* 일정 목록 */}
        <div className="space-y-6">
          <Tabs defaultValue="day">
            <TabsList>
              <TabsTrigger value="day">일</TabsTrigger>
              <TabsTrigger value="week">주</TabsTrigger>
              <TabsTrigger value="month">월</TabsTrigger>
            </TabsList>

            <TabsContent value="day" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{date ? format(date, "PPP (eee)", { locale: ko }) : "선택된 날짜 없음"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-4 rounded-lg border cursor-pointer hover:bg-accent"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{event.title}</h3>
                                {event.isImportant && <Badge variant="destructive">중요</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{event.studyGroup}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {event.startTime} - {event.endTime}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {event.startTime} - {event.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">일정 없음</h3>
                      <p className="text-muted-foreground">선택한 날짜에 예정된 일정이 없습니다.</p>
                      <Button className="mt-4" variant="outline" onClick={() => setIsAddEventOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        일정 추가하기
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>주간 일정</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">주간 보기</h3>
                    <p className="text-muted-foreground">주간 일정 보기는 준비 중입니다.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="month" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>월간 일정</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">월간 보기</h3>
                    <p className="text-muted-foreground">월간 일정 보기는 준비 중입니다.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 일정 상세 정보 다이얼로그 */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.title}
              {selectedEvent?.isImportant && <Badge variant="destructive">중요</Badge>}
            </DialogTitle>
            <DialogDescription>{selectedEvent?.studyGroup}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{selectedEvent?.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {selectedEvent?.startTime} - {selectedEvent?.endTime}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{selectedEvent?.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{selectedEvent?.studyGroup}</span>
            </div>
            {selectedEvent?.description && (
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-2">설명</h4>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              닫기
            </Button>
            <Button variant="destructive">삭제</Button>
            <Button>수정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
