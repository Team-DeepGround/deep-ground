"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import FileUpload from "@/components/file-upload"
import TechStackSelector from "@/components/TechStackSelector"
import { getTechStacks, TechStack } from "@/lib/api/techStack"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProfileFormProps {
  initialProfile?: {
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
    liveIn?: string
    jobTitle?: string
    company?: string
    education?: string
  }
  onSubmit: (profileDto: any, profileImage: File | null) => void
  onCancel?: () => void
  loading?: boolean
}

export default function ProfileForm({
  initialProfile,
  onSubmit,
  onCancel,
  loading,
}: ProfileFormProps) {
  const [availableTags, setAvailableTags] = useState<TechStack[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [isCheckingNickname, setIsCheckingNickname] = useState(false)
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    getTechStacks().then(setAvailableTags)
  }, [])

  const [formData, setFormData] = useState({
    nickname: initialProfile?.nickname || "",
    email: initialProfile?.email || "",
    bio: initialProfile?.bio || "",
    techStack: initialProfile?.techStack || [],
    links: initialProfile?.links || {},
    liveIn: initialProfile?.liveIn || "",
    jobTitle: initialProfile?.jobTitle || "",
    company: initialProfile?.company || "",
    education: initialProfile?.education || "",
  })

  const handleProfileImageUpload = (file: File) => {
    setProfileImage(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      links: { ...formData.links, [name]: value },
    })
  }

  const handleToggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tag)
        ? prev.techStack.filter((t) => t !== tag)
        : [...prev.techStack, tag],
    }))
  }

  const checkNicknameAvailability = async () => {
    if (!formData.nickname || formData.nickname.length < 2) {
      toast({
        title: "유효하지 않은 닉네임",
        description: "닉네임은 2자 이상이어야 합니다.",
        variant: "destructive",
      })
      return
    }
    setIsCheckingNickname(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/${process.env.NEXT_PUBLIC_API_VERSION}/auth/check-nickname?nickname=${encodeURIComponent(formData.nickname)}`
      )
      if (res.ok) {
        setIsNicknameAvailable(true)
        toast({
          title: "사용 가능한 닉네임",
          description: "입력하신 닉네임은 사용 가능합니다.",
        })
      } else {
        setIsNicknameAvailable(false)
        toast({
          title: "이미 사용 중인 닉네임",
          description: "다른 닉네임을 입력해주세요.",
          variant: "destructive",
        })
      }
    } catch {
      setIsNicknameAvailable(false)
      toast({
        title: "오류",
        description: "닉네임 중복 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingNickname(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const dto = {
      nickname: formData.nickname,
      introduction: formData.bio,
      job: formData.jobTitle,
      company: formData.company,
      liveIn: formData.liveIn,
      education: formData.education,
      techStack: formData.techStack,
      githubUrl: formData.links.github,
      linkedInUrl: formData.links.linkedin,
      websiteUrl: formData.links.website,
      twitterUrl: formData.links.twitter,
    }

    console.log("🔥 전송할 프로필 데이터:", dto)
    console.log("🖼️ 전송할 프로필 이미지:", profileImage)

    onSubmit(dto, profileImage)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="profileImage">프로필 이미지</Label>
        <div className="flex items-center gap-4">
          <FileUpload onFileSelect={handleProfileImageUpload} accept="image/*" maxSize={5} />
          <p className="text-sm text-muted-foreground">최대 5MB의 이미지 파일을 업로드하세요.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">닉네임</Label>
        <div className="flex gap-2">
          <Input
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={(e) => {
              setFormData({ ...formData, nickname: e.target.value })
              setIsNicknameAvailable(null)
            }}
            required
            className={
              isNicknameAvailable === true
                ? "border-green-500 focus-visible:ring-green-500"
                : isNicknameAvailable === false
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
            }
          />
          <Button
            type="button"
            variant="outline"
            onClick={checkNicknameAvailability}
            disabled={isCheckingNickname || !formData.nickname}
          >
            {isCheckingNickname ? <Loader2 className="h-4 w-4 animate-spin" /> : "중복 확인"}
          </Button>
        </div>
        {isNicknameAvailable === true && <p className="text-xs text-green-500">사용 가능한 닉네임입니다.</p>}
        {isNicknameAvailable === false && <p className="text-xs text-red-500">이미 사용 중인 닉네임입니다.</p>}
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
          <Label htmlFor="liveIn">사는 지역</Label>
          <Input id="liveIn" name="liveIn" value={formData.liveIn || ""} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="education">학력</Label>
          <Input id="education" name="education" value={formData.education || ""} onChange={handleInputChange} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack">기술 스택</Label>
        <TechStackSelector
          availableTags={availableTags}
          selectedTags={formData.techStack}
          onToggle={handleToggleTag}
        />
      </div>

      <div className="space-y-4">
        <Label>소셜 링크</Label>
        <div className="space-y-2">
          <Label htmlFor="github" className="text-sm">GitHub</Label>
          <Input id="github" name="github" value={formData.links.github || ""} onChange={handleLinkChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
          <Input id="linkedin" name="linkedin" value={formData.links.linkedin || ""} onChange={handleLinkChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm">웹사이트</Label>
          <Input id="website" name="website" value={formData.links.website || ""} onChange={handleLinkChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter" className="text-sm">Twitter</Label>
          <Input id="twitter" name="twitter" value={formData.links.twitter || ""} onChange={handleLinkChange} />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "저장 중..." : "프로필 저장"}
        </Button>
      </div>
    </form>
  )
}
