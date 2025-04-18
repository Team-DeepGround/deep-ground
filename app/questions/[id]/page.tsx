"use client"

// Create a new file for the question detail page with answer functionality and image upload

// First, let's create the question detail page with image support
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { ThumbsUp, CheckCircle2, Calendar, ArrowLeft, X } from "lucide-react"
import FileUpload from "@/components/file-upload"

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

  // 임시 질문 데이터
  const question = {
    id: params.id,
    title: "Spring Security와 JWT 인증 구현 방법",
    content: "Spring Boot 프로젝트에서 JWT를 이용한 인증 시스템을 구현하려고 합니다. 좋은 예제나 방법이 있을까요?",
    tags: ["Spring", "Security", "JWT", "Backend"],
    author: {
      name: "박스프링",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-05-09T14:20:00Z",
    commentCount: 5,
    likeCount: 7,
    isResolved: true,
    images: [
      {
        id: 1,
        url: "/placeholder.svg?height=400&width=600",
        alt: "JWT 인증 흐름도",
      },
    ],
  }

  // 임시 답변 데이터
  const answers = [
    {
      id: 1,
      content: "Spring Security와 JWT를 연동하는 가장 좋은 방법은 다음과 같습니다...",
      author: {
        name: "김시큐리티",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      createdAt: "2023-05-09T15:30:00Z",
      likeCount: 12,
      isAccepted: true,
      images: [
        {
          id: 1,
          url: "/placeholder.svg?height=300&width=500",
          alt: "코드 예시",
        },
      ],
    },
    {
      id: 2,
      content: "저는 다음과 같은 방식으로 구현했습니다. 참고하세요.",
      author: {
        name: "이자바",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      createdAt: "2023-05-09T16:45:00Z",
      likeCount: 5,
      isAccepted: false,
      images: [],
    },
  ]

  const handleImageUpload = (file: File) => {
    setUploadedImages((prev) => [...prev, file])

    toast({
      title: "이미지 업로드",
      description: "이미지가 추가되었습니다.",
    })
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmitAnswer = () => {
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

    // 답변 등록 로직 (실제로는 API 호출)
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
  }

  // handleLikeAnswer 함수 추가 (다른 핸들러 함수들 근처에)
  const handleLikeAnswer = (answerId: number) => {
    if (likedAnswers.includes(answerId)) {
      setLikedAnswers(likedAnswers.filter((id) => id !== answerId))
      toast({
        title: "좋아요 취소",
        description: "답변에 대한 좋아요를 취소했습니다.",
      })
    } else {
      setLikedAnswers([...likedAnswers, answerId])
      toast({
        title: "좋아요",
        description: "답변에 좋아요를 표시했습니다.",
      })
    }
  }

  // 답변에 댓글 추가 함수
  const handleAddComment = (answerId: number) => {
    if (!answerComments[answerId]?.trim()) {
      toast({
        title: "댓글 내용 필요",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 새 댓글 데이터 생성
    const newComment = {
      id: Date.now(),
      content: answerComments[answerId],
      author: {
        name: user?.email?.split("@")[0] || "사용자",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      createdAt: new Date().toISOString(),
    }

    // 기존 댓글 데이터에 새 댓글 추가
    setAnswerCommentsData({
      ...answerCommentsData,
      [answerId]: [...(answerCommentsData[answerId] || []), newComment],
    })

    // 입력 초기화
    setAnswerComments({
      ...answerComments,
      [answerId]: "",
    })

    toast({
      title: "댓글 등록 완료",
      description: "답변에 댓글이 등록되었습니다.",
    })
  }

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
                  {question.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                  {question.isResolved && (
                    <Badge variant="success" className="ml-2">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      해결됨
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{question.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{question.likeCount}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={question.author.avatar || "/placeholder.svg"} alt={question.author.name} />
                <AvatarFallback>{question.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{question.author.name}</div>
                <div className="text-xs text-muted-foreground">작성자</div>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{question.content}</p>

              {/* 질문 이미지 */}
              {question.images && question.images.length > 0 && (
                <div className="mt-4 space-y-4">
                  {question.images.map((image) => (
                    <div key={image.id} className="rounded-md overflow-hidden">
                      <img src={image.url || "/placeholder.svg"} alt={image.alt} className="max-w-full h-auto" />
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
          <Select defaultValue="votes">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="votes">추천순</SelectItem>
              <SelectItem value="newest">최신순</SelectItem>
              <SelectItem value="oldest">오래된순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 답변 목록 */}
        <div className="space-y-6 mb-8">
          {answers.map((answer) => (
            <Card key={answer.id} className={answer.isAccepted ? "border-green-500" : ""}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={answer.author.avatar || "/placeholder.svg"} alt={answer.author.name} />
                      <AvatarFallback>{answer.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{answer.author.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(answer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {answer.isAccepted && (
                      <Badge variant="success">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        채택된 답변
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex items-center gap-1 ${likedAnswers.includes(answer.id) ? "bg-primary/10 text-primary" : ""}`}
                      onClick={() => handleLikeAnswer(answer.id)}
                    >
                      <ThumbsUp className={`h-4 w-4 ${likedAnswers.includes(answer.id) ? "fill-primary" : ""}`} />
                      <span>{likedAnswers.includes(answer.id) ? answer.likeCount + 1 : answer.likeCount}</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{answer.content}</p>

                  {/* 답변 이미지 */}
                  {answer.images && answer.images.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {answer.images.map((image) => (
                        <div key={image.id} className="rounded-md overflow-hidden">
                          <img src={image.url || "/placeholder.svg"} alt={image.alt} className="max-w-full h-auto" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4 pt-0">
                <div className="flex justify-end gap-2 w-full">
                  {!answer.isAccepted && question.isResolved === false && (
                    <Button variant="outline" size="sm">
                      답변 채택하기
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCommentInput(showCommentInput === answer.id ? null : answer.id)}
                  >
                    댓글 달기
                  </Button>
                </div>

                {/* 댓글 목록 */}
                {(answerCommentsData[answer.id]?.length > 0 || showCommentInput === answer.id) && (
                  <div className="w-full border-t pt-4 mt-2">
                    <h4 className="text-sm font-medium mb-3">댓글</h4>

                    {/* 기존 댓글 표시 */}
                    {answerCommentsData[answer.id]?.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {answerCommentsData[answer.id].map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={comment.author.avatar || "/placeholder.svg"}
                                alt={comment.author.name}
                              />
                              <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium">{comment.author.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 댓글 입력 폼 */}
                    {showCommentInput === answer.id && (
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="댓글을 입력하세요..."
                          value={answerComments[answer.id] || ""}
                          onChange={(e) =>
                            setAnswerComments({
                              ...answerComments,
                              [answer.id]: e.target.value,
                            })
                          }
                          className="text-sm min-h-[60px] resize-none"
                        />
                        <Button size="sm" className="self-end" onClick={() => handleAddComment(answer.id)}>
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
                onFileSelect={handleImageUpload}
                accept="image/*"
                maxSize={5} // 5MB
                multiple={true}
                buttonText="이미지 선택"
              />

              {uploadedImages.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>첨부된 이미지 ({uploadedImages.length})</Label>
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

function Label({ htmlFor, children, className = "" }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  )
}

function Select({ children, defaultValue }) {
  return (
    <div className="relative">
      <select
        defaultValue={defaultValue}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
      >
        {children}
      </select>
    </div>
  )
}

function SelectTrigger({ className = "", children }) {
  return <div className={`flex items-center ${className}`}>{children}</div>
}

function SelectValue({ placeholder }) {
  return <span>{placeholder}</span>
}

function SelectContent({ children }) {
  return <div className="absolute mt-1 w-full rounded-md border bg-background shadow-lg">{children}</div>
}

function SelectItem({ value, children }) {
  return (
    <div className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent">
      {children}
    </div>
  )
}
