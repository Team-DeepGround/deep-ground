"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, MapPin, Users } from "lucide-react"
import { StudySession } from "@/types/study"
import { formatDate } from "@/lib/utils"

interface StudyScheduleProps {
  sessions: StudySession[]
  isParticipating: boolean
  onAddSession?: () => void
}

export function StudySchedule({
  sessions,
  isParticipating,
  onAddSession,
}: StudyScheduleProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">스터디 일정</h3>
        </div>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            스터디 일정이 없습니다
          </div>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{session.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.description}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(session.startDate)}{" "}
                    {new Date(session.startDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} ~{" "}
                    {new Date(session.endDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {session.location ? session.location : "장소 미정"}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  )
} 