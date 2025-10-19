import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, Pencil, Trash, CheckCircle2, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDateTime, formatReadableDate } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { api } from "@/lib/api-client";

interface AnswerListProps {
  answers: any[];
  likedAnswers: number[];
  answerLikeLoading: Record<number, boolean>;
  showCommentInput: number | null;
  answerComments: Record<number, string>;
  setAnswerComments: (comments: Record<number, string>) => void;
  answerCommentsData: Record<number, any[]>;
  editingCommentId: number | null;
  editingCommentContent: string;
  setEditingCommentContent: (content: string) => void;
  handleLikeAnswer: (answerId: number) => void;
  handleAddComment: (answerId: number) => void;
  handleEditComment: (commentId: number, answerId: number) => Promise<void> | void;
  handleDeleteComment: (commentId: number, answerId: number) => Promise<void> | void;
  handleDeleteAnswer: (answerId: number) => void;
  setShowCommentInput: (answerId: number | null) => void;
  setEditingCommentId: (commentId: number | null) => void;
  question: any;
  toast: any;
  memberId: number | null;
}

export default function AnswerList({ 
  answers, 
  likedAnswers, 
  answerLikeLoading, 
  showCommentInput, 
  answerComments, 
  setAnswerComments, 
  answerCommentsData, 
  editingCommentId, 
  editingCommentContent, 
  setEditingCommentContent, 
  handleLikeAnswer, 
  handleAddComment, 
  handleEditComment, 
  handleDeleteComment,
  handleDeleteAnswer,
  setShowCommentInput, 
  setEditingCommentId, 
  question, 
  toast,
  memberId
}: AnswerListProps) {
  const router = useRouter();

  const handleProfileClick = async (memberId: number, memberProfileId?: number) => {
    const targetProfileId = memberProfileId || memberId;
    try {
      // API 클라이언트를 사용하여 프로필 존재 여부 확인
      await api.get(`/members/profile/${targetProfileId}`);
      router.push(`/profile/${targetProfileId}`);
    } catch (error: any) {
      console.error('프로필 조회 오류:', error);
      if (error.status === 400) {
        alert('해당 사용자의 프로필이 존재하지 않습니다.');
      } else {
        alert('프로필을 조회하는 중 오류가 발생했습니다.');
      }
    }
  };
  
  
  return (
    <div className="space-y-6 mb-8">
      {answers.map((answer: any) => (
        <Card key={answer.answerId ? String(answer.answerId) : JSON.stringify(answer)} className={answer.isAccepted ? "border-green-500" : ""}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage 
                    src={answer.imageUrl || answer.author?.avatar || "/placeholder.svg"} 
                    alt={answer.nickname || `User ${answer.memberId}`} 
                  />
                  <AvatarFallback>
                    {answer.nickname ? answer.nickname[0] : answer.memberId}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <button 
                    className="font-medium hover:underline focus:outline-none text-left" 
                    type="button"
                    onClick={() => handleProfileClick(answer.memberId, answer.memberProfileId)}
                  >
                    {answer.nickname || answer.author?.nickname || answer.author?.name || `User ${answer.memberId}`}
                  </button>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {answer.createdAt ? (
                      <>
                        {new Date(answer.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        
                      </>
                    ) : answer.created_at ? (
                      <>
                        {new Date(answer.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        
                      </>
                    ) : answer.createDate ? (
                      <>
                        {new Date(answer.createDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        
                      </>
                    ) : answer.regDate ? (
                      <>
                        {new Date(answer.regDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        {(() => {
                          try {
                            return formatDateTime(new Date().toISOString())
                          } catch {
                            return '방금 전'
                          }
                        })()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {answer.isAccepted && (
                  <Badge variant="secondary">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    채택된 답변
                  </Badge>
                )}
                {/* 답변 수정/삭제 버튼은 작성자에게만 표시 */}
                {memberId && answer.memberId && Number(memberId) === Number(answer.memberId) && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/answers/${answer.answerId}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">답변 수정</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (window.confirm('정말로 이 답변을 삭제하시겠습니까?')) {
                          await handleDeleteAnswer(answer.answerId);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={answerLikeLoading[answer.answerId]}
                  className={`flex items-center gap-1 transition-colors duration-150 ${likedAnswers.includes(answer.answerId) ? "text-black" : "text-gray-300"}`}
                  onClick={() => handleLikeAnswer(answer.answerId)}
                  aria-label={likedAnswers.includes(answer.answerId) ? "좋아요 취소" : "좋아요"}
                >
                  <ThumbsUp className={`h-4 w-4 ${likedAnswers.includes(answer.answerId) ? "text-black" : "text-gray-300"}`} />
                  <span>{typeof answer.likeCount === 'number' ? answer.likeCount : 0}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <MarkdownRenderer content={answer.answerContent || ""} />
              {answer.mediaUrls && answer.mediaUrls.length > 0 && (
                <div className="space-y-4">
                  {answer.mediaUrls.map((url: string, idx: number) => (
                    <div key={url || idx} className="rounded-md overflow-hidden">
                      <img src={url} alt={`답변 이미지 ${idx + 1}`} style={{ maxWidth: "100%" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4 pt-0">
            <div className="flex justify-end gap-2 w-full">
              {!answer.isAccepted && question?.isResolved === false && (
                <Button variant="outline" size="sm">
                  답변 채택하기
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentInput(showCommentInput === answer.answerId ? null : answer.answerId)}
              >
                댓글 달기
              </Button>
            </div>
            {/* 댓글 목록 (답변처럼 카드/행 형태, 수정/삭제 인라인) */}
            {answerCommentsData[answer.answerId]?.length > 0 && (
              <div className="space-y-3 mb-4 w-full">
                {answerCommentsData[answer.answerId].map((comment: any, idx: number) => (
                  <div key={comment.commentId ? String(comment.commentId) : idx} className="flex items-center border-b py-2 w-full">
                    <button 
                      className="font-medium text-xs mr-2 hover:underline focus:outline-none text-left" 
                      type="button"
                      onClick={() => handleProfileClick(comment.memberId, comment.memberProfileId)}
                    >
                      {comment.nickname || comment.nickName || comment.memberNickname || comment.memberId}
                    </button>
                    {editingCommentId === comment.commentId ? (
                      <>
                        <Textarea
                          value={editingCommentContent}
                          onChange={e => setEditingCommentContent(e.target.value)}
                          className="text-sm min-h-[32px] resize-none flex-1"
                        />
                        <Button size="sm" onClick={() => handleEditComment(comment.commentId, answer.answerId)}>저장</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>취소</Button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs flex-1">{comment.content}</span>
                        <div className="ml-auto flex gap-1 items-center">
                          {comment.createdAt && (
                            <span className="text-xs text-muted-foreground mr-2">
                              {new Date(comment.createdAt).toLocaleDateString('ko-KR', {
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                          {/* 댓글 수정/삭제 버튼은 작성자에게만 표시 */}
                          {memberId && comment.memberId && Number(memberId) === Number(comment.memberId) && (
                            <>
                              <Button size="icon" variant="ghost" aria-label="댓글 수정" onClick={() => {
                                setEditingCommentId(comment.commentId);
                                setEditingCommentContent(comment.content);
                              }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" aria-label="댓글 삭제" onClick={() => {
                                if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
                                  handleDeleteComment(comment.commentId, answer.answerId);
                                }
                              }}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* 댓글 입력창 토글 */}
            {showCommentInput === answer.answerId && (
              <div className="w-full border-t pt-4 mt-2">
                <Textarea
                  placeholder="댓글을 입력하세요..."
                  value={answerComments[answer.answerId] || ""}
                  onChange={(e) =>
                    setAnswerComments({
                      ...answerComments,
                      [answer.answerId]: e.target.value,
                    })
                  }
                  className="text-sm min-h-[60px] resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => handleAddComment(answer.answerId)}>
                    등록
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowCommentInput(null)}>
                    취소
                  </Button>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 