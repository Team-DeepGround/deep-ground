"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { X, Circle, UserCheck, UserX, Star } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import type { StudyEvent, CalendarViewType } from "@/lib/calendar"
import CalendarHeader from "./CalendarHeader"
import { DayView, WeekView, MonthView } from "./CalendarView"

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
      className="absolute bg-[#f5f5f5] dark:bg-[#42474D] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 w-72 z-50 event-popup"
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

      {event.location && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          📍 {event.location}
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
          <Button
            size="sm"
            variant={event.attendance === null ? "default" : "outline"}
            className="flex items-center gap-1"
            onClick={() => handleAttendanceChange(null)}
          >
            <Circle className="w-4 h-4" />
            대기
          </Button>
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
    
    setSelectedEvent(event)
  }

  const handleAttendanceClick = (event: StudyEvent, attendance: "attending" | "not_attending", e: React.MouseEvent) => {
    e.stopPropagation()
    updateEventAttendance(event.id, attendance)
  }

  return (
    <div ref={calendarRef}>
      <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
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
