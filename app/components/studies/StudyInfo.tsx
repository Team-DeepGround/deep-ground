import { Calendar, Users, MapPin } from "lucide-react"
import { StudyGroupDetail } from "@/types/study"

interface StudyInfoProps {
  study: StudyGroupDetail
}

export function StudyInfo({ study }: StudyInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <span>
          모집 기간: {new Date(study.recruitStartDate).toLocaleDateString()} ~{" "}
          {new Date(study.recruitEndDate).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <span>
          스터디 기간: {new Date(study.studyStartDate).toLocaleDateString()} ~{" "}
          {new Date(study.studyEndDate).toLocaleDateString()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <span>
          {study.memberCount}/{study.groupLimit}명
        </span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <span>{study.offline ? study.location : "온라인"}</span>
      </div>
    </div>
  )
} 