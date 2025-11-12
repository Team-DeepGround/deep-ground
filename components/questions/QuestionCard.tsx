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

  const authorName = question.nickname || "알 수 없음";
  const authorAvatar = question.imageUrl || question.author?.avatar || "/placeholder.svg";
  const statusLabel = (status?: string) => {
    if (status === "OPEN") return "미해결";
    if (status === "RESOLVED") return "해결중";
    if (status === "CLOSED") return "해결완료";
    return "미해결";
  };

  const handleProfileClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. 'feed-post.tsx'와 동일하게 'profilePublicId'를 사용합니다.
    e.stopPropagation(); // 이벤트 버블링을 막아 다른 onClick 이벤트와의 충돌을 방지합니다.

    const profileId = question.profilePublicId;
    if (profileId) {
      // 2. API 호출 없이 즉시 프로필 페이지로 이동시킵니다.
      router.push(`/profile/${profileId}`);
    } else {
      // 3. 'profilePublicId'가 없는 경우에 대한 예외 처리
      alert('해당 사용자의 프로필 정보를 찾을 수 없습니다.');
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