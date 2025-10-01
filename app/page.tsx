"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TrendingUp, Users, Calendar, MessageSquare } from "lucide-react"
import FeaturedStudies from "@/components/featured-studies"
import RecentQuestions from "@/components/recent-questions"
import TechFeed from "@/components/tech-feed"
import { useAuth } from "@/components/auth-provider"

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">구름 딥다이브의 <br/> 성장 커뮤니티</h1>
            <p className="text-xl text-muted-foreground">
              함께 공부하고, 질문하고, 성장하는 <br/> 딥다이브 커뮤니티에 참여하세요.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/studies">스터디 찾기</Link>
               </Button>
              {!isAuthenticated && ( // 로그인 안 했을 때만 회원가입 버튼 노출
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/register">회원가입</Link>
                </Button>
              )}
            </div>
          </div>
          <div className="rounded-lg overflow-hidden">
          <video
            src="https://oopy.lazyrockets.com/api/v2/notion/fileUrl?src=https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F38552da6-340d-42c1-a9a1-b181ff331f03%2Faa681f6a-cb4a-4a41-8563-35d8e3ce3a53%2FDeepDive_keyvisual_Web_%25E1%2584%258C%25E1%2585%25A5%25E1%2584%258B%25E1%2585%25AD%25E1%2586%25BC%25E1%2584%2585%25E1%2585%25A3%25E1%2586%25BC.mp4&blockId=19cacac0-e8b1-4dd5-bece-dddb3f779b73#t=0.0001"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-[400px] object-cover rounded-xl shadow-lg mb-8 pointer-events-none select-none"
          />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">스터디 매칭</h3>
            <p className="text-muted-foreground">관심 분야의 스터디를 찾거나 직접 개설하여 함께 성장하세요.</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">스터디 캘린더</h3>
            <p className="text-muted-foreground">일정을 관리하고 중요한 스터디 모임을 놓치지 마세요.</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Q&A 게시판</h3>
            <p className="text-muted-foreground">개발 관련 질문을 하고 다른 개발자들의 답변을 받아보세요.</p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">기술 피드</h3>
            <p className="text-muted-foreground">최신 기술 트렌드와 개발자들의 인사이트를 공유하세요.</p>
          </div>
        </div>
      </section>

      {/* Featured Studies */}
      {/* <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">인기 스터디</h2>
          <Button asChild variant="ghost">
            <Link href="/studies">더보기</Link>
          </Button>
        </div>
        <FeaturedStudies />
      </section> */}

      {/* Recent Q&A */}
      {/* <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">최근 질문</h2>
          <Button asChild variant="ghost">
            <Link href="/questions">더보기</Link>
          </Button>
        </div>
        <RecentQuestions />
      </section> */}

      {/* Tech Feed Preview */}
      {/* <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">기술 피드</h2>
          <Button asChild variant="ghost">
            <Link href="/feed">더보기</Link>
          </Button>
        </div>
        <TechFeed />
      </section> */}
    </div>
  )
}
