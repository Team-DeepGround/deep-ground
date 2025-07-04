"use client"

import { useState, useEffect } from "react"
import { fetchMySchedules, updateMemberSchedule } from "@/lib/api/memberSchedule"
import { isSameDay, startOfDay, format } from "date-fns"
import { ko } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

// 타입 정의
export interface StudyEvent {
  id: number
  memberStudyScheduleId: number
  studyId: number
  studyName?: string
  title: string
  date: Date
  startTime: Date
  endTime: Date
  time: string
  color: string
  location?: string
  description?: string
  attendance?: "attending" | "not_attending" | null
  personalNote?: string
  isImportant?: boolean
  isAvailable?: boolean
  organizer: {
    id: number
    name: string
  }
}

export type CalendarViewType = "day" | "week" | "month"

// 유틸리티 함수들
const colorPalette = ["#F2C4CC", "#B7D7F4", "#BEE3B8", "#F9E79F", "#D8BFD8"]
const studyColorMap = new Map<number, string>()

export const getColorByStudyId = (studyId: number) => {
  if (!studyColorMap.has(studyId)) {
    const color = colorPalette[studyColorMap.size % colorPalette.length]
    studyColorMap.set(studyId, color)
  }
  return studyColorMap.get(studyId)!
}

export const getFilteredEvents = (allEvents: StudyEvent[], showHiddenEvents: boolean) => {
  if (showHiddenEvents) {
    return allEvents
  } else {
    return allEvents.filter((event) => event.attendance === "attending" || event.attendance === null)
  }
}

export const getEventsForDate = (events: StudyEvent[], targetDate: Date, showHiddenEvents: boolean) => {
  const filteredEvents = getFilteredEvents(events, showHiddenEvents)
  return filteredEvents.filter((event) => isSameDay(startOfDay(event.startTime), startOfDay(targetDate)))
}

export const getEventsForTimeSlot = (
    events: StudyEvent[],
    date: Date,
    hour: number,
    minute: number,
    showHiddenEvents: boolean
  ) => {
    const slotTime = new Date(date)
    slotTime.setHours(hour, minute, 0, 0)
  
    return events.filter((event) => {
      const isSameDate = event.date.toDateString() === date.toDateString()
      
      // 딱 '시작 시점'에만 렌더링
      const isStartSlot =
        slotTime.getTime() === event.startTime.getTime()
  
      const isVisible = showHiddenEvents || event.attendance !== "not_attending"
  
      return isSameDate && isStartSlot && isVisible
    })
  }
  

export const getEventHeight = (event: StudyEvent) => {

  const startTime = event.startTime.getTime()
  const endTime = event.endTime.getTime()
  const durationMinutes = (endTime - startTime) / (1000 * 60)
  return Math.max((durationMinutes / 10) * 20, 20)
}

export const getEventStyle = (event: StudyEvent) => {
  if (event.attendance === "attending") {
    return ""
  } else if (event.attendance === null) {
    return "opacity-50"
  } else if (event.attendance === "not_attending") {
    return "opacity-30"
  }
  return ""
}

export const shouldShowAttendanceButtons = (event: StudyEvent, showHiddenEvents: boolean) => {
  return event.attendance === null || (event.attendance === "not_attending" && showHiddenEvents)
}

export const parseTimeRange = (time: string) => {
    const match = time.match(/(오전|오후)\s*(\d+):?(\d*)/)
    if (!match) return { startHour: 0, startMinute: 0 }
  
    const isPM = match[1] === "오후"
    let hour = parseInt(match[2])
    const minute = match[3] ? parseInt(match[3]) : 0
  
    if (isPM && hour !== 12) hour += 12
    if (!isPM && hour === 12) hour = 0
  
    return { startHour: hour, startMinute: minute }
  }

// 커스텀 훅
export const useCalendar = () => {
  const { toast } = useToast()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState<CalendarViewType>("month")
  const [showHiddenEvents, setShowHiddenEvents] = useState(false)
  const [events, setEvents] = useState<StudyEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<StudyEvent | null>(null)

  const loadSchedules = async () => {
    
    try {
      const scheduleData = await fetchMySchedules()
      const mapped: StudyEvent[] = scheduleData.map((dto) => {
        const startTime = new Date(dto.startTime)
        const endTime = new Date(dto.endTime)

        return {
          id: dto.memberStudyScheduleId,
          memberStudyScheduleId: dto.memberStudyScheduleId,
          studyId: dto.studyGroupId,
          studyName: dto.studyGroupName,
          title: dto.title,
          description: dto.description,
          date: startTime,
          startTime: startTime,
          endTime: endTime,
          time: `${format(startTime, "a h:mm", { locale: ko })}-${format(endTime, "a h:mm", { locale: ko })}`,
          color: getColorByStudyId(dto.studyGroupId),
          attendance: dto.isAvailable === null ? null : dto.isAvailable ? "attending" : "not_attending",
          personalNote: dto.memo ?? "",
          isImportant: dto.isImportant ?? false,
          organizer: { id: 0, name: "" },
          location: dto.location ?? ""
        }
      })

      setEvents(mapped)
    } catch (e) {
      console.error("일정 불러오기 실패", e)
    }
  }

  const updateEventAttendance = async (eventId: number, attendance: "attending" | "not_attending" | null) => {
    const target = events.find((e) => e.id === eventId)
    if (!target) return
  
    const isAvailable =
      attendance === "attending" ? true :
      attendance === "not_attending" ? false :
      null
  
    try {
      // 서버에 최종 상태 업데이트 요청
      const updated = await updateMemberSchedule(eventId, {
        isAvailable,
        isImportant: target.isImportant ?? false,
        memo: target.personalNote ?? "",
      })
  
      // 서버 응답 기반으로 화면 상태 정확히 반영
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                attendance:
                  updated.isAvailable === true
                    ? "attending"
                    : updated.isAvailable === false
                    ? "not_attending"
                    : null,
                isAvailable: updated.isAvailable ?? undefined, // 핵심 부분
              }
            : e
        )
      )
  
      // 현재 열려있는 팝업도 정확히 동기화
      if (selectedEvent?.memberStudyScheduleId === eventId) {
        setSelectedEvent((prev) =>
          prev
            ? {
                ...prev,
                attendance:
                  updated.isAvailable === true
                    ? "attending"
                    : updated.isAvailable === false
                    ? "not_attending"
                    : null,
                isAvailable: updated.isAvailable ?? undefined,
              }
            : null
        )
      }
  
      toast({
        title: "참석 정보 업데이트 완료",
        description:
          updated.isAvailable === true
            ? "일정에 참석하기로 했습니다."
            : updated.isAvailable === false
            ? "일정에 참석하지 않기로 했습니다."
            : "참석 여부를 미정으로 변경했습니다.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "참석 정보 업데이트 실패",
        description: "서버에 반영하지 못했습니다.",
      })
    }
  }
  

  const updateEventNote = async (eventId: number, note: string) => {
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, personalNote: note } : event)))
    setSelectedEvent((prev) => (prev ? { ...prev, personalNote: note } : null))

    const prevImportant = events.find((e) => e.id === eventId)?.isImportant ?? false
    const prevEvent = events.find((e) => e.id === eventId)

    const prevIsAvailable =
    prevEvent
        ? prevEvent.attendance === "attending"
        ? true
        : prevEvent.attendance === "not_attending"
            ? false
            : null
        : null

    try {
      await updateMemberSchedule(eventId, {
        memo: note,
        isImportant: prevImportant,
        isAvailable: prevIsAvailable,
      })

      toast({
        title: "메모 저장 완료",
        description: "일정에 메모가 저장되었습니다.",
      })
      await loadSchedules()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "메모 저장 실패",
        description: "서버에 반영하지 못했습니다.",
      })
    }
  }

  const updateEventImportance = async (eventId: number, isImportant: boolean) => {
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, isImportant } : event)))

    const prevEvent = events.find((e) => e.id === eventId)

    const prevIsAvailable =
    prevEvent
        ? prevEvent.attendance === "attending"
        ? true
        : prevEvent.attendance === "not_attending"
            ? false
            : null
        : null
    try {
      await updateMemberSchedule(eventId, {
        isAvailable: prevIsAvailable,
        isImportant,
        memo: events.find((e) => e.id === eventId)?.personalNote ?? "",
      })

      toast({
        title: isImportant ? "중요일정 설정" : "중요일정 해제",
        description: isImportant ? "일정이 중요일정으로 표시됩니다." : "중요일정 표시가 해제되었습니다.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "중요일정 설정 실패",
        description: "서버에 반영하지 못했습니다.",
      })
    }

    if (selectedEvent && selectedEvent.memberStudyScheduleId === eventId) {
      setSelectedEvent((prev: StudyEvent | null) => (prev ? { ...prev, isImportant } : null))
    }
  }

  useEffect(() => {
    loadSchedules()
  }, [])

  return {
    currentDate,
    setCurrentDate,
    calendarView,
    setCalendarView,
    showHiddenEvents,
    setShowHiddenEvents,
    events,
    selectedEvent,
    setSelectedEvent,
    updateEventAttendance,
    updateEventNote,
    updateEventImportance,
    loadSchedules,
  }

  
}
