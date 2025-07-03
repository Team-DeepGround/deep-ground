import {
    format,
    addDays,
    addWeeks,
    addMonths
  } from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronLeft, ChevronRight, EyeOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CalendarViewType } from "@/lib/calendar"

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
                    ? "bg-gray-400 dark:bg-gray-500 text-white"
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
  
  export default CalendarHeader