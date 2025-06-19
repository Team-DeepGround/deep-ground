import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { StudyGroupDetail } from "@/types/study"

interface StudyHeaderProps {
  study: StudyGroupDetail
  isParticipating: boolean
  hasApplied: boolean
  onJoinStudy: () => void
  onShare: () => void
}

export function StudyHeader({
  study,
  isParticipating,
  hasApplied,
  onJoinStudy,
  onShare,
}: StudyHeaderProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{study.title}</h1>
        <div className="flex gap-2">
          <Button
            variant={isParticipating ? "secondary" : "default"}
            disabled={isParticipating || hasApplied}
            onClick={onJoinStudy}
          >
            {isParticipating
              ? "참여 중"
              : hasApplied
              ? "신청 완료"
              : "참여하기"}
          </Button>
          <Button variant="outline" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            공유하기
          </Button>
        </div>
      </div>
    </div>
  )
} 