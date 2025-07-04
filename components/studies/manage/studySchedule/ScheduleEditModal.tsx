"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import TimePicker from "./TimePicker"
import { format } from "date-fns"

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
}

export default function ScheduleEditModal({ open, onOpenChange, schedule, setSchedule, onSubmit }: Props) {
  if (!schedule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>일정 수정</DialogTitle>
          <DialogDescription>일정 정보를 수정하세요.</DialogDescription>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-date" className="text-right">
              날짜
            </Label>
            <Input
              id="edit-date"
              type="date"
              value={schedule.date}
              onChange={(e) => {
                const newDate = e.target.value
                setSchedule({
                  ...schedule,
                  date: newDate,
                  startTime: new Date(`${newDate}T${format(schedule.startTime, "HH:mm")}:00`),
                  endTime: new Date(`${newDate}T${format(schedule.endTime, "HH:mm")}:00`),
                })
              }}
              className="col-span-3"
            />
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
