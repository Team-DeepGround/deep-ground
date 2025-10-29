"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TrendingUp, Users, Calendar, MessageSquare, MapPin, Clock, UserCheck, Code } from "lucide-react"
import FeaturedStudies from "@/components/featured-studies"
import RecentQuestions from "@/components/recent-questions"
import TechFeed from "@/components/tech-feed"
import { useAuth } from "@/components/auth-provider"
import { api } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"

interface StudyGroup {
  id: number;
  title: string;
  description: string;
  period: string;
  recruitmentPeriod: string;
  tags: { id: number; name: string }[];
  maxMembers: number;
  currentMembers: number;
  organizer: {
    name: string;
    avatar: string;
  };
  isOnline: boolean;
  location: string;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [studies, setStudies] = useState<StudyGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 스터디 목록 조회
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/study-group/search', {
          params: {
            page: '0',
            size: '10',
            onOffline: 'ALL',
            sort: 'createdAt,desc'
          }
        });
        setStudies(response.result?.content || []);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudies();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-16 md:py-24 relative bg-gradient-to-r from-gray-50 to-blue-50 w-full">
        {/* 콘텐츠 */}
        <div className="text-center space-y-8 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
              개발자들의<br/>
              <span className="text-black">성장 놀이터</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              프로젝트 & 스터디까지 열정이 가득한 <span className="font-bold text-black">Studen</span>에서<br/>가능성을 찾아보세요!
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-lg px-10 py-4 bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Link href="/studies">스터디 찾기</Link>
            </Button>
            {!isAuthenticated && (
              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-4 border-2 border-gray-300 hover:border-gray-400">
                <Link href="/auth/register">회원가입</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">주요 기능</h2>
          <p className="text-gray-600">Studen에서 제공하는 다양한 기능들을 만나보세요</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="mb-4 bg-blue-100 p-3 rounded-full w-fit mx-auto">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">스터디 매칭</h3>
            <p className="text-gray-600 text-center text-sm">관심 분야의 스터디를 찾거나 직접 개설하여 함께 성장하세요.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="mb-4 bg-green-100 p-3 rounded-full w-fit mx-auto">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">스터디 캘린더</h3>
            <p className="text-gray-600 text-center text-sm">일정을 관리하고 중요한 스터디 모임을 놓치지 마세요.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="mb-4 bg-purple-100 p-3 rounded-full w-fit mx-auto">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">Q&A 게시판</h3>
            <p className="text-gray-600 text-center text-sm">개발 관련 질문을 하고 다른 개발자들의 답변을 받아보세요.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="mb-4 bg-orange-100 p-3 rounded-full w-fit mx-auto">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">기술 피드</h3>
            <p className="text-gray-600 text-center text-sm">최신 기술 트렌드와 개발자들의 인사이트를 공유하세요.</p>
          </div>
        </div>
      </section>

      {/* Studies Section */}
      <section className="py-12 md:py-16 max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">스터디</h2>
          <p className="text-muted-foreground">함께 성장할 스터디를 찾아보세요</p>
        </div>
        
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md animate-pulse border border-gray-200">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : studies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studies.slice(0, 4).map((study) => (
              <Link key={study.id} href={`/studies/${study.id}`} className="block">
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 h-full">
                  {/* 제목 */}
                  <h3 className="text-xl font-bold mb-4 text-black">
                    {study.title}
                  </h3>
                  
                  {/* 상세 정보 */}
                  <div className="space-y-3 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">장소: </span>
                      <span>{study.isOnline ? '온라인' : study.location || '오프라인'}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">스터디 기간: </span>
                      <span>{study.period}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">모집 인원 수: </span>
                      <span>{study.currentMembers}/{study.maxMembers}명</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">소개 내용: </span>
                      <div className="mt-1 overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                        {study.description}
                      </div>
                    </div>
                    
                    {/* 기술 스택 */}
                    {study.tags && study.tags.length > 0 && (
                      <div>
                        <span className="font-medium">기술 스택: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {study.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                          {study.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{study.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            등록된 스터디가 없습니다.
          </div>
        )}
        
        {studies.length > 0 && (
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/studies">모든 스터디 보기</Link>
            </Button>
          </div>
        )}
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
