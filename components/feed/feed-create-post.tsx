"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client"
import { createFeed } from "@/lib/api/feed"

interface FeedCreatePostProps {
  onPostCreated: () => void
}

export function FeedCreatePost({ onPostCreated }: FeedCreatePostProps) {
  const { toast } = useToast()
  const [user, setUser] = useState<{
    nickname: string
    email: string
    profileImage: string
  } | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostImages, setNewPostImages] = useState<File[]>([])

  const loadUser = useCallback(async () => {
    setUserLoading(true)
    setUserError(null)
    try {
      const res = await api.get("/members/profile/me")
      if (res && res.result) {
        setUser({
          nickname: res.result.nickname || "",
          email: res.result.email || "",
          profileImage: res.result.profileImage || "",
        })
      } else {
        setUserError("유저 정보를 불러오지 못했습니다.")
      }
    } catch (e) {
      setUserError("유저 정보를 불러오지 못했습니다.")
    } finally {
      setUserLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  // 피드 생성
  const handleNewPost = async () => {
    if (!newPostContent.trim() && newPostImages.length === 0) {
      toast({ title: "게시물 내용 필요", description: "게시물 내용을 입력하거나 이미지를 첨부해주세요.", variant: "destructive" })
      return
    }
    const formData = new FormData()
    formData.append("content", newPostContent)
    if (newPostImages.length > 0) {
      newPostImages.forEach((file) => formData.append("images", file))
    }
    await createFeed(formData)
    toast({ title: "게시물 등록", description: "게시물이 등록되었습니다." })
    setNewPostContent("")
    setNewPostImages([])
    onPostCreated()
  }

  // 새 게시물 이미지 선택
  const handleNewPostImageChange = (files: FileList | null) => {
    setNewPostImages(files ? Array.from(files) : [])
  }

  return (
    <Card className="mb-8">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {user?.profileImage ? (
              <AvatarImage src={user.profileImage} alt={user.nickname || user.email} />
            ) : (
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt={user?.email || "사용자"} />
            )}
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div>
            {userLoading ? (
              <span className="text-muted-foreground text-sm">로딩 중...</span>
            ) : userError ? (
              <span className="text-destructive text-sm">{userError}</span>
            ) : (
              <h3 className="font-medium">{user?.email || "게스트"}</h3>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Textarea
          placeholder="무슨 생각을 하고 계신가요?"
          rows={3}
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          className="resize-none"
        />
        {/* 이미지 미리보기 */}
        {newPostImages.length > 0 && (
          <div className="flex gap-2 mt-3">
            {newPostImages.map((file, idx) => (
              <div key={idx} className="relative">
                <img src={URL.createObjectURL(file)} alt="첨부 이미지" className="h-20 w-20 object-cover rounded" />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-white/80 rounded-full p-0.5"
                  onClick={() => setNewPostImages((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            id="new-post-image-input"
            style={{ display: "none" }}
            onChange={(e) => handleNewPostImageChange(e.target.files)}
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => document.getElementById('new-post-image-input')?.click()}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            이미지
          </Button>
        </div>
        <Button size="sm" onClick={handleNewPost}>
          게시하기
        </Button>
      </CardFooter>
    </Card>
  )
} 