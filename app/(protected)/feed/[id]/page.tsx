"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { fetchFeedById, FetchFeedResponse } from "@/lib/api/feed"
import { FeedPost } from "@/components/feed/feed-post"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function FeedDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [feed, setFeed] = useState<FetchFeedResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // Ensure 'id' is always a string, handling potential string array from params.
  const feedIdFromParams = Array.isArray(params.id) ? params.id[0] : params.id
  const feedId = feedIdFromParams ? parseInt(feedIdFromParams) : null

  useEffect(() => {
    if (feedId) {
      loadFeed()
    }
  }, [feedId])

  const loadFeed = async () => {
    if (!feedId) return

    try {
      setLoading(true)
      const response = await fetchFeedById(feedId)
      
      if (response.result) {
        setFeed(response.result)
      } else {
        toast({ 
          title: "피드를 찾을 수 없습니다", 
          description: "요청한 피드가 존재하지 않거나 삭제되었습니다.", 
          variant: "destructive" 
        })
        router.back()
      }
    } catch (error) {
      console.error('피드 로딩 오류:', error)
      toast({ 
        title: "피드 로딩 실패", 
        description: "피드를 불러오는데 실패했습니다.", 
        variant: "destructive" 
      })
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadFeed()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-muted-foreground">피드를 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (!feed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-muted-foreground">피드를 찾을 수 없습니다.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
        </div>

        {/* 피드 상세 정보 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">피드 상세보기</h1>
          <FeedPost post={feed} onRefresh={handleRefresh} />
        </div>
      </div>
    </div>
  )
} 