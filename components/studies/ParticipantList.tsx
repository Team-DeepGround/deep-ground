import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudyGroupDetail } from "@/types/study"

interface ParticipantListProps {
  study: StudyGroupDetail
}

export function ParticipantList({ study }: ParticipantListProps) {
  // 스터디장과 일반 참여자를 분리
  const leader = study.writer
  const otherParticipants = study.participants.filter(
    (participant) => participant !== study.writer
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>참여자 목록</span>
          <span className="text-sm text-muted-foreground">
            {study.participants.length}/{study.groupLimit}명
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 스터디장 */}
          <div className="flex items-center gap-4 p-2 border rounded-lg">
            <Avatar>
              <AvatarFallback>
                {leader.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{leader}</div>
            </div>
            <Badge variant="secondary">스터디장</Badge>
          </div>

          {/* 일반 참여자 */}
          {otherParticipants.map((participant) => (
            <div
              key={participant}
              className="flex items-center gap-4 p-2 border rounded-lg"
            >
              <Avatar>
                <AvatarFallback>
                  {participant.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{participant}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 