import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Applicant {
  memberPublicId: string // 백엔드 응답에 맞춰 memberPublicId로 변경
  nickname: string
  joinedAt: null
  owner: false
}

interface StudyApplicantsProps {
  applicants: Applicant[]
  onApprove: (memberPublicId: string) => void // 파라미터 이름은 API URL에 맞춰 유지
  onReject: (memberPublicId: string) => void // 파라미터 이름은 API URL에 맞춰 유지
}

export function StudyApplicants({ applicants, onApprove, onReject }: StudyApplicantsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>신청자 관리</CardTitle>
        <CardDescription>스터디 참여 신청을 관리하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applicants.map((applicant) => (
            <div key={applicant.memberPublicId} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{applicant.nickname[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{applicant.nickname}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApprove(applicant.memberPublicId)}
                >
                  승인
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => onReject(applicant.memberPublicId)}
                >
                  거절
                </Button>
              </div>
            </div>
          ))}
          {applicants.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              대기 중인 신청자가 없습니다.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 