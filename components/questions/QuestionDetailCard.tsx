import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Pencil, Trash, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDateTime, formatReadableDate } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface QuestionDetailCardProps {
  question: any;
  memberId: number | null;
  statusUpdating: boolean;
  handleStatusChange: (status: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function QuestionDetailCard({ 
  question, 
  memberId, 
  statusUpdating, 
  handleStatusChange, 
  onEdit, 
  onDelete 
}: QuestionDetailCardProps) {
  const router = useRouter();
  
  
  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {question?.techStacks?.map((tag: any, idx: number) => (
                <Badge key={tag ? String(tag) : idx} variant="secondary" className="font-normal">
                  {tag}
                </Badge>
              ))}
              {question?.isResolved && (
                <Badge variant="secondary" className="ml-2">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  해결됨
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl">{question?.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {question?.createdAt
                  ? new Date(question.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : question?.created_at
                  ? new Date(question.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : question?.createDate
                  ? new Date(question.createDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : question?.regDate
                  ? new Date(question.regDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '작성 시간 정보 없음'}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2">
              <span
                className={
                  "text-xs font-semibold px-2 py-0.5 rounded-full border-2 shadow-sm text-black bg-[#ffe5e5] border-[#dc2626] min-w-[48px] text-center"
                }
                style={{
                  color: '#111',
                  background: question?.status === "OPEN"
                    ? "#ffe5e5"
                    : question?.status === "RESOLVED"
                    ? "#fff9db"
                    : question?.status === "CLOSED"
                    ? "#e6ffe5"
                    : "#f5f5f5",
                  borderColor: question?.status === "OPEN"
                    ? "#dc2626"
                    : question?.status === "RESOLVED"
                    ? "#eab308"
                    : question?.status === "CLOSED"
                    ? "#16a34a"
                    : "#d1d5db",
                  lineHeight: "1.2",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  minWidth: "48px",
                  textAlign: "center"
                }}
              >
                {question?.questionStatus === "OPEN"
                  ? "미해결"
                  : question?.questionStatus === "RESOLVED"
                  ? "해결중"
                  : question?.questionStatus === "CLOSED"
                  ? "해결완료"
                  : "미해결"}
              </span>
              {memberId && memberId == question?.memberId && (
                <select
                  className="ml-2 text-sm font-medium border border-gray-300 bg-white px-2 py-1 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  value={question?.questionStatus || 'OPEN'}
                  disabled={!!statusUpdating}
                  onChange={e => handleStatusChange(e.target.value)}
                >
                  <option value="OPEN">미해결</option>
                  <option value="RESOLVED">해결중</option>
                  <option value="CLOSED">해결완료</option>
                </select>
              )}
            </div>
            <div className="flex gap-2 items-center mt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={onEdit}
                aria-label="질문 수정하기"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                aria-label="질문 삭제하기"
                onClick={onDelete}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={question?.author?.avatar || "/placeholder.svg"} alt={question?.author?.name || "알 수 없음"} />
            <AvatarFallback>{question?.author?.name ? question.author.name[0] : "?"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {question?.author?.name
                ? question.author.name
                : question?.nickname
                ? question.nickname
                : question?.memberId
                ? `ID: ${question.memberId}`
                : "알 수 없음"}
            </div>
            <div className="text-xs text-muted-foreground">작성자</div>
          </div>
        </div>
        <div className="space-y-4">
          <MarkdownRenderer content={question?.content || ""} />
          {question?.mediaUrl && Array.isArray(question.mediaUrl) && question.mediaUrl.length > 0 && (
            <div className="space-y-4">
              {question.mediaUrl.map((url: string, idx: number) => (
                <div key={url || idx} className="rounded-md overflow-hidden">
                  {/* AuthImage는 부모에서 import해서 넘겨주거나, 이곳에서 직접 구현 필요 */}
                  <img src={url} alt={`질문 이미지 ${idx + 1}`} style={{ maxWidth: "100%" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 