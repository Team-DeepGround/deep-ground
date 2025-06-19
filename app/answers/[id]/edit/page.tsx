"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import FileUpload from "@/components/file-upload"
import { api } from "@/lib/api-client"

export default function EditAnswerPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [content, setContent] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnswer() {
      setLoading(true)
      try {
        const res = await api.get(`/answers/${params.id}`)
        const answer = res.result
        setContent(answer.answerContent || "")
        setExistingImages(answer.mediaUrls || [])
      } catch (e) {
        toast({ title: "답변 불러오기 실패", description: "답변 정보를 불러올 수 없습니다.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchAnswer()
  }, [params.id])

  const handleImageUpload = (file: File) => {
    setUploadedImages((prev) => [...prev, file])
    toast({ title: "이미지 업로드", description: "이미지가 추가되었습니다." })
  }

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (id: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) {
      toast({ title: "필수 정보 누락", description: "답변 내용을 입력해주세요.", variant: "destructive" })
      return
    }
    if (uploadedImages.length > 5) {
      toast({ title: "이미지 개수 초과", description: "이미지는 최대 5개까지 첨부할 수 있습니다.", variant: "destructive" })
      return
    }

    const formData = new FormData()
    formData.append("answerContent", content)
    uploadedImages.forEach(file => formData.append("images", file))
    formData.append("remainImageIds", JSON.stringify(existingImages.map(img => img.id)))

    try {
      await api.put(`/answers/${params.id}`, formData)
      toast({ title: "답변 수정 성공", description: "답변이 성공적으로 수정되었습니다." })
      router.back()
    } catch (error: any) {
      toast({ title: "답변 수정 실패", description: error?.message || "답변 수정 중 오류가 발생했습니다.", variant: "destructive" })
    }
  }

  if (loading) return <div className="text-center py-20">답변 정보를 불러오는 중...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">답변 수정하기</h1>
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>답변 수정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="답변 내용을 입력하세요"
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>이미지 첨부</Label>
                <FileUpload
                  onFileSelect={handleImageUpload}
                  accept="image/*"
                  maxSize={5}
                  multiple={true}
                  buttonText="이미지 선택"
                />

                {existingImages.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>기존 이미지</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {existingImages.map((image, index) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`Existing ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeExistingImage(image.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>새로 첨부한 이미지 ({uploadedImages.length})</Label>
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
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit">답변 수정하기</Button>
          </div>
        </form>
      </div>
    </div>
  )
} 