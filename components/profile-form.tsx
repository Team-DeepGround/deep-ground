"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import FileUpload from "@/components/file-upload"
import TechStackSelector from "@/components/TechStackSelector"
import { getTechStacks, TechStack } from "@/lib/api/techStack"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client"
import { set } from "date-fns"

const serverToFormField: Record<string, string> = {
  nickname: "nickname",
  introduction: "bio",
  job: "jobTitle",
  company: "company",
  liveIn: "liveIn",
  education: "education",
  githubUrl: "github",
  linkedInUrl: "linkedin",
  websiteUrl: "website",
  twitterUrl: "twitter",
};

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
    profileImage?: string
  }
  onSubmit: (profileDto: any, profileImage: File | null) => Promise<any>
  onCancel?: () => void
  loading?: boolean

  /** 생성/수정 겸용 옵션들 */
  mode?: "create" | "edit"
  nicknameVisible?: boolean
  nicknameRequired?: boolean
  nicknameCheckDup?: boolean
}

export default function ProfileForm({
  initialProfile,
  onSubmit,
  onCancel,
  loading,
  mode = "edit",
  nicknameVisible = true,
  nicknameRequired = true,
  nicknameCheckDup = true,
}: ProfileFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableTags, setAvailableTags] = useState<TechStack[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [isCheckingNickname, setIsCheckingNickname] = useState(false)
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    getTechStacks().then(setAvailableTags)
  }, [])

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialProfile?.profileImage ?? null
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePickImage = () => {
    fileInputRef.current?.click()
  }

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

  useEffect(() => {
    if (!initialProfile) return
    setFormData({
      nickname: initialProfile.nickname || "",
      email: initialProfile.email || "",
      bio: initialProfile.bio || "",
      techStack: initialProfile.techStack || [],
      links: initialProfile.links || {},
      liveIn: initialProfile.liveIn || "",
      jobTitle: initialProfile.jobTitle || "",
      company: initialProfile.company || "",
      education: initialProfile.education || "",
    })
  }, [initialProfile])

  useEffect(() => {
    setPreviewUrl(initialProfile?.profileImage ?? null)
  }, [initialProfile?.profileImage])

  const handleProfileImageUpload = (file: File) => {
    setProfileImage(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 용량 초과",
        description: "최대 5MB 이미지만 업로드할 수 있어요.",
        variant: "destructive",
      })
      e.currentTarget.value = ""
      return
    }

    setProfileImage(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
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
      const res = await api.get(`/auth/check-nickname`, { params: { nickname: encodeURIComponent(formData.nickname) } })
      if (res) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const clientErrors = validateClient(formData);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      const firstMsg = Object.values(clientErrors)[0];
      toast({
        title: "입력값을 확인해주세요",
        description: firstMsg,
        variant: "destructive",
      });
      return;
    }

    const dto: any = {
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
    };

    // 닉네임을 쓰는 경우에만 DTO에 포함
    if (nicknameVisible && formData.nickname?.trim()) {
      dto.nickname = formData.nickname.trim();
    }

    try {
      await onSubmit(dto, profileImage);
    } catch (err: any) {
      const data = err?.data ?? err;
      if (Array.isArray(data?.errors)) {
        const mapped: Record<string, string> = {};
        for (const fe of data.errors) {
          const formKey = serverToFormField[fe.field] ?? fe.field;
          mapped[formKey] = fe.reason || fe.defaultMessage || "유효하지 않은 값입니다.";
        }
        setErrors(mapped);
      }
    }
  };

  // 간단한 URL 검사 (필드가 비어있으면 통과, 값이 있으면 형식 검사)
  const isValidUrl = (v?: string) => {
    if (!v) return true;
    try { new URL(v); return true; } catch { return false; }
  };

  // 프론트 단 검증: 필수/길이/URL/스택 개수 등
  const validateClient = (fd: typeof formData) => {
    const es: Record<string, string> = {};

    // 닉네임은 옵션으로 검증
    if (nicknameVisible && nicknameRequired) {
      if (!fd.nickname?.trim()) es.nickname = "닉네임은 필수입니다.";
      else if (fd.nickname.trim().length < 2) es.nickname = "닉네임은 2자 이상이어야 합니다.";
    }

    if (!fd.bio?.trim()) es.bio = "자기소개는 필수입니다.";
    if (!fd.liveIn?.trim()) es.liveIn = "사는 지역은 필수입니다.";
    if (!fd.jobTitle?.trim()) es.jobTitle = "직업은 필수입니다.";
    if (!fd.company?.trim()) es.company = "회사는 필수입니다.";
    if (!fd.education?.trim()) es.education = "학력은 필수입니다.";

    // 선택이지만 형식 체크 (값이 있을 때만)
    if (!isValidUrl(fd.links.github))  es.github  = "올바른 URL 형식이 아닙니다.";
    if (!isValidUrl(fd.links.linkedin)) es.linkedin = "올바른 URL 형식이 아닙니다.";
    if (!isValidUrl(fd.links.website))  es.website  = "올바른 URL 형식이 아닙니다.";
    if (!isValidUrl(fd.links.twitter))  es.twitter  = "올바른 URL 형식이 아닙니다.";

    if (!Array.isArray(fd.techStack) || fd.techStack.length < 1) {
      es.techStack = "한 가지 이상의 기술 스택을 선택해주세요.";
    }

    return es;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* === 프로필 이미지 섹션 === */}
      <div className="space-y-3">
        <Label htmlFor="profileImage">프로필 이미지</Label>

        <div className="flex flex-col items-center gap-4">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="프로필 미리보기"
              className="h-40 w-40 rounded-full object-cover border shadow-sm"
            />
          ) : (
            <div className="h-40 w-40 rounded-full bg-muted flex items-center justify-center text-sm text-muted-foreground border shadow-sm">
              이미지 없음
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handlePickImage}>
              사진 올리기
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setProfileImage(null)
                setPreviewUrl(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
              disabled={!previewUrl}
            >
              이미지 제거
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            최대 5MB의 이미지 파일을 업로드하세요.
          </p>
        </div>
      </div>

      {/* === 닉네임 (옵션) === */}
      {nicknameVisible && (
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
                setErrors((prev) => ({ ...prev, nickname: "" }))
              }}
              required={nicknameRequired}
              className={
                (isNicknameAvailable === true ? "border-green-500 focus-visible:ring-green-500 " : "") +
                (isNicknameAvailable === false ? "border-red-500 focus-visible:ring-red-500 " : "") +
                (errors.nickname ? "border-red-500 focus-visible:ring-red-500 " : "")
              }
            />
            {nicknameCheckDup && (
              <Button
                type="button"
                variant="outline"
                onClick={checkNicknameAvailability}
                disabled={isCheckingNickname || !formData.nickname}
              >
                {isCheckingNickname ? <Loader2 className="h-4 w-4 animate-spin" /> : "중복 확인"}
              </Button>
            )}
          </div>
          {errors.nickname && <p className="text-xs text-red-500 mt-1">{errors.nickname}</p>}
          {nicknameCheckDup && isNicknameAvailable === true && (
            <p className="text-xs text-green-500">사용 가능한 닉네임입니다.</p>
          )}
          {nicknameCheckDup && isNicknameAvailable === false && (
            <p className="text-xs text-red-500">이미 사용 중인 닉네임입니다.</p>
          )}
        </div>
      )}

      {/* === 자기소개 === */}
      <div className="space-y-2">
        <Label htmlFor="bio">자기소개</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={(e) => {
            setFormData({ ...formData, bio: e.target.value })
            setErrors((prev) => ({ ...prev, bio: "" }))
          }}
          rows={4}
          className={errors.bio ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio}</p>}
      </div>

      {/* === 기본 정보 === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jobTitle">직업</Label>
          <Input
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle || ""}
            onChange={(e) => {
              setFormData({ ...formData, jobTitle: e.target.value })
              setErrors((prev) => ({ ...prev, jobTitle: "" }))
            }}
            className={errors.jobTitle ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.jobTitle && <p className="text-xs text-red-500 mt-1">{errors.jobTitle}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">회사/소속</Label>
          <Input
            id="company"
            name="company"
            value={formData.company || ""}
            onChange={(e) => {
              setFormData({ ...formData, company: e.target.value })
              setErrors((prev) => ({ ...prev, company: "" }))
            }}
            className={errors.company ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="liveIn">사는 지역</Label>
          <Input
            id="liveIn"
            name="liveIn"
            value={formData.liveIn || ""}
            onChange={(e) => {
              setFormData({ ...formData, liveIn: e.target.value })
              setErrors((prev) => ({ ...prev, liveIn: "" }))
            }}
            className={errors.liveIn ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.liveIn && <p className="text-xs text-red-500 mt-1">{errors.liveIn}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="education">학력</Label>
          <Input
            id="education"
            name="education"
            value={formData.education || ""}
            onChange={(e) => {
              setFormData({ ...formData, education: e.target.value })
              setErrors((prev) => ({ ...prev, education: "" }))
            }}
            className={errors.education ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.education && <p className="text-xs text-red-500 mt-1">{errors.education}</p>}
        </div>
      </div>

      {/* === 기술 스택 === */}
      <div className="space-y-2">
        <Label htmlFor="techStack">기술 스택</Label>
        <TechStackSelector
          availableTags={availableTags}
          selectedTags={formData.techStack}
          onToggle={handleToggleTag}
        />
      </div>

      {/* === 소셜 링크 === */}
      <div className="space-y-4">
        <Label>소셜 링크</Label>
        <div className="space-y-2">
          <Label htmlFor="github" className="text-sm">GitHub</Label>
          <Input
            id="github"
            name="github"
            value={formData.links.github || ""}
            onChange={(e) => {
              setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })
              setErrors((prev) => ({ ...prev, github: "" }))
            }}
            className={errors.github ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.github && <p className="text-xs text-red-500 mt-1">{errors.github}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
          <Input
            id="linkedin"
            name="linkedin"
            value={formData.links.linkedin || ""}
            onChange={(e) => {
              setFormData({ ...formData, links: { ...formData.links, linkedin: e.target.value } })
              setErrors((prev) => ({ ...prev, linkedin: "" }))
            }}
            className={errors.linkedin ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.linkedin && <p className="text-xs text-red-500 mt-1">{errors.linkedin}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm">웹사이트</Label>
          <Input
            id="website"
            name="website"
            value={formData.links.website || ""}
            onChange={(e) => {
              setFormData({ ...formData, links: { ...formData.links, website: e.target.value } })
              setErrors((prev) => ({ ...prev, website: "" }))
            }}
            className={errors.website ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter" className="text-sm">Twitter</Label>
          <Input
            id="twitter"
            name="twitter"
            value={formData.links.twitter || ""}
            onChange={(e) => {
              setFormData({ ...formData, links: { ...formData.links, twitter: e.target.value } })
              setErrors((prev) => ({ ...prev, twitter: "" }))
            }}
            className={errors.twitter ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.twitter && <p className="text-xs text-red-500 mt-1">{errors.twitter}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "저장 중..." : (mode === "create" ? "프로필 생성" : "프로필 저장")}
        </Button>
      </div>
    </form>
  )
}
