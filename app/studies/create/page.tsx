"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

export default function CreateStudyPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isOnline, setIsOnline] = useState(true)
  const [location, setLocation] = useState("")
  const [maxMembers, setMaxMembers] = useState("6")

  const [studyStartDate, setStudyStartDate] = useState<Date>()
  const [studyEndDate, setStudyEndDate] = useState<Date>()
  const [recruitStartDate, setRecruitStartDate] = useState<Date>()
  const [recruitEndDate, setRecruitEndDate] = useState<Date>()

  // 기술 태그 선택 방식으로 변경
  const availableTags = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Vue.js",
    "Angular",
    "Node.js",
    "Express",
    "NestJS",
    "Spring",
    "Django",
    "Flask",
    "Java",
    "Python",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "HTML",
    "CSS",
    "Tailwind",
    "Bootstrap",
    "SASS",
    "GraphQL",
    "REST API",
    "SQL",
    "NoSQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Git",
    "GitHub",
    "GitLab",
    "Testing",
    "TDD",
    "DevOps",
    "Algorithm",
    "Data Structure",
    "Machine Learning",
    "AI",
    "Blockchain",
    "Mobile",
    "React Native",
    "Flutter",
    "iOS",
    "Android",
  ]
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 필수 필드 검증
    if (
      !title ||
      !description ||
      !studyStartDate ||
      !studyEndDate ||
      !recruitStartDate ||
      !recruitEndDate ||
      !maxMembers
    ) {
      toast({
        title: "필수 정보 누락",
        description: "모든 필수 정보를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 날짜 검증
    if (studyStartDate > studyEndDate) {
      toast({
        title: "날짜 오류",
        description: "스터디 시작일은 종료일보다 이전이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    if (recruitStartDate > recruitEndDate) {
      toast({
        title: "날짜 오류",
        description: "모집 시작일은 종료일보다 이전이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    if (recruitEndDate > studyStartDate) {
      toast({
        title: "날짜 오류",
        description: "모집 종료일은 스터디 시작일보다 이전이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    // 오프라인 스터디인 경우 장소 검증
    if (!isOnline && !location) {
      toast({
        title: "장소 정보 누락",
        description: "오프라인 스터디의 경우 장소 정보를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 태그 검증
    if (selectedTags.length === 0) {
      toast({
        title: "태그 누락",
        description: "최소 하나 이상의 태그를 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    // 스터디 생성 성공 (실제로는 API 호출)
    toast({
      title: "스터디 생성 성공",
      description: "스터디가 성공적으로 생성되었습니다.",
    })

    // 스터디 목록 페이지로 이동
    router.push("/studies")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">스터디 개설하기</h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>스터디에 대한 기본 정보를 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">스터디 제목</Label>
                <Input
                  id="title"
                  placeholder="스터디 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">스터디 설명</Label>
                <Textarea
                  id="description"
                  placeholder="스터디에 대한 상세 설명을 입력하세요"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>스터디 기간</Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="studyStartDate" className="text-xs text-muted-foreground mb-1 block">
                      시작일
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !studyStartDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {studyStartDate ? format(studyStartDate, "PPP", { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={studyStartDate} onSelect={setStudyStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex-1">
                    <Label htmlFor="studyEndDate" className="text-xs text-muted-foreground mb-1 block">
                      종료일
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !studyEndDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {studyEndDate ? format(studyEndDate, "PPP", { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={studyEndDate} onSelect={setStudyEndDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>모집 기간</Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="recruitStartDate" className="text-xs text-muted-foreground mb-1 block">
                      시작일
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !recruitStartDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {recruitStartDate ? format(recruitStartDate, "PPP", { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={recruitStartDate}
                          onSelect={setRecruitStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex-1">
                    <Label htmlFor="recruitEndDate" className="text-xs text-muted-foreground mb-1 block">
                      종료일
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !recruitEndDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {recruitEndDate ? format(recruitEndDate, "PPP", { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={recruitEndDate} onSelect={setRecruitEndDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>스터디 세부 정보</CardTitle>
              <CardDescription>스터디 진행 방식과 관련 정보를 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isOnline">온라인 스터디</Label>
                <Switch id="isOnline" checked={isOnline} onCheckedChange={setIsOnline} />
              </div>

              {!isOnline && (
                <div className="space-y-2">
                  <Label htmlFor="location">스터디 장소</Label>
                  <Input
                    id="location"
                    placeholder="스터디 장소를 입력하세요 (예: 서울 강남구)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="maxMembers">모집 인원</Label>
                <Select value={maxMembers} onValueChange={setMaxMembers}>
                  <SelectTrigger>
                    <SelectValue placeholder="모집 인원 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2명</SelectItem>
                    <SelectItem value="4">4명</SelectItem>
                    <SelectItem value="6">6명</SelectItem>
                    <SelectItem value="8">8명</SelectItem>
                    <SelectItem value="10">10명</SelectItem>
                    <SelectItem value="12">12명</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>관련 기술 태그</Label>
                <div className="border rounded-md p-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleTagToggle(tag)} />
                      </Badge>
                    ))}
                  </div>
                  <div className="border-t pt-3 mt-2">
                    <p className="text-sm text-muted-foreground mb-2">기술 태그 선택 (다중 선택 가능)</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={selectedTags.includes(tag)}
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
            <Button type="submit">스터디 개설하기</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
