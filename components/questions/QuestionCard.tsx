import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface QuestionCardProps {
  question: any;
  onTitleClick?: () => void;
}

export default function QuestionCard({ question, onTitleClick }: QuestionCardProps) {
  const authorName = question.author?.name || question.memberId || "알 수 없음";
  const authorAvatar = question.author?.avatar || "/placeholder.svg";
  const statusLabel = (status?: string) => {
    if (status === "OPEN") return "미해결";
    if (status === "RESOLVED") return "해결중";
    if (status === "CLOSED") return "해결완료";
    return "미해결";
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
                <span className="text-sm font-medium">{authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(question.createdAt).toISOString().slice(0, 10)}
                </span>
              </div>
              <h3 className="text-lg font-semibold mt-1 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onTitleClick) onTitleClick();
                  }}
                  className="text-left hover:underline hover:text-primary transition-colors focus:outline-none"
                >
                  {question.title}
                </button>
                {question.isResolved && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </h3>
            </div>
          </div>
          <span
            className={
              "text-xs font-semibold px-2 py-0.5 rounded-full border-2 shadow-sm text-black bg-[#ffe5e5] border-[#dc2626] min-w-[48px] text-center"
            }
            style={{
              color: '#111',
              background: question.status === "OPEN"
                ? "#ffe5e5"
                : question.status === "RESOLVED"
                ? "#fff9db"
                : question.status === "CLOSED"
                ? "#e6ffe5"
                : "#f5f5f5",
              borderColor: question.status === "OPEN"
                ? "#dc2626"
                : question.status === "RESOLVED"
                ? "#eab308"
                : question.status === "CLOSED"
                ? "#16a34a"
                : "#d1d5db",
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
        <div className="flex flex-wrap gap-1.5 mt-3">
          {question.tags && question.tags.map((tag: any, idx: number) => (
            <Badge key={tag + '-' + idx} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground flex items-center">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            {question.commentCount ?? question.answerCount ?? 0}
          </div>
          <div className="text-sm text-muted-foreground flex items-center">
            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
            {question.likeCount ?? 0}
          </div>
        </div>
        <Button asChild size="sm">
          <Link href={`/questions/${question.id}`}>답변하기</Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 