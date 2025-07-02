"use client"

// Create a new file for the question detail page with answer functionality and image upload

// First, let's create the question detail page with image support
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ThumbsUp, CheckCircle2, Calendar, ArrowLeft, X, Pencil, Trash } from "lucide-react"
import FileUpload from "@/components/file-upload"
import { api } from "@/lib/api-client"

// 이미지 Object URL 캐싱용 커스텀 훅
function useAuthImageUrls(urls: string[] | undefined) {
  const [objectUrls, setObjectUrls] = useState<(string | null)[]>([])
  const prevUrlsRef = useRef<string[]>([])

  useEffect(() => {
    let isMounted = true
    if (!urls || urls.length === 0) {
      setObjectUrls([])
      return
    }
    // 이전 Object URL 해제
    prevUrlsRef.current.forEach((url) => {
      if (url && url.startsWith("blob:")) URL.revokeObjectURL(url)
    })
    prevUrlsRef.current = []

    const fetchImages = async () => {
      const accessToken = localStorage.getItem("auth_token")
      const results = await Promise.all(urls.map(async (url) => {
        if (url.startsWith("/media/")) {
          // /media/TOooRK0fhC_haerin.jpg → TOooRK0fhC_haerin.jpg만 추출
          const pathVar = url.startsWith("/") ? url.substring(1) : url;
          const fileName = pathVar.replace("media/", "");
          const fetchUrl = `http://localhost:3000/question/media/${fileName}`;
          console.log("fetch 요청:", fetchUrl);
          try {
            const res = await fetch(fetchUrl, {
              headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            })
            if (!res.ok) return null
            const blob = await res.blob()
            const objectUrl = URL.createObjectURL(blob)
            prevUrlsRef.current.push(objectUrl)
            return objectUrl
          } catch {
            return null
          }
        } else if (url.startsWith("/")) {
          return `http://localhost:3000${url}`
        } else {
          return url
        }
      }))
      if (isMounted) setObjectUrls(results)
    }
    fetchImages()
    return () => {
      isMounted = false
      prevUrlsRef.current.forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url)
      })
      prevUrlsRef.current = []
    }
  }, [urls?.join(",")])
  return objectUrls
}

// 인증 헤더가 필요한 이미지 렌더링용 컴포넌트
function AuthImage({ imageUrl, alt = "이미지" }: { imageUrl: string; alt?: string }) {
  // S3 URL 등 외부 URL이면 바로 렌더링
  if (imageUrl.startsWith("http")) {
    return <img src={imageUrl} alt={alt} style={{ maxWidth: "100%" }} />;
  }
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!imageUrl) return;
    let isMounted = true;
    const fetchImage = async () => {
      const token = localStorage.getItem("auth_token");
      try {
        const res = await fetch(`http://localhost:3000${imageUrl}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("이미지 로드 실패");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (isMounted) setBlobUrl(url);
      } catch (e) {
        if (isMounted) setBlobUrl(null);
      }
    };
    fetchImage();
    return () => {
      isMounted = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [imageUrl]);

  if (!blobUrl) return <div style={{ width: 100, height: 100, background: "#eee" }}>이미지 없음</div>;
  return <img src={blobUrl} alt={alt} style={{ maxWidth: "100%" }} />;
}

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [answerContent, setAnswerContent] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])

  // 상태 관리 부분에 다음 상태들을 추가합니다 (useState 부분 근처에)
  const [likedAnswers, setLikedAnswers] = useState<number[]>([])
  const [showCommentInput, setShowCommentInput] = useState<number | null>(null)
  const [answerComments, setAnswerComments] = useState<Record<number, string>>({})
  const [answerCommentsData, setAnswerCommentsData] = useState<Record<number, any[]>>({})

  // 질문 상세 데이터 상태
  const [question, setQuestion] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 답변 데이터 상태
  const [answers, setAnswers] = useState<any[]>([])
  const [answerLikeLoading, setAnswerLikeLoading] = useState<Record<number, boolean>>({})

  // 댓글 인라인 수정 상태
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState<string>("");

  // 질문 이미지 Object URL
  // const questionImageUrls = useAuthImageUrls(question?.mediaUrl)

  const fetchQuestion = async () => {
    setLoading(true)
    try {
      const accessToken = localStorage.getItem("auth_token")
      const res = await fetch(`http://localhost:3000/api/v1/questions/${params.id}`,
        accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
      )
      const data = await res.json()
      const q = data.result?.question || data.result
      setQuestion(q)
      if (q?.answers) {
        setAnswers(q.answers)
        // 댓글 데이터 초기화 (List<CommentDTO> comments)
        const commentsData: Record<number, any[]> = {};
        q.answers.forEach((answer: any) => {
          commentsData[answer.answerId] = answer.comments || [];
        });
        setAnswerCommentsData(commentsData);
        console.log('answers:', q.answers) // 디버깅용
        console.log('user.id:', user?.id) // 디버깅용
        
        // localStorage에서 내가 좋아요 누른 답변 목록 불러오기
        const storedLikedAnswers = localStorage.getItem(`likedAnswers_${params.id}`);
        if (storedLikedAnswers) {
          const likedAnswerIds = JSON.parse(storedLikedAnswers);
          setLikedAnswers(likedAnswerIds);
          console.log('localStorage에서 불러온 likedAnswers:', likedAnswerIds);
        } else {
          setLikedAnswers([]);
        }
      } else {
        setAnswers([])
        setLikedAnswers([])
      }
      // 디버깅: 유저와 질문 작성자 정보 콘솔 출력
      console.log('user:', user)
      console.log('question:', q)
      console.log('question.author:', q?.author)
      console.log('question.memberId:', q?.memberId)
      console.log('question.email:', q?.email)
      console.log('question.nickname:', q?.nickname)
      console.log('question.author.name:', q?.author?.name)
      console.log('user.name:', user?.name)
      console.log('user.email:', user?.email)
      console.log('user.id:', user?.id)
    } catch (e) {
      setQuestion(null)
      setAnswers([])
      setLikedAnswers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      // URL에 refresh=true가 있으면 새로고침 후 제거
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('refresh') === 'true') {
        fetchQuestion()
        // refresh 파라미터 제거
        urlParams.delete('refresh')
        const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`
        window.history.replaceState({}, '', newUrl)
      } else {
        fetchQuestion()
      }
    }
  }, [params.id])

  // 페이지 포커스 시 데이터 새로고침 (답변 수정 후 돌아올 때)
  useEffect(() => {
    const handleFocus = () => {
      if (params.id) {
        fetchQuestion()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [params.id])

  // 여러 파일 업로드 핸들러 (질문 작성과 동일하게)
  const handleImageUpload = (files: File[]) => {
    // 여러 파일 중 중복 아닌 것만 추가
    const newFiles = files.filter(file => !uploadedImages.some(f => f.name === file.name && f.size === file.size))
    if (newFiles.length < files.length) {
      toast({
        title: "중복 이미지",
        description: "이미 첨부된 이미지는 제외되었습니다.",
        variant: "destructive",
      })
    }
    setUploadedImages((prev) => [...prev, ...newFiles])
    if (newFiles.length > 0) {
      toast({
        title: "이미지 업로드",
        description: `${newFiles.length}개의 이미지가 추가되었습니다.`,
      })
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitAnswer = async () => {
    if (!answerContent.trim()) {
      toast({
        title: "답변 내용 필요",
        description: "답변 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (uploadedImages.length > 5) {
      toast({
        title: "이미지 개수 초과",
        description: "이미지는 최대 5개까지 첨부할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    // FormData 생성
    const formData = new FormData()
    formData.append("answerContent", answerContent)
    formData.append("questionId", params.id as string)
    uploadedImages.forEach(file => formData.append("images", file))

    try {
      const accessToken = localStorage.getItem("auth_token");
      await fetch("http://localhost:3000/api/v1/answers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Content-Type은 명시하지 않음 (FormData는 브라우저가 자동 세팅)
        },
        body: formData,
      });

      toast({
        title: "답변 등록 성공",
        description:
          uploadedImages.length > 0
            ? `답변과 ${uploadedImages.length}개의 이미지가 성공적으로 등록되었습니다.`
            : "답변이 성공적으로 등록되었습니다.",
      })

      // 입력 초기화
      setAnswerContent("")
      setUploadedImages([])

      // 답변 목록 새로고침
      fetchQuestion()
    } catch (error: any) {
      toast({
        title: "답변 등록 실패",
        description: error?.message || "답변 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 답변 좋아요 토글 함수
  const handleLikeAnswer = async (answerId: number) => {
    if (answerLikeLoading[answerId]) return;
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
      toast({ title: "로그인이 필요합니다.", variant: "destructive" });
      return;
    }
    setAnswerLikeLoading(prev => ({ ...prev, [answerId]: true }));

    try {
      const isCurrentlyLiked = likedAnswers.includes(answerId);
      let response;
      if (isCurrentlyLiked) {
        response = await fetch(`http://localhost:3000/api/v1/answers/like/${answerId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } else {
        response = await fetch(`http://localhost:3000/api/v1/answers/like/${answerId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 좋아요 상태(localStorage)는 기존대로 관리
      let newLikedAnswers;
      if (isCurrentlyLiked) {
        newLikedAnswers = likedAnswers.filter(id => id !== answerId);
      } else {
        newLikedAnswers = [...likedAnswers, answerId];
      }
      setLikedAnswers(newLikedAnswers);
      localStorage.setItem(`likedAnswers_${params.id}`, JSON.stringify(newLikedAnswers));

      // 서버에서 최신 likeCount를 받아오기 위해 fetchQuestion 호출
      await fetchQuestion();

    } catch (error: any) {
      toast({
        title: "좋아요 처리 실패",
        description: error?.message || "좋아요 처리 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setAnswerLikeLoading(prev => ({ ...prev, [answerId]: false }));
    }
  };

  // 답변에 댓글 추가 함수
  const handleAddComment = async (answerId: number) => {
    if (!answerComments[answerId]?.trim()) {
      toast({
        title: "댓글 내용 필요",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    try {
      const authToken = localStorage.getItem("auth_token");
      const res = await fetch("http://localhost:3000/api/v1/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ answerId, commentContent: answerComments[answerId] }),
      });
      if (!res.ok) {
        throw new Error("댓글 등록 실패");
      }
      // 새 댓글 데이터 생성 (실제 서비스에서는 서버에서 내려주는 댓글 객체를 사용해야 함)
      const newComment = {
        id: Date.now(),
        content: answerComments[answerId],
        member: {
          nickname: user?.email?.split("@")[0] || "사용자",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        createdAt: new Date().toISOString(),
      };
      setAnswerCommentsData({
        ...answerCommentsData,
        [answerId]: [...(answerCommentsData[answerId] || []), newComment],
      });
      setAnswerComments({
        ...answerComments,
        [answerId]: "",
      });
      toast({
        title: "댓글 등록 완료",
        description: "답변에 댓글이 등록되었습니다.",
      });
    } catch (e) {
      toast({
        title: "댓글 등록 실패",
        description: "댓글 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  }

  // 댓글 수정 요청
  const handleEditComment = async (commentId: number, answerId: number) => {
    try {
      const authToken = localStorage.getItem("auth_token");
      const res = await fetch(`http://localhost:3000/api/v1/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ commentContent: editingCommentContent, answerId }),
      });
      if (!res.ok) throw new Error("댓글 수정 실패");
      // 프론트 상태 갱신
      setAnswerCommentsData(prev => ({
        ...prev,
        [answerId]: prev[answerId].map((c: any) =>
          c.commentId === commentId ? { ...c, content: editingCommentContent } : c
        )
      }));
      setEditingCommentId(null);
      setEditingCommentContent("");
      toast({ title: "댓글 수정 완료", description: "댓글이 수정되었습니다." });
    } catch (e) {
      toast({ title: "댓글 수정 실패", description: "댓글 수정 중 오류가 발생했습니다.", variant: "destructive" });
    }
  }

  // 댓글 삭제 함수 추가
  const handleDeleteComment = async (commentId: number, answerId: number) => {
    try {
      const authToken = localStorage.getItem("auth_token");
      const res = await fetch(`http://localhost:3000/api/v1/comments/${commentId}?answerId=${answerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!res.ok) throw new Error("댓글 삭제 실패");
      setAnswerCommentsData(prev => ({
        ...prev,
        [answerId]: (prev[answerId] || []).filter((c: any) => String(c.commentId) !== String(commentId))
      }));
      await fetchQuestion();
      toast({ title: "댓글 삭제 완료", description: "댓글이 삭제되었습니다." });
    } catch (e) {
      toast({ title: "댓글 삭제 실패", description: "댓글 삭제 중 오류가 발생했습니다.", variant: "destructive" });
    }
  };

  if (loading) return <div className="text-center py-20">질문을 불러오는 중...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/questions")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          질문 목록으로 돌아가기
        </Button>

        {/* 질문 카드 */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {question?.techStacks.map((tag: any, idx: number) => (
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
                  <span>{question?.createdAt ? new Date(question.createdAt).toISOString().slice(0, 10) : ''}</span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                {/* 연필(수정) 버튼 항상 노출 */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => router.push(`/questions/${params.id}/edit`)}
                  aria-label="질문 수정하기"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  aria-label="질문 삭제하기"
                  onClick={async () => {
                    if (window.confirm("정말로 이 질문을 삭제하시겠습니까?")) {
                      try {
                        const res = await api.delete(`/questions/${params.id}`)
                        // 백엔드 응답에서 questionId를 받아 토스트에 표시
                        toast({ title: "질문 삭제 완료", description: `질문이 삭제되었습니다. (ID: ${res?.result ?? params.id})` })
                        router.push("/questions")
                      } catch (e: any) {
                        toast({ title: "질문 삭제 실패", description: e?.message || "삭제 중 오류가 발생했습니다.", variant: "destructive" })
                      }
                    }
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
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

            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{question?.content}</p>

              {/* 질문 이미지 */}
              {question.mediaUrl && question.mediaUrl.length > 0 && (
                <div className="mt-4 space-y-4">
                  {question.mediaUrl.map((url: string, idx: number) => (
                    <div key={url || idx} className="rounded-md overflow-hidden">
                      <AuthImage imageUrl={url} alt={`질문 이미지 ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 답변 수 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{answers.length}개의 답변</h2>
        </div>

        {/* 답변 목록 */}
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
                    <AnswerImagesWithAuth images={answer.mediaUrls} />
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
                    onClick={() => router.push(`/answers/${answer.answerId}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (window.confirm('정말로 이 답변을 삭제하시겠습니까?')) {
                        try {
                          await api.delete(`/answers/${answer.answerId}`)
                          toast({
                            title: "답변 삭제 성공",
                            description: "답변이 성공적으로 삭제되었습니다.",
                          })
                          fetchQuestion()
                        } catch (error: any) {
                          toast({
                            title: "답변 삭제 실패",
                            description: error?.message || "답변 삭제 중 오류가 발생했습니다.",
                            variant: "destructive"
                          })
                        }
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

                {(answerCommentsData[answer.answerId]?.length > 0 || showCommentInput === answer.answerId) && (
                  <div className="w-full border-t pt-4 mt-2">
                    <h4 className="text-sm font-medium mb-3">댓글</h4>

                    {answerCommentsData[answer.answerId]?.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {answerCommentsData[answer.answerId].map((comment: any, idx: number) => (
                          <div key={comment.commentId ? String(comment.commentId) : idx} className="flex gap-2 items-center">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={"/placeholder.svg"}
                                alt={comment.memberId ? `User ${comment.memberId}` : "알 수 없음"}
                              />
                              <AvatarFallback>{comment.memberId ? String(comment.memberId)[0] : "?"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{comment.memberId ? `User ${comment.memberId}` : "알 수 없음"}</span>
                              </div>
                              {editingCommentId === comment.commentId ? (
                                <div className="flex gap-2 items-center mt-1">
                                  <Textarea
                                    value={editingCommentContent}
                                    onChange={e => setEditingCommentContent(e.target.value)}
                                    className="text-sm min-h-[32px] resize-none"
                                  />
                                  <Button size="sm" onClick={() => handleEditComment(comment.commentId, answer.answerId)}>저장</Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingCommentId(null)}>취소</Button>
                                </div>
                              ) : (
                                <p className="text-sm">{comment.content}</p>
                              )}
                            </div>
                            {/* 댓글 수정/삭제 버튼 */}
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" aria-label="댓글 수정" onClick={() => {
                                setEditingCommentId(comment.commentId);
                                setEditingCommentContent(comment.content);
                              }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" aria-label="댓글 삭제" onClick={() => {
                                if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
                                  handleDeleteComment(comment.commentId, answer.answerId);
                                }
                              }}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {showCommentInput === answer.answerId && (
                      <div className="flex gap-2">
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
                        <Button size="sm" className="self-end" onClick={() => handleAddComment(answer.answerId)}>
                          등록
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* 답변 작성 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>답변 작성하기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="답변을 작성해주세요..."
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              rows={6}
            />

            <div className="space-y-2">
              <Label htmlFor="answer-images">이미지 첨부</Label>
              <FileUpload
                onFilesSelect={handleImageUpload}
                accept="image/*"
                maxSize={5}
                multiple={true}
                buttonText="이미지 선택"
              />

              {uploadedImages.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="uploaded-image-list">첨부된 이미지 ({uploadedImages.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image) || "/placeholder.svg"}
                          alt={`Uploaded ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <p className="text-xs truncate mt-1">{image.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSubmitAnswer}>답변 등록하기</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function Label({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  )
}

// 답변 이미지용 컴포넌트
function AnswerImagesWithAuth({ images }: { images: string[] }) {
  return (
    <div className="mt-4 space-y-4">
      {images.map((url, idx) => {
        if (url.startsWith('http')) {
          // S3 URL이면 바로 렌더링
          return (
            <div key={url || idx} className="rounded-md overflow-hidden">
              <img src={url} alt={`답변 이미지 ${idx + 1}`} style={{ maxWidth: '100%' }} />
            </div>
          );
        }
        // /media/파일명.확장자 → 파일명.확장자 추출
        const fileName = url.replace("/media/", "");
        return (
          <div key={url || idx} className="rounded-md overflow-hidden">
            <AuthImage imageUrl={`/answer/media/${fileName}`} alt={`답변 이미지 ${idx + 1}`} />
          </div>
        );
      })}
    </div>
  );
}