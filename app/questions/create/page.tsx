"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import FileUpload from "@/components/file-upload"
import { Checkbox } from "@/components/ui/checkbox"
import { AVAILABLE_TECH_TAGS } from "@/lib/constants/tech-tags"

export default function CreateQuestionPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const [tags, setTags] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<File[]>([])

  // 미리 정의된 태그 목록 추가
  const predefinedTags = AVAILABLE_TECH_TAGS

  const handleTagToggle = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag))
    } else {
      setTags([...tags, tag])
    }
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 필수 필드 검증
    if (!title || !content) {
      toast({
        title: "필수 정보 누락",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 태그 검증
    if (tags.length === 0) {
      toast({
        title: "태그 누락",
        description: "최소 하나 이상의 태그를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (uploadedImages.length > 10) {
      toast({
        title: "이미지 개수 초과",
        description: "이미지는 최대 10개까지 첨부할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    // 질문 생성 성공 (실제로는 API 호출)
    toast({
      title: "질문 등록 성공",
      description:
        uploadedImages.length > 0
          ? `질문과 ${uploadedImages.length}개의 이미지가 성공적으로 등록되었습니다.`
          : "질문이 성공적으로 등록되었습니다.",
    })

    // 질문 목록 페이지로 이동
    router.push("/questions")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">질문하기</h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>질문 작성</CardTitle>
              <CardDescription>개발 관련 질문을 작성해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="질문 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  placeholder="질문 내용을 상세히 작성해주세요"
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">이미지 첨부</Label>
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

              <div className="space-y-2">
                <Label htmlFor="tags">관련 기술 태그</Label>
                <div className="border rounded-md p-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleTagToggle(tag)} />
                      </Badge>
                    ))}
                  </div>
                  <div className="border-t pt-3 mt-2">
                    <p className="text-sm text-muted-foreground mb-2">기술 태그 선택 (다중 선택 가능)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {predefinedTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={tags.includes(tag)}
                            onCheckedChange={() => handleTagToggle(tag)}
                          />
                          <label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit">질문 등록하기</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
