import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Users } from "lucide-react"
import Link from "next/link"

// 임시 데이터
const featuredStudies = [
  {
    id: 1,
    title: "React와 Next.js 마스터하기",
    description: "React와 Next.js의 기본부터 고급 기능까지 함께 학습하는 스터디입니다.",
    period: "2023.05.01 ~ 2023.06.30",
    tags: ["React", "Next.js", "Frontend"],
    maxMembers: 8,
    currentMembers: 6,
    organizer: {
      name: "김개발",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: true,
  },
  {
    id: 2,
    title: "알고리즘 문제 풀이 스터디",
    description: "매주 알고리즘 문제를 함께 풀고 리뷰하는 스터디입니다.",
    period: "2023.05.15 ~ 2023.07.15",
    tags: ["Algorithm", "Data Structure", "Problem Solving"],
    maxMembers: 10,
    currentMembers: 8,
    organizer: {
      name: "이코딩",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: true,
  },
  {
    id: 3,
    title: "백엔드 개발자를 위한 Spring Boot",
    description: "Spring Boot를 활용한 백엔드 개발 스터디입니다.",
    period: "2023.06.01 ~ 2023.08.31",
    tags: ["Java", "Spring Boot", "Backend"],
    maxMembers: 6,
    currentMembers: 4,
    organizer: {
      name: "박서버",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    isOnline: false,
  },
]

export default function FeaturedStudies() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredStudies.map((study) => (
        <Card key={study.id} className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold line-clamp-1">{study.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {study.period}
                </p>
              </div>
              <Badge variant={study.isOnline ? "default" : "outline"}>{study.isOnline ? "온라인" : "오프라인"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground line-clamp-2 h-10">{study.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {study.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={study.organizer.avatar || "/placeholder.svg"} alt={study.organizer.name} />
                <AvatarFallback>{study.organizer.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{study.organizer.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center">
                <Users className="h-3.5 w-3.5 mr-1" />
                {study.currentMembers}/{study.maxMembers}
              </div>
              <Button asChild size="sm">
                <Link href={`/studies/${study.id}`}>상세보기</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
