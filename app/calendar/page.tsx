"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Circle, ChevronLeft, ChevronRight, EyeOff, Eye, UserCheck, UserX, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchMySchedules, fetchScheduleDetail, updateMemberSchedule, MemberScheduleDetailResponseDto, MemberScheduleCalendarResponseDto } from "@/lib/api/memberSchedule"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
  addDays,
  getDay,
  addMonths,
  addWeeks,
} from "date-fns"
import { ko } from "date-fns/locale"

const colorPalette = ["#FFB6C1", "#87CEFA", "#90EE90", "#FFD700", "#DDA0DD"]
const studyColorMap = new Map<number, string>()

const getColorByStudyId = (studyId: number) => {
  if (!studyColorMap.has(studyId)) {
    const color = colorPalette[studyColorMap.size % colorPalette.length]
    studyColorMap.set(studyId, color)
  }
  return studyColorMap.get(studyId)!
}

// 스터디 이벤트 타입 정의
interface StudyEvent {
  id: number
  studyId: number
  studyName?: string
  title: string
  date: Date
  time: string // "오후 2시 - 오후 4시" 형태
  color: string
  location?: string
  description?: string
  attendance?: "attending" | "not_attending" | "pending"
  personalNote?: string
  isImportant?: boolean
  organizer: {
    id: number
    name: string
  }
}

// 이벤트 팝업 컴포넌트
interface EventPopupProps {
  event: StudyEvent
  position: { top: number; left: number }
  onClose: () => void
  onAttendanceChange: (eventId: number, attendance: "attending" | "not_attending" | "pending") => void
  onNoteChange: (eventId: number, note: string) => void
  onImportanceChange: (eventId: number, isImportant: boolean) => void
}

function EventPopup({
  event,
  position,
  onClose,
  onAttendanceChange,
  onNoteChange,
  onImportanceChange,
}: EventPopupProps) {
  const [note, setNote] = useState(event.personalNote || "")

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
  }

  const handleNoteSave = () => {
    onNoteChange(event.id, note)
  }

  const handleAttendanceChange = (attendance: "attending" | "not_attending" | "pending") => {
    onAttendanceChange(event.id, attendance)
  }

  return (
    <div
      className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-72 z-50 event-popup"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <Circle className="w-3 h-3 mr-2 fill-current" style={{ color: event.color }} />
          <span className="text-xs text-blue-500 dark:text-blue-400">{event.studyName}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-base font-medium mb-1 text-gray-900 dark:text-gray-100">{event.title}</h3>

      {event.date && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {format(event.date, "yyyy.MM.dd(E)", { locale: ko })} {event.time}
        </div>
      )}

      {event.location && <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.location}</div>}

      {event.description && <div className="text-sm mb-3 text-gray-700 dark:text-gray-300">{event.description}</div>}

      {/* 참석 여부 선택 섹션 */}
      <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-3">
        <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">참석 여부</h4>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={event.attendance === "attending" ? "default" : "outline"}
            className={`flex items-center gap-1 ${
              event.attendance === "attending" ? "bg-green-500 hover:bg-green-600" : ""
            }`}
            onClick={() => handleAttendanceChange("attending")}
          >
            <UserCheck className="w-4 h-4" />
            참석
          </Button>
          <Button
            size="sm"
            variant={event.attendance === "not_attending" ? "default" : "outline"}
            className={`flex items-center gap-1 ${
              event.attendance === "not_attending" ? "bg-red-500 hover:bg-red-600" : ""
            }`}
            onClick={() => handleAttendanceChange("not_attending")}
          >
            <UserX className="w-4 h-4" />
            불참석
          </Button>
          {event.attendance !== "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => handleAttendanceChange("pending")}
            >
              <Circle className="w-4 h-4" />
              대기
            </Button>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {event.attendance === "attending" && "✅ 이 일정에 참석하기로 했습니다."}
          {event.attendance === "not_attending" && "❌ 이 일정에 참석하지 않기로 했습니다."}
          {event.attendance === "pending" && "⏳ 참석 여부를 결정해주세요."}
        </div>
      </div>

      {/* 중요일정 설정 섹션 */}
      <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`important-${event.id}`}
            checked={event.isImportant}
            onChange={(e) => onImportanceChange(event.id, e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          />
          <label
            htmlFor={`important-${event.id}`}
            className="text-sm font-medium flex items-center gap-1 text-gray-900 dark:text-gray-100"
          >
            <Star className="w-4 h-4 text-yellow-500" />
            중요일정으로 설정
          </label>
        </div>
        {event.isImportant && (
          <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">⭐ 이 일정이 중요일정으로 표시됩니다.</div>
        )}
      </div>

      <div className="mb-3">
        <h4 className="text-xs font-medium mb-1 text-gray-900 dark:text-gray-100">개인 메모</h4>
        <Textarea
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md p-2 mb-2 h-16 text-sm"
          placeholder="이 일정에 대한 개인 메모를 작성하세요"
          value={note}
          onChange={handleNoteChange}
        />
        <Button
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs"
          onClick={handleNoteSave}
        >
          메모 저장
        </Button>
      </div>

      {event.organizer && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">스터디장: {event.organizer.name}</div>
      )}
    </div>
  )
}

// 캘린더 헤더 컴포넌트
interface CalendarHeaderProps {
  viewType: "day" | "week" | "month"
  setViewType: (type: "day" | "week" | "month") => void
  currentDate: Date
  setCurrentDate: (date: Date) => void
  showHiddenEvents: boolean
  setShowHiddenEvents: (show: boolean) => void
}

function CalendarHeader({
  viewType,
  setViewType,
  currentDate,
  setCurrentDate,
  showHiddenEvents,
  setShowHiddenEvents,
}: CalendarHeaderProps) {
  const formatTitle = () => {
    if (viewType === "day") {
      return `${format(currentDate, "yyyy년 M월 d일", { locale: ko })} ${format(currentDate, "EEEE", { locale: ko })}`
    } else {
      return `${format(currentDate, "yyyy년 M월", { locale: ko })}`
    }
  }

  const handlePrev = () => {
    if (viewType === "day") {
      setCurrentDate(addDays(currentDate, -1))
    } else if (viewType === "week") {
      setCurrentDate(addWeeks(currentDate, -1))
    } else {
      setCurrentDate(addMonths(currentDate, -1))
    }
  }

  const handleNext = () => {
    if (viewType === "day") {
      setCurrentDate(addDays(currentDate, 1))
    } else if (viewType === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  return (
    <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">{formatTitle()}</h2>
        <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* 숨긴 일정 표시 토글 버튼 */}
        <Button
          variant={showHiddenEvents ? "default" : "outline"}
          size="sm"
          onClick={() => setShowHiddenEvents(!showHiddenEvents)}
          className="flex items-center gap-2"
        >
          {showHiddenEvents ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {showHiddenEvents ? "숨긴 일정 숨기기" : "숨긴 일정 표시"}
        </Button>

        <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
          <button
            className={`px-4 py-2 ${
              viewType === "day"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            onClick={() => setViewType("day")}
          >
            일
          </button>
          <button
            className={`px-4 py-2 ${
              viewType === "week"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            onClick={() => setViewType("week")}
          >
            주
          </button>
          <button
            className={`px-4 py-2 ${
              viewType === "month"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            onClick={() => setViewType("month")}
          >
            월
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date()) 
  const [selectedEvent, setSelectedEvent] = useState<StudyEvent | null>(null)
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("month")
  const [showHiddenEvents, setShowHiddenEvents] = useState(false) // 숨긴 일정 표시 상태
  const calendarRef = useRef<HTMLDivElement>(null)
  const [events, setEvents] = useState<StudyEvent[]>([]);
  
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const scheduleData = await fetchMySchedules()

        const mapped: StudyEvent[] = scheduleData.map(dto => ({
          id: dto.memberStudyScheduleId,
          studyId: dto.studyScheduleId, // 백엔드 수정 전까지 studyScheduleId로 대체 사용
          // studyId: dto.studyId, // 백엔드 수정 후 활성화
          title: dto.title,
          date: new Date(dto.startTime),
          time: `${format(new Date(dto.startTime), "a h:mm")} - ${format(new Date(dto.endTime), "a h:mm")}`,
          color: getColorByStudyId(dto.studyScheduleId), // 나중에 교체
          // color: getColorByStudyId(dto.studyId), // 나중에 교체
          organizer: {
            id: 0,
            name: "",
          },
        }))

        setEvents(mapped)
      } catch (e) {
        console.error("일정 불러오기 실패", e)
      }
    }

    loadSchedules()
  }, [])

  const updateEventAttendance = async (
    eventId: number,
    attendance: "attending" | "not_attending" | "pending"
  ) => {
    // optimistic update
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, attendance } : event
      )
    )
  
    try {
      await updateMemberSchedule(eventId, { attendance })
  
      toast({
        title: "참석 정보 업데이트 완료",
        description:
          attendance === "attending"
            ? "일정에 참석하기로 했습니다."
            : attendance === "not_attending"
            ? "일정에 참석하지 않기로 했습니다."
            : "참석 여부를 미정으로 변경했습니다.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "참석 정보 업데이트 실패",
        description: "서버에 반영하지 못했습니다.",
      })
      // 실패 시 원래 상태로 롤백
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, attendance: selectedEvent?.attendance || "pending" } : event
        )
      )
    }
  
    // 팝업 데이터도 업데이트
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent((prev) =>
        prev ? { ...prev, attendance } : null
      )
    }
  }

  // 이벤트 메모 업데이트
  const updateEventNote = async (eventId: number, note: string) => {
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, personalNote: note } : event)))
    await updateMemberSchedule(eventId, { memo: note })
    
    toast({
      title: "메모 저장 완료",
      description: "일정에 메모가 저장되었습니다.",
    })

    // 팝업의 이벤트 정보도 업데이트
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent((prev) => (prev ? { ...prev, personalNote: note } : null))
    }
  }

  // 이벤트 중요도 업데이트
  const updateEventImportance = async (eventId: number, isImportant: boolean) => {
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, isImportant } : event)))
    await updateMemberSchedule(eventId, { isImportant })
    
    toast({
      title: isImportant ? "중요일정 설정" : "중요일정 해제",
      description: isImportant ? "일정이 중요일정으로 표시됩니다." : "중요일정 표시가 해제되었습니다.",
    })

    // 팝업의 이벤트 정보도 업데이트
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent((prev) => (prev ? { ...prev, isImportant } : null))
    }
  }

  // 표시할 이벤트 필터링 함수 (수정됨)
  const getFilteredEvents = (allEvents: StudyEvent[]) => {
    if (showHiddenEvents) {
      // 숨긴 일정 표시 모드: 모든 일정 표시 (참석, 대기, 불참 모두)
      return allEvents
    } else {
      // 일반 모드: 참석 또는 대기 중인 일정만 표시 (불참 일정은 숨김)
      return allEvents.filter((event) => event.attendance === "attending" || event.attendance === "pending")
    }
  }

  // 이벤트 클릭 핸들러
  const handleEventClick = async (event: StudyEvent, e: React.MouseEvent) => {
    e.stopPropagation()

    // 팝업 위치 계산
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const calendarRect = calendarRef.current?.getBoundingClientRect() || { top: 0, left: 0, width: window.innerWidth }

    // 팝업이 오른쪽으로 넘어가지 않도록 조정
    let left = rect.left - calendarRect.left + rect.width + 10
    if (left + 288 > (calendarRect.width || window.innerWidth)) {
      left = rect.left - calendarRect.left - 288 - 10
    }

    setPopupPosition({
      top: rect.top - calendarRect.top,
      left: left,
    })

    try {
      const detail: MemberScheduleDetailResponseDto = await fetchScheduleDetail(event.id)
  
      const enrichedEvent: StudyEvent = {
        ...event,
        title: detail.title,
        date: new Date(detail.startTime),
        time: `${format(new Date(detail.startTime), "a h시", { locale: ko })} - ${format(new Date(detail.endTime), "a h시", { locale: ko })}`,
        location: detail.location,
        description: detail.description,
        attendance: detail.isAvailable === null
          ? "pending"
          : detail.isAvailable
          ? "attending"
          : "not_attending",
        isImportant: detail.isImportant ?? false,
        personalNote: detail.memo ?? "",
      }
  
      setSelectedEvent(enrichedEvent)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "일정 상세정보 불러오기 실패",
        description: "서버에서 정보를 가져오지 못했습니다.",
      })
      setSelectedEvent(event) // fallback
    }
  }

  // 참석/불참석 버튼 클릭 핸들러
  const handleAttendanceClick = (event: StudyEvent, attendance: "attending" | "not_attending", e: React.MouseEvent) => {
    e.stopPropagation()
    updateEventAttendance(event.id, attendance)
  }

  // 주간 뷰를 위한 날짜 범위 계산
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // 월간 뷰를 위한 날짜 범위 계산
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  // 월간 캘린더 날짜 계산
  const getMonthCalendarDays = () => {
    const startDate = addDays(monthStart, -getDay(monthStart))
    const endDate = addDays(monthEnd, 6 - getDay(monthEnd))
    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  const monthCalendarDays = getMonthCalendarDays()

  // 선택된 날짜의 이벤트 필터링
  const selectedDateEvents = getFilteredEvents(events.filter((event) => isSameDay(event.date, currentDate)))

  // 특정 날짜의 이벤트 가져오기
  const getEventsForDate = (targetDate: Date) => {
    return getFilteredEvents(events.filter((event) => isSameDay(event.date, targetDate)))
  }

  // 시간 파싱 함수 - 시작시간과 끝시간을 분리
  const parseTimeRange = (timeString?: string) => {
    if (!timeString) return { startHour: -1, endHour: -1, startMinute: 0, endMinute: 0 }

    // "오후 2시 - 오후 4시" 또는 "오후 4시 - 오후 5시 30분" 형태 파싱
    const timeRangeMatch = timeString.match(
      /(오전|오후)\s*(\d+)시(?:\s*(\d+)분)?\s*-\s*(오전|오후)\s*(\d+)시(?:\s*(\d+)분)?/,
    )

    if (!timeRangeMatch) return { startHour: -1, endHour: -1, startMinute: 0, endMinute: 0 }

    const [, startPeriod, startHourStr, startMinuteStr, endPeriod, endHourStr, endMinuteStr] = timeRangeMatch

    let startHour = Number.parseInt(startHourStr)
    let endHour = Number.parseInt(endHourStr)
    const startMinute = startMinuteStr ? Number.parseInt(startMinuteStr) : 0
    const endMinute = endMinuteStr ? Number.parseInt(endMinuteStr) : 0

    // 24시간 형식으로 변환
    if (startPeriod === "오후" && startHour !== 12) startHour += 12
    if (startPeriod === "오전" && startHour === 12) startHour = 0
    if (endPeriod === "오후" && endHour !== 12) endHour += 12
    if (endPeriod === "오전" && endHour === 12) endHour = 0

    return { startHour, endHour, startMinute, endMinute }
  }

  // 시간 변환 함수 (기존 호환성을 위해 유지)
  const convertTimeToHour = (timeString?: string) => {
    const { startHour } = parseTimeRange(timeString)
    return startHour
  }

  // 이벤트가 특정 시간에 겹치는지 확인
  const isEventInHour = (event: StudyEvent, hour: number) => {
    const { startHour, endHour } = parseTimeRange(event.time)
    return startHour <= hour && hour < endHour
  }

  // 이벤트가 특정 시간에 시작하는지 확인 (중복 렌더링 방지)
  const isEventStartInHour = (event: StudyEvent, hour: number) => {
    const { startHour } = parseTimeRange(event.time)
    return startHour === hour
  }

  // 이벤트 높이 계산 (분 단위로)
  const getEventHeight = (event: StudyEvent) => {
    const { startHour, endHour, startMinute, endMinute } = parseTimeRange(event.time)
    if (startHour === -1 || endHour === -1) return 60 // 기본 1시간

    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute
    const durationMinutes = endTotalMinutes - startTotalMinutes

    // 1분당 1px로 계산 (최소 30px)
    return Math.max(durationMinutes, 30)
  }

  // 주간 뷰용 이벤트 높이 계산 (시간 슬롯 높이에 맞춤)
  const getEventHeightForWeekView = (event: StudyEvent) => {
    const { startHour, endHour, startMinute, endMinute } = parseTimeRange(event.time)
    if (startHour === -1 || endHour === -1) return 80 // 기본 1시간 (80px)

    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute
    const durationMinutes = endTotalMinutes - startTotalMinutes

    // 주간 뷰에서는 1시간당 80px로 계산
    const heightPerHour = 80
    const height = (durationMinutes / 60) * heightPerHour

    return Math.max(height, 20) // 최소 20px
  }

  // 이벤트 시작 위치 계산 (시간 슬롯 내에서의 위치)
  const getEventTopOffset = (event: StudyEvent, baseHour: number) => {
    const { startHour, startMinute } = parseTimeRange(event.time)
    if (startHour === -1) return 0

    // 해당 시간 슬롯 내에서의 분 단위 오프셋
    const minuteOffset = startHour === baseHour ? startMinute : 0
    return minuteOffset // 1분당 1px
  }

  // 시간대 생성 (30분 간격)
  const timeSlots = Array.from({ length: 32 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8 // 8시부터 시작
    const minute = i % 2 === 0 ? "00" : "30"
    return `${hour.toString().padStart(2, "0")}:${minute}`
  })

  // 이벤트 시간 위치 계산
  const getEventPosition = (timeString?: string) => {
    if (!timeString) return 0

    // "오후 2시" 형태를 24시간 형태로 변환
    const match = timeString.match(/(오전|오후)\s*(\d+)시/)
    if (!match) return 0

    const isPM = match[1] === "오후"
    let hour = Number.parseInt(match[2])

    if (isPM && hour !== 12) hour += 12
    if (!isPM && hour === 12) hour = 0

    const totalMinutes = hour * 60
    const startMinutes = 8 * 60 // 8시부터 시작
    return ((totalMinutes - startMinutes) / 30) * 40 // 각 슬롯 높이 40px
  }

  // 이벤트 스타일 결정 함수 (수정됨)
  const getEventStyle = (event: StudyEvent) => {
    if (event.attendance === "attending") {
      // 참석 확정: 선명하게 표시
      return ""
    } else if (event.attendance === "pending") {
      // 아직 선택하지 않음: 흐릿하게 표시
      return "opacity-50"
    } else if (event.attendance === "not_attending") {
      // 불참 확정: 더 흐릿하게 표시 (숨긴 일정 표시 모드에서만 보임)
      return "opacity-30"
    }
    return ""
  }

  // 참석/불참석 버튼 표시 여부 결정 (수정됨)
  const shouldShowAttendanceButtons = (event: StudyEvent) => {
    // pending 상태이거나, not_attending 상태에서 숨긴 일정 표시 모드일 때만 버튼 표시
    return event.attendance === "pending" || (event.attendance === "not_attending" && showHiddenEvents)
  }

  // 클라이언트 사이드 렌더링 확인
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 클라이언트 사이드에서만 렌더링
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-black">
        <div className="flex justify-center items-center h-[400px]">
          <p className="text-gray-600 dark:text-gray-400">캘린더를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">스터디 캘린더</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">내가 참여하는 스터디 일정을 확인하세요</p>
        </div>
      </div>

      {/* 메인 캘린더만 전체 화면에 표시 */}
      <div className="w-full" ref={calendarRef}>
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
          <CalendarHeader
            viewType={calendarView}
            setViewType={setCalendarView}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            showHiddenEvents={showHiddenEvents}
            setShowHiddenEvents={setShowHiddenEvents}
          />

          <CardContent className="p-0">
            {/* 일별 뷰 - 시간 길이에 맞는 높이 적용 */}
            {calendarView === "day" && (
              <div className="bg-white dark:bg-black">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {format(currentDate, "yyyy년 M월 d일", { locale: ko })}{" "}
                    {format(currentDate, "EEEE", { locale: ko })}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">하루 종일</p>
                </div>

                <div>
                  {Array.from({ length: 16 }, (_, i) => i + 7).map((hour) => {
                    const hourEvents = selectedDateEvents.filter((event) => isEventStartInHour(event, hour))
                    const isCurrentHour = isSameDay(currentDate, new Date()) && new Date().getHours() === hour

                    return (
                      <div
                        key={hour}
                        className="grid grid-cols-[80px_1fr] border-b border-gray-200 dark:border-gray-700 relative"
                      >
                        <div className="py-4 text-right pr-4 text-gray-500 dark:text-gray-400">
                          {hour < 12 ? "오전" : "오후"} {hour <= 12 ? hour : hour - 12}시
                        </div>
                        <div className="py-4 min-h-[60px] relative">
                          {hourEvents.map((event) => {
                            const eventHeight = getEventHeight(event)
                            const topOffset = getEventTopOffset(event, hour)

                            return (
                              <div
                                key={event.id}
                                className="absolute left-1 right-1"
                                style={{
                                  top: `${topOffset}px`,
                                  height: `${eventHeight}px`,
                                }}
                              >
                                {shouldShowAttendanceButtons(event) && (
                                  <div className="absolute -top-1 -right-1 z-10 flex space-x-1">
                                    <button
                                      className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center"
                                      onClick={(e) => handleAttendanceClick(event, "attending", e)}
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                                      onClick={(e) => handleAttendanceClick(event, "not_attending", e)}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                                <div
                                  className={`p-2 rounded-sm cursor-pointer event-item h-full flex flex-col justify-center ${getEventStyle(event)}`}
                                  style={{ backgroundColor: event.color }}
                                  onClick={(e) => handleEventClick(event, e)}
                                >
                                  <div className="font-medium text-sm flex items-center gap-1">
                                    {event.isImportant && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                                    {event.title}
                                  </div>
                                  <div className="text-xs opacity-80">{event.time}</div>
                                </div>
                              </div>
                            )
                          })}

                          {isCurrentHour && (
                            <div
                              className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                              style={{ top: `${(new Date().getMinutes() / 60) * 100}%` }}
                            >
                              <div className="absolute -top-3 -left-1 bg-red-500 text-white text-xs rounded-sm px-1 py-0.5">
                                {format(new Date(), "HH:mm")}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 주간 뷰 - 시간 길이에 맞는 높이 적용 */}
            {calendarView === "week" && (
              <div className="bg-white dark:bg-black">
                {/* 헤더 - 날짜 표시 */}
                <div className="grid grid-cols-[100px_1fr] border-b border-gray-200 dark:border-gray-700">
                  <div className="py-4 text-center text-gray-500 dark:text-gray-400 font-medium">시간</div>
                  <div className="grid grid-cols-7">
                    {weekDays.map((day, i) => {
                      const isToday = isSameDay(day, new Date())
                      return (
                        <div
                          key={i}
                          className={`py-4 text-center border-l border-gray-100 dark:border-gray-700 ${
                            isToday
                              ? "text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-gray-300/20"
                              : "text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <div className="text-base font-medium">{format(day, "d일", { locale: ko })}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ({format(day, "EEE", { locale: ko })})
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 시간대별 그리드 */}
                <div>
                  {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => (
                    <div
                      key={hour}
                      className="grid grid-cols-[100px_1fr] border-b border-gray-100 dark:border-gray-700"
                    >
                      <div className="py-4 text-right pr-4 text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-black">
                        {hour < 12 ? "오전" : "오후"} {hour <= 12 ? hour : hour - 12}시
                      </div>
                      <div className="grid grid-cols-7">
                        {weekDays.map((day, i) => {
                          const dayEvents = getEventsForDate(day).filter((event) => isEventStartInHour(event, hour))

                          return (
                            <div
                              key={i}
                              className="border-l border-gray-100 dark:border-gray-700 min-h-[80px] relative"
                            >
                              {dayEvents.map((event) => {
                                const eventHeight = getEventHeightForWeekView(event) // 주간 뷰용 높이 계산 사용
                                const topOffset = getEventTopOffset(event, hour)

                                return (
                                  <div
                                    key={event.id}
                                    className="absolute left-1 right-1"
                                    style={{
                                      top: `${topOffset}px`,
                                      height: `${eventHeight}px`,
                                    }}
                                  >
                                    {shouldShowAttendanceButtons(event) && (
                                      <div className="absolute -top-1 -right-1 z-10 flex space-x-1">
                                        <button
                                          className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center"
                                          onClick={(e) => handleAttendanceClick(event, "attending", e)}
                                        >
                                          <Check className="w-2 h-2" />
                                        </button>
                                        <button
                                          className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center"
                                          onClick={(e) => handleAttendanceClick(event, "not_attending", e)}
                                        >
                                          <X className="w-2 h-2" />
                                        </button>
                                      </div>
                                    )}
                                    <div
                                      className={`p-1 text-xs rounded-sm cursor-pointer event-item h-full flex flex-col justify-center ${getEventStyle(event)}`}
                                      style={{ backgroundColor: event.color }}
                                      onClick={(e) => handleEventClick(event, e)}
                                      title={`${event.title} (${event.time})`}
                                    >
                                      <div className="font-medium truncate flex items-center gap-1">
                                        {event.isImportant && <Star className="w-2 h-2 text-yellow-500 fill-current" />}
                                        {event.title}
                                      </div>
                                      {eventHeight > 40 && (
                                        <div className="text-xs opacity-80 truncate">{event.time}</div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 월별 뷰 */}
            {calendarView === "month" && (
              <div className="bg-white dark:bg-black">
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                  {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                    <div key={index} className="py-2 text-center font-medium text-gray-900 dark:text-gray-100">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-fr">
                  {monthCalendarDays.map((day, i) => {
                    const dayEvents = getEventsForDate(day)
                    const isCurrentMonth = day >= monthStart && day <= monthEnd
                    const isToday = isSameDay(day, new Date())

                    return (
                      <div
                        key={i}
                        className={`min-h-[100px] border-b border-r border-gray-200 dark:border-gray-700 p-1 ${
                          !isCurrentMonth ? "text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-900" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div
                            className={`w-7 h-7 flex items-center justify-center rounded-full ${
                              isToday ? "bg-blue-500 text-white" : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {format(day, "d")}
                          </div>
                        </div>

                        <div className="mt-1 space-y-1">
                          {dayEvents.map((event) => {
                            return (
                              <div key={event.id} className="relative">
                                {shouldShowAttendanceButtons(event) && (
                                  <div className="absolute -top-1 -right-1 z-10 flex space-x-1">
                                    <button
                                      className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center"
                                      onClick={(e) => handleAttendanceClick(event, "attending", e)}
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                                      onClick={(e) => handleAttendanceClick(event, "not_attending", e)}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                                <div
                                  className={`text-xs py-1 px-2 rounded-sm truncate cursor-pointer event-item ${getEventStyle(event)}`}
                                  style={{ backgroundColor: event.color }}
                                  onClick={(e) => handleEventClick(event, e)}
                                >
                                  <div className="flex items-center gap-1">
                                    {event.isImportant && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                                    <span className="truncate">{event.title}</span>
                                  </div>
                                  {event.time && <div className="text-xs">{event.time}</div>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 이벤트 팝업 */}
        {selectedEvent && (
          <EventPopup
            event={selectedEvent}
            position={popupPosition}
            onClose={() => setSelectedEvent(null)}
            onAttendanceChange={updateEventAttendance}
            onNoteChange={updateEventNote}
            onImportanceChange={updateEventImportance}
          />
        )}
      </div>
    </div>
  )
}
