"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Circle, ChevronLeft, ChevronRight, EyeOff, Eye, UserCheck, UserX, Star } from "lucide-react"
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
  isSameDay,
} from "date-fns"
import { ko } from "date-fns/locale"
import type { StudyEvent, CalendarViewType } from "@/lib/calendar"
import {
  getEventsForDate,
  getEventsForTimeSlot,
  getEventHeight,
  getEventStyle,
  shouldShowAttendanceButtons,
} from "@/lib/calendar"

// 이벤트 팝업 컴포넌트
interface EventPopupProps {
  event: StudyEvent
  position: { top: number; left: number }
  onClose: () => void
  onAttendanceChange: (eventId: number, attendance: "attending" | "not_attending" | null) => void
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
  const [noteText, setNoteText] = useState("")

  // ✅ 모달 바깥 클릭 시 닫히는 로직
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const popupElement = document.querySelector(".event-popup")
      if (popupElement && !popupElement.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setNoteText(event.personalNote ?? "")
  }, [event.memberStudyScheduleId, event.personalNote])

  const handleAttendanceChange = (attendance: "attending" | "not_attending" | null) => {
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
          <span className="text-xs text-blue-500 dark:text-blue-400">
            {event.studyName || `스터디 ${event.studyId}`}
          </span>
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

      {event.description && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {event.description}
        </div>
      )}

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
          {event.attendance !== null && (
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => handleAttendanceChange(null)}
            >
              <Circle className="w-4 h-4" />
              대기
            </Button>
          )}
        </div>
      </div>

      {/* 중요일정 설정 섹션 */}
      <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`important-${event.id}`}
            checked={event.isImportant ?? false}
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
      </div>

      <div className="mb-3">
        <h4 className="text-xs font-medium mb-1 text-gray-900 dark:text-gray-100">개인 메모</h4>
        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="이 일정에 대한 개인 메모를 작성하세요"
          className="mb-2"
        />
        <Button
          onClick={async () => {
            await onNoteChange(event.id, noteText)
          }}
          size="sm"
        >
          메모 저장
        </Button>
      </div>
    </div>
  )
}

// 캘린더 헤더 컴포넌트
interface CalendarHeaderProps {
  viewType: CalendarViewType
  setViewType: (type: CalendarViewType) => void
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
          {(["day", "week", "month"] as const).map((view) => (
            <button
              key={view}
              className={`px-4 py-2 ${
                viewType === view
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-black text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              onClick={() => setViewType(view)}
            >
              {view === "day" ? "일" : view === "week" ? "주" : "월"}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// 각 뷰 컴포넌트들
interface ViewProps {
  currentDate: Date
  events: StudyEvent[]
  showHiddenEvents: boolean
  onEventClick: (event: StudyEvent, e: React.MouseEvent) => void
  onAttendanceClick: (event: StudyEvent, attendance: "attending" | "not_attending", e: React.MouseEvent) => void
}

function DayView({ currentDate, events, showHiddenEvents, onEventClick, onAttendanceClick }: ViewProps) {
  return (
    <div className="bg-white dark:bg-black">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {format(currentDate, "yyyy년 M월 d일", { locale: ko })} {format(currentDate, "EEEE", { locale: ko })}
        </h3>
      </div>

      <div>
        {Array.from({ length: (24 - 8) * 6 }, (_, i) => {  // 8시 ~ 24시, 10분 단위
          const totalMinutes = i * 10
          const hour = Math.floor(totalMinutes / 60) + 8
          const minute = totalMinutes % 60
          const isHourLine = minute === 0
          const hourEvents = getEventsForTimeSlot(events, currentDate, hour, minute, showHiddenEvents)

          return (
            <div
              key={i}
              className={`grid grid-cols-[80px_1fr] relative ${
                isHourLine
                  ? "border-t border-gray-200 dark:border-gray-600"
                  : "border-t border-gray-100 dark:border-gray-800"
              }`}
              style={{ minHeight: "20px" }}
            >
              <div className="py-0.5 text-right pr-3 text-gray-500 dark:text-gray-400 text-xs bg-gray-50 dark:bg-gray-900">
                {minute === 0 && `${hour < 12 ? "오전" : "오후"} ${hour % 12 === 0 ? 12 : hour % 12}시`}
              </div>
              <div className="py-1 relative">
                {hourEvents.map((event) => {
                  const eventHeight = getEventHeight(event)
                  return (
                    <div
                      key={event.id}
                      className="absolute left-1 right-1 z-10"
                      style={{ top: 0, height: `${eventHeight}px` }}
                    >
                      {shouldShowAttendanceButtons(event, showHiddenEvents) && (
                        <div className="absolute -top-1 -right-1 z-10 flex space-x-1">
                          <button
                            className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center"
                            onClick={(e) => onAttendanceClick(event, "attending", e)}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                            onClick={(e) => onAttendanceClick(event, "not_attending", e)}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div
                        className={`p-2 rounded-sm cursor-pointer event-item h-full flex flex-col justify-center ${getEventStyle(event)}`}
                        style={{ backgroundColor: event.color }}
                        onClick={(e) => onEventClick(event, e)}
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeekView({ currentDate, events, showHiddenEvents, onEventClick, onAttendanceClick }: ViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  return (
    <div className="bg-white dark:bg-black">
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
                <div className="text-sm text-gray-500 dark:text-gray-400">({format(day, "EEE", { locale: ko })})</div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        {Array.from({ length: (24 - 8) * 6 }, (_, i) => {
          const totalMinutes = i * 10
          const hour = Math.floor(totalMinutes / 60) + 8
          const minute = totalMinutes % 60
          const isHourLine = minute === 0

          return (
            <div
              key={i}
              className={`grid grid-cols-[100px_1fr] h-[20px] ${
                isHourLine
                  ? "border-t border-gray-300 dark:border-gray-600"
                  : "border-t border-gray-100 dark:border-gray-800"
              }`}
            >
              <div className="py-0.5 text-right pr-3 text-gray-500 dark:text-gray-400 text-xs bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
                {minute === 0 && `${hour < 12 ? "오전" : "오후"} ${hour % 12 === 0 ? 12 : hour % 12}시`}
              </div>
              <div className="grid grid-cols-7 relative">
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = getEventsForTimeSlot(events, day, hour, minute, showHiddenEvents)
                  return (
                    <div
                      key={dayIndex}
                      className={`relative ${
                        isHourLine
                          ? "border-l border-gray-200 dark:border-gray-600"
                          : "border-l border-gray-100 dark:border-gray-800"
                      }`}
                    >
                      {dayEvents.map((event) => {
                        const eventHeight = getEventHeight(event)
                        return (
                          <div
                            key={event.id}
                            className="absolute left-1 right-1 z-10"
                            style={{ top: 0, height: `${eventHeight}px` }}
                          >
                            {shouldShowAttendanceButtons(event, showHiddenEvents) && (
                              <div className="absolute -top-1 -right-1 z-10 flex space-x-1">
                                <button
                                  className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center"
                                  onClick={(e) => onAttendanceClick(event, "attending", e)}
                                >
                                  <Check className="w-2 h-2" />
                                </button>
                                <button
                                  className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center"
                                  onClick={(e) => onAttendanceClick(event, "not_attending", e)}
                                >
                                  <X className="w-2 h-2" />
                                </button>
                              </div>
                            )}
                            <div
                              className={`p-1 text-xs rounded-sm cursor-pointer event-item h-full flex flex-col justify-center ${getEventStyle(event)}`}
                              style={{ backgroundColor: event.color }}
                              onClick={(e) => onEventClick(event, e)}
                              title={`${event.title} (${event.time})`}
                            >
                              <div className="font-medium truncate flex items-center gap-1">
                              {event.isImportant && <Star className="w-2 h-2 text-yellow-500 fill-current" />}
                              {event.title}
                              </div>
                              <div className="text-[10px] opacity-80">{event.time}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MonthView({ currentDate, events, showHiddenEvents, onEventClick, onAttendanceClick }: ViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const getMonthCalendarDays = () => {
    const startDate = addDays(monthStart, -getDay(monthStart))
    const endDate = addDays(monthEnd, 6 - getDay(monthEnd))
    return eachDayOfInterval({ start: startDate, end: endDate })
  }
  const monthCalendarDays = getMonthCalendarDays()

  return (
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
          const dayEvents = getEventsForDate(events, day, showHiddenEvents)
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
                {dayEvents.map((event) => (
                  <div key={event.id} className="relative">
                    {shouldShowAttendanceButtons(event, showHiddenEvents) && (
                      <div className="absolute -top-1 -right-1 z-10 flex space-x-1">
                        <button
                          className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center"
                          onClick={(e) => onAttendanceClick(event, "attending", e)}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                          onClick={(e) => onAttendanceClick(event, "not_attending", e)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <div
                      className={`text-xs py-1 px-2 rounded-sm truncate cursor-pointer event-item ${getEventStyle(event)}`}
                      style={{ backgroundColor: event.color }}
                      onClick={(e) => onEventClick(event, e)}
                    >
                      <div className="flex items-center gap-1">
                        {event.isImportant && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                        <span className="truncate">{event.title}</span>
                      </div>
                      {event.time && <div className="text-xs">{event.time}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 메인 캘린더 컴포넌트
interface CalendarProps {
  currentDate: Date
  setCurrentDate: (date: Date) => void
  calendarView: CalendarViewType
  setCalendarView: (view: CalendarViewType) => void
  showHiddenEvents: boolean
  setShowHiddenEvents: (show: boolean) => void
  events: StudyEvent[]
  selectedEvent: StudyEvent | null
  setSelectedEvent: (event: StudyEvent | null) => void
  updateEventAttendance: (eventId: number, attendance: "attending" | "not_attending" | null) => void
  updateEventNote: (eventId: number, note: string) => void
  updateEventImportance: (eventId: number, isImportant: boolean) => void
  popupPosition: { top: number; left: number }
  setPopupPosition: (position: { top: number; left: number }) => void
  calendarRef: React.RefObject<HTMLDivElement | null>
}

export function Calendar({
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
  popupPosition,
  setPopupPosition,
  calendarRef,
}: CalendarProps) {
  const handleEventClick = async (event: StudyEvent, e: React.MouseEvent) => {
    e.stopPropagation()

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const calendarRect = calendarRef.current?.getBoundingClientRect() || { top: 0, left: 0, width: window.innerWidth }

    let left = rect.left - calendarRect.left + rect.width + 20

    // 일별 뷰일 경우 좀 더 오른쪽에 강제로 띄우기
    if (calendarView === "day") {
      left = 400
    }

    const modalWidth = 288
    const minMargin = 10

    if (left + modalWidth > (calendarRect.width || window.innerWidth)) {
      left = Math.max(minMargin, rect.left - calendarRect.left - modalWidth - 10)
    }

    setPopupPosition({
      top: rect.top - calendarRect.top,
      left: left,
    })

    console.log("startTime 원본:", event.startTime)
    console.log("endTime 원본:", event.endTime)
    console.log("startTime 변환:", new Date(event.startTime).toString())
    console.log("endTime 변환:", new Date(event.endTime).toString())
    console.log("차이(분):", (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60))

    setSelectedEvent(event)
  }

  const handleAttendanceClick = (event: StudyEvent, attendance: "attending" | "not_attending", e: React.MouseEvent) => {
    e.stopPropagation()
    updateEventAttendance(event.id, attendance)
  }

  return (
    <div ref={calendarRef}>
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
          {calendarView === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              showHiddenEvents={showHiddenEvents}
              onEventClick={handleEventClick}
              onAttendanceClick={handleAttendanceClick}
            />
          )}

          {calendarView === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              showHiddenEvents={showHiddenEvents}
              onEventClick={handleEventClick}
              onAttendanceClick={handleAttendanceClick}
            />
          )}

          {calendarView === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              showHiddenEvents={showHiddenEvents}
              onEventClick={handleEventClick}
              onAttendanceClick={handleAttendanceClick}
            />
          )}
        </CardContent>
      </Card>

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
  )
}
export default Calendar;
