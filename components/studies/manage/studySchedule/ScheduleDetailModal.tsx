"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: {
    title: string
    date: string
    startTime: Date
    endTime: Date
    location: string
    description: string
  } | null
}

export default function ScheduleDetailModal({ open, onOpenChange, schedule }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{schedule?.title}</DialogTitle>
          <DialogDescription>일정 상세 정보</DialogDescription>
        </DialogHeader>
        {schedule && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-semibold">날짜:</Label>
              <span className="col-span-3">{format(schedule.date, "yyyy-MM-dd")}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-semibold">시간:</Label>
              <span className="col-span-3">
                {format(schedule.startTime, "HH:mm")} - {format(schedule.endTime, "HH:mm")}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-semibold">장소:</Label>
              <span className="col-span-3">{schedule.location}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-semibold">설명:</Label>
              <span className="col-span-3">{schedule.description}</span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
