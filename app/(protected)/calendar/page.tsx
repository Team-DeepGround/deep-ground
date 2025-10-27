"use client"

import { useState, useRef } from "react"
import { useCalendar } from "@/lib/calendar"
import { Calendar } from "@/components/calendar/Calendar"

export default function CalendarPage() {
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const calendarRef = useRef<HTMLDivElement>(null)

  const calendarData = useCalendar()

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-black min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">스터디 캘린더</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">내가 참여하는 스터디 일정을 확인하세요</p>
        </div>
      </div>

      <Calendar
        {...calendarData}
        popupPosition={popupPosition}
        setPopupPosition={setPopupPosition}
        calendarRef={calendarRef}
      />
    </div>
  )
}
