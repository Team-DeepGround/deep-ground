"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const hourOptions = Array.from({ length: 17 }, (_, i) => (i + 8).toString().padStart(2, "0"))
const minuteOptions = ["00", "10", "20", "30", "40", "50"]

const parseTime = (timeString: string) => {
  if (!timeString) return { hour: "", minute: "" }
  const [hour, minute] = timeString.split(":")
  return { hour, minute }
}

const formatTime = (hour: string, minute: string) => {
  if (!hour || !minute) return ""
  return `${hour}:${minute}`
}

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  placeholder?: string
}

export default function TimePicker({ value, onChange, placeholder }: TimePickerProps) {
  const { hour, minute } = parseTime(value)

  const handleHourChange = (newHour: string) => {
    onChange(formatTime(newHour, minute || "00"))
  }

  const handleMinuteChange = (newMinute: string) => {
    onChange(formatTime(hour || "00", newMinute))
  }

  return (
    <div className="flex gap-2 items-center">
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-20">
          <SelectValue placeholder="시" />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map((h) => (
            <SelectItem key={h} value={h}>
              {h}시
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-20">
          <SelectValue placeholder="분" />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((m) => (
            <SelectItem key={m} value={m}>
              {m}분
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
