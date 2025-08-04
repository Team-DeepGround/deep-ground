import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, Pencil, Trash, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AnswerList({ answers, likedAnswers, answerLikeLoading, showCommentInput, answerComments, setAnswerComments, answerCommentsData, editingCommentId, editingCommentContent, setEditingCommentContent, handleLikeAnswer, handleAddComment, handleEditComment, handleDeleteComment, setShowCommentInput, setEditingCommentId, question, toast }) {
  const router = useRouter();
  return (
    <div className="space-y-6 mb-8">
      {answers.map((answer) => (
        <Card key={answer.answerId ? String(answer.answerId) : JSON.stringify(answer)} className={answer.isAccepted ? "border-green-500" : ""}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg" alt={`User ${answer.memberId}`} />
                  <AvatarFallback>{answer.memberId}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">User {answer.memberId}</div>
                  <div className="text-xs text-muted-foreground">
                    {answer.createdAt ? new Date(answer.createdAt).toISOString().slice(0, 10) : ''}
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
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{answer.answerContent}</p>
              {answer.mediaUrls && answer.mediaUrls.length > 0 && (
                <div className="mt-4 space-y-4">
                  {answer.mediaUrls.map((url, idx) => (
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
              {/* 답변 수정(페이지 이동) 버튼 */}
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
                    await handleDeleteComment(answer.answerId);
                  }
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
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
                    <span className="font-medium text-xs mr-2">{comment.nickName || comment.memberId}</span>
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
                        <div className="ml-auto flex gap-1">
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