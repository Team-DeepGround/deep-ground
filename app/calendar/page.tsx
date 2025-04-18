"use client"

import { useState, useEffect } from "react"
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
import { Plus, CalendarIcon, Clock, Users, MapPin, CheckCircle, XIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns"
import { ko } from "date-fns/locale"

// 임시 일정 데이터 - 더 많은 더미 데이터 추가
const events = [
  {
    id: 1,
    title: "React 스터디 모임",
    date: "2025-04-15",
    startTime: "19:00",
    endTime: "21:00",
    description: "React 훅스와 상태 관리에 대해 논의합니다.",
    studyGroup: "React와 Next.js 마스터하기",
    location: "온라인 (Zoom)",
    isImportant: true,
    isCompleted: false,
  },
  {
    id: 2,
    title: "알고리즘 문제 풀이",
    date: "2025-04-18",
    startTime: "20:00",
    endTime: "22:00",
    description: "그래프 알고리즘 관련 문제를 함께 풀어봅니다.",
    studyGroup: "알고리즘 문제 풀이 스터디",
    location: "온라인 (Discord)",
    isImportant: false,
    isCompleted: true,
  },
  {
    id: 3,
    title: "Spring Security 실습",
    date: "2025-04-20",
    startTime: "14:00",
    endTime: "17:00",
    description: "JWT 인증 구현 실습을 진행합니다.",
    studyGroup: "백엔드 개발자를 위한 Spring Boot",
    location: "서울 강남구 스터디 카페",
    isImportant: true,
    isCompleted: false,
  },
  {
    id: 4,
    title: "Docker 컨테이너 실습",
    date: "2025-04-22",
    startTime: "19:30",
    endTime: "21:30",
    description: "Docker 컨테이너 네트워크 설정에 대해 학습합니다.",
    studyGroup: "Docker와 Kubernetes 실전 활용",
    location: "온라인 (Google Meet)",
    isImportant: false,
    isCompleted: false,
  },
  {
    id: 5,
    title: "JavaScript 심화 학습",
    date: "2025-04-16",
    startTime: "18:30",
    endTime: "20:30",
    description: "클로저와 프로토타입에 대해 학습합니다.",
    studyGroup: "모던 자바스크립트 심화 학습",
    location: "온라인 (Zoom)",
    isImportant: false,
    isCompleted: false,
  },
  {
    id: 6,
    title: "머신러닝 기초",
    date: "2025-04-17",
    startTime: "19:00",
    endTime: "21:00",
    description: "머신러닝 기초 개념과 파이썬 라이브러리를 학습합니다.",
    studyGroup: "머신러닝 기초부터 실전까지",
    location: "온라인 (Google Meet)",
    isImportant: true,
    isCompleted: false,
  },
  {
    id: 7,
    title: "TypeScript 타입 시스템",
    date: "2025-04-19",
    startTime: "20:00",
    endTime: "22:00",
    description: "TypeScript의 고급 타입 시스템에 대해 학습합니다.",
    studyGroup: "모던 자바스크립트 심화 학습",
    location: "온라인 (Discord)",
    isImportant: false,
    isCompleted: false,
  },
  // 추가 더미 데이터
  {
    id: 8,
    title: "GraphQL API 설계",
    date: "2025-04-23",
    startTime: "18:00",
    endTime: "20:00",
    description: "GraphQL 스키마 설계와 쿼리 최적화에 대해 논의합니다.",
    studyGroup: "백엔드 개발자를 위한 API 설계",
    location: "온라인 (Zoom)",
    isImportant: true,
    isCompleted: false,
  },
  {
    id: 9,
    title: "React Native 기초",
    date: "2025-04-24",
    startTime: "19:00",
    endTime: "21:00",
    description: "React Native 환경 설정과 기본 컴포넌트에 대해 학습합니다.",
    studyGroup: "모바일 앱 개발 스터디",
    location: "온라인 (Google Meet)",
    isImportant: false,
    isCompleted: false,
  },
  {
    id: 10,
    title: "데이터베이스 설계 원칙",
    date: "2025-04-25",
    startTime: "20:00",
    endTime: "22:00",
    description: "관계형 데이터베이스 설계 원칙과 정규화에 대해 학습합니다.",
    studyGroup: "데이터베이스 마스터 스터디",
    location: "서울 강남구 스터디 카페",
    isImportant: true,
    isCompleted: false,
  },
  {
    id: 11,
    title: "CI/CD 파이프라인 구축",
    date: "2025-04-26",
    startTime: "18:30",
    endTime: "20:30",
    description: "GitHub Actions를 활용한 CI/CD 파이프라인 구축 방법을 학습합니다.",
    studyGroup: "DevOps 실전 스터디",
    location: "온라인 (Discord)",
    isImportant: false,
    isCompleted: false,
  },
  {
    id: 12,
    title: "웹 접근성 향상 기법",
    date: "2025-04-27",
    startTime: "14:00",
    endTime: "16:00",
    description: "웹 접근성 표준과 ARIA 속성 활용법에 대해 학습합니다.",
    studyGroup: "프론트엔드 개발자 모임",
    location: "온라인 (Zoom)",
    isImportant: false,
    isCompleted: false,
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
  { id: 7, name: "백엔드 개발자를 위한 API 설계" },
  { id: 8, name: "모바일 앱 개발 스터디" },
  { id: 9, name: "데이터베이스 마스터 스터디" },
  { id: 10, name: "DevOps 실전 스터디" },
  { id: 11, name: "프론트엔드 개발자 모임" },
]

export default function CalendarPage() {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [selectedEvent, setSelectedEvent] = useState<(typeof events)[0] | null>(null)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("month") // 기본값을 month로 변경

  // 이벤트 완료 상태 관리
  const [completedEvents, setCompletedEvents] = useState<Record<number, boolean>>({})

  // 새 일정 상태 부분을 수정합니다 - 개인 일정 추가 기능 제거
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
    notes: "",
    isVisible: true,
  })

  // 이벤트 메모 및 가시성 상태 관리
  const [eventNotes, setEventNotes] = useState<Record<number, string>>({})
  const [eventVisibility, setEventVisibility] = useState<Record<number, boolean>>({})

  // 주간 뷰를 위한 날짜 범위 계산
  const weekStart = date ? startOfWeek(date, { weekStartsOn: 1 }) : undefined
  const weekEnd = date ? endOfWeek(date, { weekStartsOn: 1 }) : undefined
  const weekDays = weekStart && weekEnd ? eachDayOfInterval({ start: weekStart, end: weekEnd }) : []

  // 월간 뷰를 위한 날짜 범위 계산
  const monthStart = date ? startOfMonth(date) : undefined
  const monthEnd = date ? endOfMonth(date) : undefined
  const monthDays = monthStart && monthEnd ? eachDayOfInterval({ start: monthStart, end: monthEnd }) : []

  // 주간 이벤트 필터링
  const weekEvents =
    weekStart && weekEnd
      ? events.filter((event) => {
          const eventDate = new Date(event.date)
          return eventDate >= weekStart && eventDate <= weekEnd
        })
      : []

  // 월간 이벤트 필터링
  const monthEvents =
    monthStart && monthEnd
      ? events.filter((event) => {
          const eventDate = new Date(event.date)
          return eventDate >= monthStart && eventDate <= monthEnd
        })
      : []

  // 컴포넌트 초기화 시 이벤트 가시성 및 완료 상태 설정
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window !== "undefined") {
      const initialVisibility: Record<number, boolean> = {}
      const initialCompletedState: Record<number, boolean> = {}

      events.forEach((event) => {
        initialVisibility[event.id] = true
        initialCompletedState[event.id] = event.isCompleted || false
      })

      setEventVisibility(initialVisibility)
      setCompletedEvents(initialCompletedState)
    }
  }, [])

  // 컴포넌트 마운트 시 날짜 초기화
  useEffect(() => {
    setDate(new Date())
  }, [])

  // 이벤트 가시성 토글 함수
  const toggleEventVisibility = (eventId: number) => {
    setEventVisibility((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }))

    toast({
      title: "일정 표시 설정 변경",
      description: !eventVisibility[eventId] ? "일정이 강조 표시됩니다." : "일정이 흐리게 표시됩니다.",
    })
  }

  // 이벤트 완료 상태 토글 함수
  const toggleEventCompletion = (eventId: number) => {
    setCompletedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }))

    toast({
      title: completedEvents[eventId] ? "일정 미완료 처리" : "일정 완료 처리",
      description: completedEvents[eventId] ? "일정을 미완료 상태로 변경했습니다." : "일정을 완료 상태로 변경했습니다.",
    })
  }

  // 이벤트 메모 업데이트 함수
  const updateEventNotes = (eventId: number, notes: string) => {
    setEventNotes((prev) => ({
      ...prev,
      [eventId]: notes,
    }))

    toast({
      title: "메모 저장 완료",
      description: "일정에 메모가 저장되었습니다.",
    })
  }

  // 선택된 날짜의 이벤트 필터링
  const selectedDateEvents = date ? events.filter((event) => event.date === format(date, "yyyy-MM-dd")) : []

  // 필터링된 이벤트 - 가시성 설정 적용
  // const filteredSelectedDateEvents = selectedDateEvents.filter((event) => eventVisibility[event.id] !== false)
  // const filteredWeekEvents = weekEvents.filter((event) => eventVisibility[event.id] !== false)
  // const filteredMonthEvents = monthEvents.filter((event) => eventVisibility[event.id] !== false)

  // 대신 모든 이벤트를 사용하고 스타일로 구분:
  const filteredSelectedDateEvents = selectedDateEvents
  const filteredWeekEvents = weekEvents
  const filteredMonthEvents = monthEvents

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
      notes: "",
      isVisible: true,
    })
  }

  // 시간대 생성 (30분 간격)
  const timeSlots = Array.from({ length: 32 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8 // 8시부터 시작
    const minute = i % 2 === 0 ? "00" : "30"
    return `${hour.toString().padStart(2, "0")}:${minute}`
  })

  // 이벤트 시간 위치 계산
  const getEventPosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const totalMinutes = hours * 60 + minutes
    const startMinutes = 8 * 60 // 8시부터 시작
    return ((totalMinutes - startMinutes) / 30) * 40 // 각 슬롯 높이 40px
  }

  // 이벤트 높이 계산
  const getEventHeight = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)
    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes
    const durationMinutes = endTotalMinutes - startTotalMinutes
    return (durationMinutes / 30) * 40 // 각 슬롯 높이 40px
  }

  // 스터디장 여부 확인 (실제로는 API에서 가져와야 함)
  const isStudyLeader = (studyGroupId: number): boolean => {
    // 임시로 1, 3번 스터디의 리더라고 가정
    return [1, 3].includes(studyGroupId)
  }

  // 클라이언트 사이드 렌더링 확인
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 클라이언트 사이드에서만 렌더링
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-[400px]">
          <p className="text-muted-foreground">캘린더를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">스터디 캘린더</h1>
          <p className="text-muted-foreground mt-1">스터디 일정을 관리하세요</p>
        </div>
        {/* 일정 추가 버튼 부분을 수정합니다 - 스터디장만 추가 가능하도록 */}
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />팀 일정 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>새 팀 일정 추가</DialogTitle>
              <DialogDescription>스터디 리더만 팀 일정을 추가할 수 있습니다.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="studyGroup">스터디 그룹</Label>
                <Select
                  value={newEvent.studyGroup}
                  onValueChange={(value) => {
                    const studyGroup = studyGroups.find((g) => g.name === value)
                    setNewEvent({
                      ...newEvent,
                      studyGroup: value,
                      // 선택한 스터디 그룹의 ID 저장
                      teamId: studyGroup ? studyGroup.id.toString() : "",
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="스터디 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {studyGroups
                      .filter((group) => isStudyLeader(group.id)) // 스터디장인 그룹만 필터링
                      .map((group) => (
                        <SelectItem key={group.id} value={group.name}>
                          {group.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {!studyGroups.some((group) => isStudyLeader(group.id)) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    스터디 리더인 그룹이 없습니다. 스터디 리더만 팀 일정을 추가할 수 있습니다.
                  </p>
                )}
              </div>

              {newEvent.studyGroup &&
                isStudyLeader(studyGroups.find((g) => g.name === newEvent.studyGroup)?.id || 0) && (
                  <>
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
                  </>
                )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                취소
              </Button>
              <Button
                onClick={handleAddEvent}
                disabled={
                  !newEvent.studyGroup ||
                  !isStudyLeader(studyGroups.find((g) => g.name === newEvent.studyGroup)?.id || 0)
                }
              >
                일정 추가
              </Button>
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
          <Tabs
            defaultValue="month"
            value={calendarView}
            onValueChange={(value) => setCalendarView(value as "day" | "week" | "month")}
          >
            <TabsList>
              <TabsTrigger value="day">일</TabsTrigger>
              <TabsTrigger value="week">주</TabsTrigger>
              <TabsTrigger value="month">월</TabsTrigger>
            </TabsList>

            {/* 일별 뷰에서도 필터링된 이벤트 사용하도록 수정 */}
            <TabsContent value="day" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{date ? format(date, "PPP (eee)", { locale: ko }) : "선택된 날짜 없음"}</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredSelectedDateEvents.length > 0 ? (
                    <div className="space-y-4">
                      {filteredSelectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-4 rounded-lg border cursor-pointer hover:bg-accent ${
                            eventVisibility[event.id] === false ? "opacity-40 bg-gray-100" : ""
                          }`}
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
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`${completedEvents[event.id] ? "text-green-500" : "text-muted-foreground"}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleEventCompletion(event.id)
                                }}
                              >
                                <CheckCircle className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleEventVisibility(event.id)
                                }}
                              >
                                <XIcon className="h-5 w-5" />
                              </Button>
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
                          {eventNotes[event.id] && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                              <p className="text-xs font-medium mb-1">내 메모:</p>
                              <p className="text-muted-foreground">{eventNotes[event.id]}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">일정 없음</h3>
                      <p className="text-muted-foreground">선택한 날짜에 예정된 일정이 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 주간 캘린더 뷰 부분을 수정합니다 - 시간과 날짜 선 정렬 및 스크롤 시 구분선 유지 */}
            <TabsContent value="week" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {weekStart ? format(weekStart, "yyyy년 MM월 dd일", { locale: ko }) : ""} -{" "}
                    {weekEnd ? format(weekEnd, "MM월 dd일", { locale: ko }) : ""}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {weekDays.map((day) => (
                      <div key={day.toString()} className="text-center">
                        <div className="font-medium">{format(day, "EEE", { locale: ko })}</div>
                        <div
                          className={`text-sm rounded-full w-8 h-8 flex items-center justify-center mx-auto ${
                            format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
                        >
                          {format(day, "d")}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative border rounded-md mt-4">
                    {/* 날짜 헤더 */}
                    <div className="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b">
                      <div className="p-2 text-center border-r"></div>
                      {weekDays.map((day) => (
                        <div
                          key={day.toString()}
                          className="p-2 text-center border-r last:border-r-0"
                          onClick={() => setDate(day)}
                        >
                          <div className="text-sm font-medium">{format(day, "M/d")}</div>
                        </div>
                      ))}
                    </div>

                    <div className="relative overflow-auto" style={{ height: "600px" }}>
                      <div
                        className="grid grid-cols-[64px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] min-w-full"
                        style={{ height: "1280px" }}
                      >
                        {/* 시간 표시 - 고정 위치 */}
                        <div className="sticky left-0 top-0 bottom-0 z-20 bg-background border-r h-full">
                          {timeSlots.map((time, index) => (
                            <div
                              key={time}
                              className="h-10 text-xs text-muted-foreground px-2 flex items-center border-t border-dashed border-muted"
                              style={{ height: "40px" }}
                            >
                              {time}
                            </div>
                          ))}
                        </div>

                        {/* 요일 컬럼 */}
                        {weekDays.map((day, dayIndex) => (
                          <div key={day.toString()} className="relative" style={{ height: "1280px" }}>
                            {/* 시간 그리드 라인 */}
                            {timeSlots.map((time, index) => (
                              <div
                                key={`grid-${day}-${time}`}
                                className="absolute left-0 right-0 border-t border-dashed border-muted"
                                style={{ top: `${index * 40}px`, height: "1px", width: "100%" }}
                              />
                            ))}

                            {/* 세로 구분선 */}
                            {dayIndex < 6 && (
                              <div
                                className="absolute top-0 bottom-0 right-0 border-r border-muted"
                                style={{ height: "100%" }}
                              />
                            )}

                            {/* 해당 요일의 이벤트 */}
                            {filteredWeekEvents
                              .filter((event) => event.date === format(day, "yyyy-MM-dd"))
                              .map((event) => (
                                <div
                                  key={event.id}
                                  className={`absolute rounded-md p-2 text-xs overflow-hidden cursor-pointer border ${
                                    eventVisibility[event.id] === false
                                      ? "bg-gray-100 border-gray-200 text-gray-400"
                                      : event.isImportant
                                        ? "bg-red-100 border-red-300"
                                        : "bg-blue-100 border-blue-300"
                                  }`}
                                  style={{
                                    top: `${getEventPosition(event.startTime)}px`,
                                    height: `${getEventHeight(event.startTime, event.endTime)}px`,
                                    left: "4px",
                                    right: "4px",
                                    zIndex: 5,
                                  }}
                                  onClick={() => setSelectedEvent(event)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="font-medium truncate">{event.title}</div>
                                    <div className="flex gap-1">
                                      <button
                                        className={`h-4 w-4 ${completedEvents[event.id] ? "text-green-500" : "text-muted-foreground/50"}`}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleEventCompletion(event.id)
                                        }}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </button>
                                      <button
                                        className="h-4 w-4 text-muted-foreground/50"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleEventVisibility(event.id)
                                        }}
                                      >
                                        <XIcon className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="truncate">
                                    {event.startTime} - {event.endTime}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 월별 뷰에서도 필터링된 이벤트 사용하도록 수정 */}
            <TabsContent value="month" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{date ? format(date, "yyyy년 MM월", { locale: ko }) : "선택된 월 없음"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1">
                    {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                      <div key={day} className="text-center font-medium p-2">
                        {day}
                      </div>
                    ))}

                    {/* 월 시작 전 빈 셀 채우기 */}
                    {Array.from({ length: getMonthStartOffset(monthStart as Date) }).map((_, index) => (
                      <div key={`empty-start-${index}`} className="p-2 min-h-[100px]" />
                    ))}

                    {/* 월 날짜 */}
                    {monthDays.map((day) => (
                      <div
                        key={day.toString()}
                        className={`p-2 border rounded-md min-h-[100px] ${
                          format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? "bg-accent/30" : ""
                        } ${
                          date && format(day, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setDate(day)}
                      >
                        <div className="text-right mb-1">{format(day, "d")}</div>
                        <div className="space-y-1">
                          {filteredMonthEvents
                            .filter((event) => event.date === format(day, "yyyy-MM-dd"))
                            .slice(0, 3)
                            .map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded truncate flex justify-between items-center ${
                                  eventVisibility[event.id] === false
                                    ? "bg-gray-100 text-gray-400"
                                    : event.isImportant
                                      ? "bg-red-100"
                                      : "bg-blue-100"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedEvent(event)
                                }}
                              >
                                <span className="truncate">{event.title}</span>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button
                                    className={`h-3 w-3 ${completedEvents[event.id] ? "text-green-500" : "text-muted-foreground/50"}`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleEventCompletion(event.id)
                                    }}
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </button>
                                  <button
                                    className="h-3 w-3 text-muted-foreground/50"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleEventVisibility(event.id)
                                    }}
                                  >
                                    <XIcon className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          {filteredMonthEvents.filter((event) => event.date === format(day, "yyyy-MM-dd")).length >
                            3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +
                              {filteredMonthEvents.filter((event) => event.date === format(day, "yyyy-MM-dd")).length -
                                3}{" "}
                              더보기
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* 월 끝 후 빈 셀 채우기 */}
                    {Array.from({ length: getMonthEndOffset(monthEnd as Date) }).map((_, index) => (
                      <div key={`empty-end-${index}`} className="p-2 min-h-[100px]" />
                    ))}
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

            {/* 메모 및 가시성 설정 */}
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2">내 메모</h4>
              <Textarea
                placeholder="이 일정에 대한 개인 메모를 입력하세요"
                value={selectedEvent ? eventNotes[selectedEvent.id] || "" : ""}
                onChange={(e) => {
                  if (selectedEvent) {
                    setEventNotes((prev) => ({
                      ...prev,
                      [selectedEvent.id]: e.target.value,
                    }))
                  }
                }}
                rows={3}
                className="mb-2"
              />

              <div className="flex items-center justify-between mt-4">
                <Label htmlFor="eventVisibility" className="text-sm">
                  일정 표시 여부
                </Label>
                <Switch
                  id="eventVisibility"
                  checked={selectedEvent ? eventVisibility[selectedEvent.id] !== false : true}
                  onCheckedChange={(checked) => {
                    if (selectedEvent) {
                      toggleEventVisibility(selectedEvent.id)
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <Label htmlFor="eventCompletion" className="text-sm">
                  일정 완료 여부
                </Label>
                <Switch
                  id="eventCompletion"
                  checked={selectedEvent ? completedEvents[selectedEvent.id] === true : false}
                  onCheckedChange={(checked) => {
                    if (selectedEvent) {
                      toggleEventCompletion(selectedEvent.id)
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              닫기
            </Button>
            {selectedEvent && (
              <Button
                onClick={() => {
                  if (selectedEvent) {
                    updateEventNotes(selectedEvent.id, eventNotes[selectedEvent.id] || "")
                  }
                  setSelectedEvent(null)
                }}
              >
                저장
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 월 시작 요일 오프셋 계산 (월요일 시작)
function getMonthStartOffset(date: Date) {
  const day = date.getDay()
  return day === 0 ? 6 : day - 1
}

// 월 끝 요일 오프셋 계산 (월요일 시작)
function getMonthEndOffset(date: Date) {
  const day = date.getDay()
  return day === 0 ? 0 : 7 - day
}
