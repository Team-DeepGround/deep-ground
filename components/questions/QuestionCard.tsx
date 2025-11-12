import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar } from "lucide-react";
import Link from "next/link";
import { formatReadableDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

interface QuestionCardProps {
  question: any;
  onTitleClick: () => void;
}

export default function QuestionCard({ question, onTitleClick }: QuestionCardProps) {
  const router = useRouter();

  console.log("QuestionCard data:", question);
  
  const authorName = question.nickname || "알 수 없음";
  const authorAvatar = question.imageUrl || question.author?.avatar || "/placeholder.svg";
  const statusLabel = (status?: string) => {
    if (status === "OPEN") return "미해결";
    if (status === "RESOLVED") return "해결중";
    if (status === "CLOSED") return "해결완료";
    return "미해결";
  };

  const handleProfileClick = async () => {
    // 💡 [수정] 'profilePublicId' 대신 실제 UUID가 담긴 키 이름을 사용하세요.
    // 1순위 후보: question.publicId (피드 댓글과 동일)
    // 2순위 후보: question.authorPublicId (더 명시적)
    // 3순위 후보: question.memberPublicId
    // (위 console.log로 확인한 정확한 키 이름을 넣으세요)
    const profileId = question.publicId || question.profilePublicId; 

    if (profileId) {
      try {
        // API 클라이언트를 사용하여 프로필 존재 여부 확인
        await api.get(`/members/profile/${profileId}`);
        router.push(`/profile/${profileId}`);
      } catch (error: any) {
        if (error.response?.status === 400 || error.status === 400) {
          alert('해당 사용자의 프로필이 존재하지 않습니다.');
        } else {
          alert(`프로필을 조회하는 중 오류가 발생했습니다: ${error.message}`);
        }
      }
    } else {
      // 💡 [추가] profileId가 없을 때 사용자에게 피드백을 줍니다.
      console.warn("프로필 ID(publicId)를 찾을 수 없습니다.", question);
      // alert('프로필 ID를 찾을 수 없어 이동할 수 없습니다.'); // 필요시 주석 해제
    }
  };
  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback>{authorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <button 
                  className="text-sm font-medium hover:underline focus:outline-none" 
                  type="button"
                  onClick={handleProfileClick}
                >
                  {authorName}
                </button>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {question.createdAt ? formatReadableDate(question.createdAt) : ''}
                </span>
              </div>
              <h3 className="text-lg font-semibold mt-1 flex items-center gap-2">
                <button
                  onClick={onTitleClick}
                  className="text-left hover:underline hover:text-primary transition-colors focus:outline-none"
                >
                  {question.title}
                </button>
                {question.status === 'CLOSED' && <span className="ml-2 text-green-500">해결됨</span>}
              </h3>
              {/* 기술 스택 표시 */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {question.techStacks && question.techStacks.map((tag: any, idx: number) => (
                  <Badge key={tag + '-' + idx} variant="secondary" className="font-normal text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          {/* 상태 pill */}
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full border-2 shadow-sm text-black bg-gray-200 border-gray-400 min-w-[48px] text-center"
            style={{
              color: '#111',
              background: "#e5e7eb",
              borderColor: "#9ca3af",
              lineHeight: "1.2",
              fontWeight: 600,
              fontSize: "0.75rem",
              minWidth: "48px",
              textAlign: "center"
            }}
          >
            {statusLabel(question.status)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{question.content}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            {question.commentCount ?? question.answerCount ?? 0}
          </div>
        </div>
        <Button
          size="sm"
          onClick={onTitleClick}
          disabled={!question?.questionId && !question?.id}
        >
          답변하기
        </Button>
      </CardFooter>
    </Card>
  );
} 