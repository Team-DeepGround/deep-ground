"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import FileUpload from "@/components/file-upload"

interface ProfileFormProps {
  profile: {
    nickname: string
    email: string
    bio: string
    techStack: string[]
    links: {
      github?: string
      linkedin?: string
      website?: string
      twitter?: string
    }
    location?: string
    jobTitle?: string
    company?: string
    education?: string
  }
  onSubmit: (updatedProfile: any) => void
  onCancel: () => void
}

export default function ProfileForm({ profile, onSubmit, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({ ...profile })
  const [newTech, setNewTech] = useState("")

  const handleAddTech = () => {
    if (newTech.trim() && !formData.techStack.includes(newTech.trim())) {
      setFormData({
        ...formData,
        techStack: [...formData.techStack, newTech.trim()],
      })
      setNewTech("")
    }
  }

  const handleRemoveTech = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((item) => item !== tech),
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      links: {
        ...formData.links,
        [name]: value,
      },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleProfileImageUpload = (file: File) => {
    // 실제 구현에서는 파일을 서버에 업로드하고 URL을 받아옴
    console.log("Uploading profile image:", file.name)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="profileImage">프로필 이미지</Label>
        <div className="flex items-center gap-4">
          <FileUpload
            onFileSelect={handleProfileImageUpload}
            accept="image/*"
            maxSize={5} // 5MB
          />
          <p className="text-sm text-muted-foreground">최대 5MB의 이미지 파일을 업로드하세요.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">닉네임</Label>
        <Input id="nickname" name="nickname" value={formData.nickname} onChange={handleInputChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">자기소개</Label>
        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jobTitle">직업</Label>
          <Input id="jobTitle" name="jobTitle" value={formData.jobTitle || ""} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">회사/소속</Label>
          <Input id="company" name="company" value={formData.company || ""} onChange={handleInputChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">위치</Label>
          <Input id="location" name="location" value={formData.location || ""} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="education">학력</Label>
          <Input id="education" name="education" value={formData.education || ""} onChange={handleInputChange} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack">기술 스택</Label>
        <div className="flex gap-2">
          <Input
            id="techStack"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            placeholder="기술 스택 입력 후 추가"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddTech()
              }
            }}
          />
          <Button type="button" onClick={handleAddTech}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.techStack.map((tech) => (
            <Badge key={tech} variant="secondary" className="flex items-center gap-1">
              {tech}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTech(tech)} />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label>소셜 링크</Label>

        <div className="space-y-2">
          <Label htmlFor="github" className="text-sm">
            GitHub
          </Label>
          <Input
            id="github"
            name="github"
            value={formData.links.github || ""}
            onChange={handleLinkChange}
            placeholder="https://github.com/username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin" className="text-sm">
            LinkedIn
          </Label>
          <Input
            id="linkedin"
            name="linkedin"
            value={formData.links.linkedin || ""}
            onChange={handleLinkChange}
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm">
            웹사이트
          </Label>
          <Input
            id="website"
            name="website"
            value={formData.links.website || ""}
            onChange={handleLinkChange}
            placeholder="https://mywebsite.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter" className="text-sm">
            Twitter
          </Label>
          <Input
            id="twitter"
            name="twitter"
            value={formData.links.twitter || ""}
            onChange={handleLinkChange}
            placeholder="https://twitter.com/username"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">프로필 저장</Button>
      </div>
    </form>
  )
}
