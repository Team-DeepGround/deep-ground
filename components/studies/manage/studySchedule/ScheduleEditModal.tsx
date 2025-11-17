"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import TimePicker from "./TimePicker"
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ko } from "date-fns/locale"

interface Schedule {
  id: number
  studyScheduleId: number
  title: string
  date: string
  startTime: Date
  endTime: Date
  location: string
  description: string
  attendance?: "attending" | "not_attending" | null
  isImportant?: boolean
  personalNote?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: Schedule | null
  setSchedule: (schedule: Schedule | null) => void
  onSubmit: () => void
  // ✅ 스터디 기간
  studyStartDate: string // "yyyy-MM-dd"
  studyEndDate: string   // "yyyy-MM-dd"
}

export default function ScheduleEditModal({
  open,
  onOpenChange,
  schedule,
  setSchedule,
  onSubmit,
  studyStartDate,
  studyEndDate,
}: Props) {
  if (!schedule) return null

  const start = parseISO(studyStartDate)
  const end = parseISO(studyEndDate)

  const selectedDate = schedule.date ? parseISO(schedule.date) : schedule.startTime

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>일정 수정</DialogTitle>
          <DialogDescription>
            일정 정보를 수정하세요. 스터디 기간({studyStartDate} ~ {studyEndDate}) 내에서만 변경할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-title" className="text-right">
              제목
            </Label>
            <Input
              id="edit-title"
              placeholder="제목은 필수입니다"
              value={schedule.title}
              onChange={(e) => setSchedule({ ...schedule, title: e.target.value })}
              className="col-span-3"
            />
          </div>

          {/* 🔥 달력으로 날짜 선택 + 범위 밖 블러 처리 */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">날짜</Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !schedule.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, "PPP", { locale: ko })
                      : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={ko}
                    selected={selectedDate}
                    onSelect={(day) => {
                      if (!day) return
                      const newDate = format(day, "yyyy-MM-dd")
                      setSchedule({
                        ...schedule,
                        date: newDate,
                        startTime: new Date(
                          `${newDate}T${format(schedule.startTime, "HH:mm")}:00`,
                        ),
                        endTime: new Date(
                          `${newDate}T${format(schedule.endTime, "HH:mm")}:00`,
                        ),
                      })
                    }}
                    // ✅ 스터디 기간 밖은 비활성화
                    disabled={(date) => date < start || date > end}
                    modifiers={{
                      today: new Date(),
                      outsideRange: (date) => date < start || date > end,
                    }}
                    modifiersStyles={{
                      today: {
                        color: "black",
                        fontWeight: "bold",
                        border: "1px solid black",
                        borderRadius: "6px",
                      },
                      outsideRange: {
                        opacity: 0.35,
                        filter: "blur(0.4px)",
                        cursor: "not-allowed",
                        textDecoration: "line-through",
                      },
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">시작 시간</Label>
            <div className="col-span-3">
              <TimePicker
                value={format(schedule.startTime, "HH:mm")}
                onChange={(time) =>
                  setSchedule({
                    ...schedule,
                    startTime: new Date(`${schedule.date}T${time}:00`),
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">종료 시간</Label>
            <div className="col-span-3">
              <TimePicker
                value={format(schedule.endTime, "HH:mm")}
                onChange={(time) =>
                  setSchedule({
                    ...schedule,
                    endTime: new Date(`${schedule.date}T${time}:00`),
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-location" className="text-right">
              장소
            </Label>
            <Input
              id="edit-location"
              value={schedule.location}
              onChange={(e) => setSchedule({ ...schedule, location: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              설명
            </Label>
            <Textarea
              id="edit-description"
              placeholder="설명은 필수입니다"
              value={schedule.description}
              onChange={(e) => setSchedule({ ...schedule, description: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onSubmit}>수정하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
