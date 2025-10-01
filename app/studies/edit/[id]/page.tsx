"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getTechStacks, TechStack } from "@/lib/api/techStack"
import { Calendar, MapPin, Users } from "lucide-react"
import { api } from "@/lib/api-client"

interface StudySettingsForm {
  title: string
  description: string
  isOnline: boolean
  location: string
  groupLimit: number
  studyStartDate: string
  studyEndDate: string
  recruitStartDate: string
  recruitEndDate: string
  techTags: string[]
}

// 더미 데이터
const dummyStudyData = {
  title: "React 스터디",
  description: "React와 Next.js를 함께 공부하는 스터디입니다. 실무에서 자주 사용되는 패턴과 최신 기술을 학습합니다.",
  isOnline: true,
  location: "서울 강남구",
  groupLimit: 6,
  studyStartDate: "2024-03-01",
  studyEndDate: "2024-04-30",
  recruitStartDate: "2024-02-15",
  recruitEndDate: "2024-02-28",
  techTags: ["React", "TypeScript", "Next.js"]
}

export default function StudyEditPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<TechStack[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudySettingsForm>()

  useEffect(() => {
    getTechStacks().then((tags) => {
      setAvailableTags(tags)
    })
  }, [])

  useEffect(() => {
    // 실제 스터디 데이터 불러오기
    const fetchStudy = async () => {
      try {
        const response = await api.get(`/study-group/${params.id}`)
        if (response.status === 200 && response.result) {
          const study = response.result
          setValue("title", study.title)
          setValue("description", study.explanation)
          setValue("isOnline", !study.offline)
          setValue("location", study.location)
          setValue("groupLimit", study.groupLimit)
          setValue("studyStartDate", study.studyStartDate)
          setValue("studyEndDate", study.studyEndDate)
          setValue("recruitStartDate", study.recruitStartDate)
          setValue("recruitEndDate", study.recruitEndDate)
          setSelectedTags(study.techStacks.map((t: { name: string }) => t.name))
        }
      } catch (error) {
        toast({
          title: "스터디 정보를 불러오지 못했습니다.",
          description: "잠시 후 다시 시도해주세요.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudy()
  }, [params.id, setValue, toast])

  const onSubmit = async (data: StudySettingsForm) => {
    try {
      const requestBody = {
        id: Number(params.id),
        title: data.title,
        explanation: data.description,
        studyStartDate: data.studyStartDate,
        studyEndDate: data.studyEndDate,
        recruitStartDate: data.recruitStartDate,
        recruitEndDate: data.recruitEndDate,
        groupMemberCount: data.groupLimit,
        isOffline: !data.isOnline ? true : false,
        studyLocation: data.location,
        techStackNames: selectedTags,
      }
      await api.patch(`/study-group/${params.id}`, requestBody)
      toast({
        title: "설정 저장 완료",
        description: "스터디 설정이 저장되었습니다.",
      })
      router.push(`/studies/${params.id}`)
    } catch (error) {
      toast({
        title: "설정 저장 실패",
        description: "스터디 설정 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  return (
    <div className="container max-w-4xl py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">스터디 설정</h1>
        <Button variant="outline" onClick={() => router.back()}>
          돌아가기
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="basic">기본 정보</TabsTrigger>
          <TabsTrigger value="schedule">일정 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">스터디 제목</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "제목을 입력해주세요" })}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">스터디 설명</Label>
                  <Textarea
                    id="description"
                    {...register("description", { required: "설명을 입력해주세요" })}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>스터디 방식</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isOnline"
                      {...register("isOnline")}
                    />
                    <Label htmlFor="isOnline">온라인 스터디</Label>
                  </div>
                </div>

                {!watch("isOnline") && (
                  <div className="space-y-2">
                    <Label htmlFor="location">오프라인 장소</Label>
                    <Input
                      id="location"
                      {...register("location", { required: "장소를 입력해주세요" })}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500">{errors.location.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="groupLimit">모집 인원</Label>
                  <Input
                    id="groupLimit"
                    type="number"
                    min="2"
                    max="20"
                    {...register("groupLimit", {
                      required: "모집 인원을 입력해주세요",
                      min: { value: 2, message: "최소 2명 이상이어야 합니다" },
                      max: { value: 20, message: "최대 20명까지 가능합니다" },
                    })}
                  />
                  {errors.groupLimit && (
                    <p className="text-sm text-red-500">{errors.groupLimit.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>기술 스택</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag.name)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  저장하기
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>일정 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>스터디 기간</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studyStartDate">시작일</Label>
                      <Input
                        id="studyStartDate"
                        type="date"
                        {...register("studyStartDate", { required: "시작일을 선택해주세요" })}
                      />
                      {errors.studyStartDate && (
                        <p className="text-sm text-red-500">{errors.studyStartDate.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="studyEndDate">종료일</Label>
                      <Input
                        id="studyEndDate"
                        type="date"
                        {...register("studyEndDate", { required: "종료일을 선택해주세요" })}
                      />
                      {errors.studyEndDate && (
                        <p className="text-sm text-red-500">{errors.studyEndDate.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>모집 기간</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recruitStartDate">시작일</Label>
                      <Input
                        id="recruitStartDate"
                        type="date"
                        {...register("recruitStartDate", { required: "시작일을 선택해주세요" })}
                      />
                      {errors.recruitStartDate && (
                        <p className="text-sm text-red-500">{errors.recruitStartDate.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="recruitEndDate">종료일</Label>
                      <Input
                        id="recruitEndDate"
                        type="date"
                        {...register("recruitEndDate", { required: "종료일을 선택해주세요" })}
                      />
                      {errors.recruitEndDate && (
                        <p className="text-sm text-red-500">{errors.recruitEndDate.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  저장하기
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 