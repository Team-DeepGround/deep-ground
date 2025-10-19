import { useEffect, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Participant } from "@/types/study"
import { api } from "@/lib/api-client"
import { Button } from "../ui/button"
import { ReportModal } from "@/components/report/report-modal"

interface ParticipantListProps {
  studyId: number
  writerId: number
  groupLimit: number
  currentMemberId?: number   // ✅ 추가
}

export function ParticipantList({ studyId, writerId, groupLimit, currentMemberId }: ParticipantListProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [reportTargetId, setReportTargetId] = useState<number | null>(null)

  useEffect(() => {
    if (!studyId) return
    const fetchParticipants = async () => {
      try {
        const res = await api.get(`/study-group/${studyId}/participants`)
        setParticipants(res.result)
      } catch (e) {
        console.error("Failed to fetch participants", e)
      }
    }
    fetchParticipants()
  }, [studyId])

  const handleReportClick = (memberId: number) => setReportTargetId(memberId)
  const handleReportClose = () => setReportTargetId(null)

  // ✅ 정렬: 스터디장 → 나 → 나머지(가나다)
  const sorted = [...participants].sort((a, b) => {
    const aLeader = a.memberId === writerId
    const bLeader = b.memberId === writerId
    if (aLeader !== bLeader) return aLeader ? -1 : 1

    const aYou = currentMemberId && a.memberId === currentMemberId
    const bYou = currentMemberId && b.memberId === currentMemberId
    if (aYou !== bYou) return aYou ? -1 : 1

    return (a.nickname || "").localeCompare(b.nickname || "")
  })

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>참여자 목록</span>
            <span className="text-sm text-muted-foreground">
              {participants.length}/{groupLimit}명
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {sorted.map((p) => {
              const isLeader = p.memberId === writerId
              const isYou = !!currentMemberId && p.memberId === currentMemberId

              return (
                <div
                  key={p.memberId}
                  className="flex items-center gap-4 p-2 border rounded-lg"
                >

                  <Avatar>
                    {/* 필요하면 AvatarImage 사용 가능 */}
                    {/* <AvatarImage src={p.profileImage} alt={p.nickname} /> */}
                    <AvatarFallback>{p.nickname?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.nickname}</span>
                      {isLeader && <Badge variant="secondary">스터디장</Badge>}
                      {isYou && <Badge variant="default">나</Badge>}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/profile/${p.profileId}`}>프로필</Link>
                  </Button>

                  {!isYou && (
                    <Button variant="ghost" size="sm" onClick={() => handleReportClick(p.memberId)}>
                      신고
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {reportTargetId !== null && (
        <ReportModal
          targetId={reportTargetId}
          targetType="MEMBER"
          open={true}
          setOpen={handleReportClose}
          triggerText=""
        />
      )}
    </>
  )
}
