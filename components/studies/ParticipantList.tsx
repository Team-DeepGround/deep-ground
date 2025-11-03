import { useEffect, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Participant } from "@/types/study"
import { api } from "@/lib/api-client"
import { Button } from "../ui/button"
import { useAuth } from "@/components/auth-provider"

interface ParticipantListProps {
  studyId: number
  writerPublicId: string
  groupLimit: number
}

export function ParticipantList({ studyId, writerPublicId, groupLimit }: ParticipantListProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!studyId) return
    const fetchParticipants = async () => {
      try {
        const res = await api.get(`/study-group/${studyId}/participants`)
        setParticipants(res.result)
      } catch (e) {
      }
    }
    fetchParticipants()
  }, [studyId])

  // ✅ 정렬: 스터디장 → 나 → 나머지(가나다)
  const sorted = [...participants].sort((a, b) => {
    const aLeader = a.memberPublicId === writerPublicId
    const bLeader = b.memberPublicId === writerPublicId
    if (aLeader !== bLeader) return aLeader ? -1 : 1

    const aYou = user?.publicId && a.memberPublicId === user.publicId
    const bYou = user?.publicId && b.memberPublicId === user.publicId
    if (aYou !== bYou) return aYou ? -1 : 1

    return (a.nickname || "").localeCompare(b.nickname || "")
  })

  return (
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
            const isLeader = p.memberPublicId === writerPublicId
            const isYou = !!user?.publicId && p.memberPublicId === user.publicId

            return (
              <div
                key={p.memberPublicId}
                className="flex items-center gap-4 p-2 border rounded-lg"
              >
                <Avatar>
                  <AvatarImage src={p.profileImage} alt={p.nickname} />
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
                  <Link href={`/profile/${p.profilePublicId}`}>프로필</Link>
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
