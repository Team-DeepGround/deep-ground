import { Check, X, Star } from "lucide-react"
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
  isSameDay,
} from "date-fns"
import {
    getEventsForDate,
    getEventsForTimeSlot,
    getEventHeight,
    getEventStyle,
    shouldShowAttendanceButtons,
  } from "@/lib/calendar"
import type { StudyEvent } from "@/lib/calendar"

import { ko } from "date-fns/locale"

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
                <div className="py-0.5 text-right pr-3 text-gray-500 dark:text-gray-400 text-xs bg-gray-50 dark:bg-[rgba(43,43,43,0.7)]">
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
                          className={`p-2 rounded-sm cursor-pointer event-item h-full flex flex-col justify-center ${getEventStyle(event)} ${
                            event.attendance === "not_attending" ? "opacity-40" : ""
                          }`}
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
        
        {/* 상단 날짜 헤더 */}
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
                    ? "bg-blue-50 dark:bg-gray-300/20"
                    : ""
                  }`}
                >
                  <div className="text-base font-medium">{format(day, "d일", { locale: ko })}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">({format(day, "EEE", { locale: ko })})</div>
                </div>
              )
            })}
          </div>
        </div>
    
        {/* 본문 시간표 영역 */}
        <div>
          {Array.from({ length: (24 - 8) * 6 }, (_, i) => {
            const totalMinutes = i * 10
            const hour = Math.floor(totalMinutes / 60) + 8
            const minute = totalMinutes % 60
            const isHourLine = minute === 0
    
            return (
              <div key={i} className="grid grid-cols-[100px_1fr] h-[20px] relative">
                
                {/* 시간 표시 영역 */}
                <div className="py-0.5 text-right pr-3 text-gray-500 dark:text-gray-400 text-xs bg-gray-50 dark:bg-[rgba(43,43,43,0.6)] border-r border-gray-100 dark:border-gray-800">
                  {minute === 0 && `${hour < 12 ? "오전" : "오후"} ${hour % 12 === 0 ? 12 : hour % 12}시`}
                </div>
    
                {/* 7일 영역 */}
                <div className="grid grid-cols-7 relative">
                  {weekDays.map((day, dayIndex) => {
                    const dayEvents = getEventsForTimeSlot(events, day, hour, minute, showHiddenEvents)
                    return (
                      <div key={dayIndex} className="relative border-l border-gray-100 dark:border-gray-800">
                        
                        {/* 배경선 */}
                        <div
                          className={`absolute left-0 right-0 h-[1px] ${
                            isHourLine ? "bg-gray-300 dark:bg-gray-600" : "bg-gray-100 dark:bg-gray-800"
                          }`}
                          style={{ top: 0, zIndex: 0 }}
                        />
    
                        {/* 일정 렌더링 */}
                        {dayEvents.map((event) => {
                          const eventHeight = getEventHeight(event)
                          return (
                            <div
                              key={event.id}
                              className="absolute left-1 right-1 z-20"
                              style={{ top: 0, height: `${eventHeight}px` }}
                            >
                              {shouldShowAttendanceButtons(event, showHiddenEvents) && (
                                <div className="absolute -top-1 -right-1 z-30 flex space-x-1">
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
                                    className={`p-1 text-xs rounded-sm cursor-pointer event-item h-full flex flex-col justify-center ${getEventStyle(event)} ${
                                      event.attendance === "not_attending" ? "opacity-40" : ""
                                    }`}
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
                  !isCurrentMonth ? "text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-[#1E1E1E]" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? "bg-gray-400 dark:bg-gray-500 text-white" : "text-gray-900 dark:text-gray-100"
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
                        className={`text-xs py-1 px-2 rounded-sm truncate cursor-pointer event-item ${getEventStyle(event)} ${
                          event.attendance === "not_attending" ? "opacity-40" : ""
                        }`}
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
  
  export { DayView, WeekView, MonthView }