import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { StudyGroupDetail } from "@/types/study"

interface StudyHeaderProps {
  study: StudyGroupDetail
  memberStatus: "NOT_APPLIED" | "PENDING" | "APPROVED"
  onJoinStudy: () => void
  onShare: () => void
}

export function StudyHeader({
  study,
  memberStatus,
  onJoinStudy,
  onShare,
}: StudyHeaderProps) {
  const getButtonText = () => {
    switch (memberStatus) {
      case "APPROVED":
        return "참여 중"
      case "PENDING":
        return "승인 대기중"
      case "NOT_APPLIED":
        return "참여하기"
      default:
        return "참여하기"
    }
  }

  const isButtonDisabled = memberStatus === "APPROVED" || memberStatus === "PENDING"

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{study.title}</h1>
        <div className="flex gap-2">
          <Button
            variant={memberStatus === "APPROVED" ? "secondary" : "default"}
            disabled={isButtonDisabled}
            onClick={onJoinStudy}
          >
            {getButtonText()}
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