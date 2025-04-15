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

export default function CreateQuestionPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
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

    // 질문 생성 성공 (실제로는 API 호출)
    toast({
      title: "질문 등록 성공",
      description: "질문이 성공적으로 등록되었습니다.",
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
                <Label htmlFor="tags">관련 기술 태그</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="태그 입력 후 엔터"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    추가
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                    </Badge>
                  ))}
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
