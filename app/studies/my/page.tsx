"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function MyStudiesPage() {
  const router = useRouter()
  const { user } = useAuth()

  // 내가 만든 스터디
  const createdStudies = [
    {
      id: 2,
      title: "알고리즘 문제 풀이 스터디",
      description: "매주 알고리즘 문제를 함께 풀고 리뷰하는 스터디입니다.",
      members: 8,
      maxMembers: 10,
      dates: "2023.05.15 ~ 2023.07.15",
      isOnline: true,
      tags: ["Algorithm", "Data Structure", "Problem Solving"],
      location: null,
    },
    {
      id: 5,
      title: "모던 자바스크립트 심화 학습",
      description: "ES6+ 기능과 최신 자바스크립트 패턴을 학습하는 스터디입니다.",
      members: 5,
      maxMembers: 12,
      dates: "2023.07.01 ~ 2023.08.31",
      isOnline: false,
      tags: ["JavaScript", "ES6", "Frontend"],
      location: "서울 송파구",
    },
  ]

  // 참여 중인 스터디
  const joinedStudies = [
    {
      id: 1,
      title: "React와 Next.js 마스터하기",
      description: "React와 Next.js의 기본부터 고급 기능까지 함께 학습하는 스터디입니다.",
      members: 6,
      maxMembers: 8,
      dates: "2023.05.01 ~ 2023.06.30",
      isOnline: true,
      tags: ["React", "Next.js", "Frontend"],
      location: null,
    },
    {
      id: 3,
      title: "백엔드 개발자를 위한 Spring Boot",
      description: "Spring Boot를 활용한 백엔드 개발 스터디입니다.",
      members: 4,
      maxMembers: 6,
      dates: "2023.06.01 ~ 2023.08.31",
      isOnline: false,
      tags: ["Java", "Spring Boot", "Backend"],
      location: "서울 강남구",
    },
  ]

  // 스터디 카드 컴포넌트
  const StudyCard = ({ study, isCreated = false }) => (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg truncate">{study.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{study.description}</p>
          </div>
          <Badge variant={study.isOnline ? "default" : "outline"} className="whitespace-nowrap flex-shrink-0">
            {study.isOnline ? "온라인" : "오프라인"}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {study.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">{study.dates}</span>
            </p>
            <p className="text-sm text-muted-foreground flex items-center">
              <Users className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span>
                {study.members}/{study.maxMembers}명
              </span>
            </p>
            {study.location && (
              <p className="text-sm text-muted-foreground flex items-center">
                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">{study.location}</span>
              </p>
            )}
          </div>
          <Button
            size="sm"
            className="flex-shrink-0"
            onClick={() => {
              if (isCreated) {
                router.push(`/studies/manage/${study.id}`)
              } else {
                router.push(`/studies/${study.id}`)
              }
            }}
          >
            {isCreated ? "관리하기" : "상세보기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">내 스터디</h1>
          <Button asChild>
            <Link href="/studies/create">
              <Plus className="mr-2 h-4 w-4" />
              스터디 개설하기
            </Link>
          </Button>
        </div>

        <div className="space-y-10">
          {/* 내가 만든 스터디 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">내가 만든 스터디</h2>
              <span className="text-sm text-muted-foreground">{createdStudies.length}개</span>
            </div>

            {createdStudies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {createdStudies.map((study) => (
                  <StudyCard key={study.id} study={study} isCreated={true} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">아직 만든 스터디가 없습니다.</p>
                  <Button className="mt-4" asChild>
                    <Link href="/studies/create">스터디 개설하기</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 내가 참여한 스터디 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">내가 참여한 스터디</h2>
              <span className="text-sm text-muted-foreground">{joinedStudies.length}개</span>
            </div>

            {joinedStudies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinedStudies.map((study) => (
                  <StudyCard key={study.id} study={study} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">아직 참여한 스터디가 없습니다.</p>
                  <Button className="mt-4" asChild>
                    <Link href="/studies">스터디 찾아보기</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-center mt-6">
            <Button asChild variant="outline">
              <Link href="/studies">다른 스터디 찾기</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
