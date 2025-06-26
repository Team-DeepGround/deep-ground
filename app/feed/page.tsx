"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { fetchFeeds, FetchFeedResponse, FetchFeedsResponse } from "@/lib/api/feed"
import { FeedCreatePost } from "@/components/feed/feed-create-post"
import { FeedPost } from "@/components/feed/feed-post"

export default function FeedPage() {
  const { toast } = useToast()
  const [feeds, setFeeds] = useState<FetchFeedResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  // 피드 목록 불러오기 (공유된 피드 포함)
  const loadFeeds = async (pageNum: number = 0, append: boolean = false) => {
    if (pageNum === 0) {
      setLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    try {
      console.log(`피드 목록 조회 시작 (페이지: ${pageNum}, 공유 피드 포함)`)
      const res = (await fetchFeeds({ page: pageNum, size: 10, sort: "createdAt,desc" })) as FetchFeedsResponse
      console.log('피드 목록 응답:', res)
      
      if (res.result?.feeds) {
        console.log('피드 아이템들:', res.result.feeds)
        console.log('페이지네이션 정보:', {
          total: res.result.total,
          page: res.result.page,
          pageSize: res.result.pageSize,
          totalPages: res.result.totalPages,
          currentPage: pageNum
        })
        
        // 공유된 피드와 일반 피드를 모두 표시
        const processedFeeds = res.result.feeds.map(feed => {
          // 공유된 피드인 경우 sharedBy 정보 추가
          if (feed.isShared && feed.sharedFeed) {
            return {
              ...feed,
              sharedBy: {
                memberId: feed.memberId,
                memberName: feed.memberName,
                profileImageId: feed.profileImageId
              }
            }
          }
          return feed
        })

        if (append) {
          setFeeds(prev => [...prev, ...processedFeeds])
        } else {
          setFeeds(processedFeeds)
        }

        // 더 로드할 피드가 있는지 확인 (수정된 로직)
        const hasMoreData = res.result.total > (pageNum + 1) * res.result.pageSize
        console.log('더 로드할 피드가 있는지:', hasMoreData, {
          total: res.result.total,
          currentItems: (pageNum + 1) * res.result.pageSize,
          remaining: res.result.total - (pageNum + 1) * res.result.pageSize
        })
        
        setHasMore(hasMoreData)
        setPage(pageNum + 1)
      } else {
        console.log('피드 아이템이 없음')
        if (!append) {
          setFeeds([])
        }
        setHasMore(false)
      }
    } catch (error) {
      console.error('피드 로딩 오류:', error)
      toast({ title: "피드 로딩 실패", description: "피드를 불러오는데 실패했습니다.", variant: "destructive" })
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  // 추가 피드 로드
  const loadMoreFeeds = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadFeeds(page, true)
    }
  }, [isLoadingMore, hasMore, page])

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreFeeds()
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current = observer

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoadingMore, loadMoreFeeds])

  // 초기 피드 로드
  useEffect(() => {
    loadFeeds(0, false)
  }, [])

  // 새 피드 생성 후 리프레시
  const handlePostCreated = () => {
    setPage(0)
    setHasMore(true)
    loadFeeds(0, false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">기술 피드</h1>

        {/* 새 게시물 작성 */}
        <FeedCreatePost onPostCreated={handlePostCreated} />

        {/* 피드 게시물 */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-muted-foreground">로딩 중...</div>
          ) : feeds.length === 0 ? (
            <div className="text-center text-muted-foreground">피드가 없습니다.</div>
          ) : (
            <>
              {feeds.map((post) => (
                <FeedPost key={post.feedId} post={post} onRefresh={handlePostCreated} />
              ))}
              
              {/* 무한 스크롤 로딩 인디케이터 */}
              <div ref={loadingRef} className="py-4">
                {isLoadingMore && (
                  <div className="text-center text-muted-foreground">추가 피드를 불러오는 중...</div>
                )}
                {!hasMore && feeds.length > 0 && (
                  <div className="text-center text-muted-foreground">모든 피드를 불러왔습니다.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
