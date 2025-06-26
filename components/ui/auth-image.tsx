"use client"

import { useState, useEffect } from "react"
import { getFeedMediaBlob, getProfileMediaBlob, getFeedCommentMediaBlob, getFeedReplyMediaBlob } from "@/lib/api/feed"

interface AuthImageProps {
  mediaId: number
  type: 'feed' | 'profile' | 'comment' | 'reply'
  alt: string
  className?: string
  fallbackSrc?: string
}

export function AuthImage({ mediaId, type, alt, className, fallbackSrc = "/placeholder.svg" }: AuthImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true)
        setError(false)
        
        let blob: Blob
        switch (type) {
          case 'feed':
            blob = await getFeedMediaBlob(mediaId)
            break
          case 'profile':
            blob = await getProfileMediaBlob(mediaId)
            break
          case 'comment':
            blob = await getFeedCommentMediaBlob(mediaId)
            break
          case 'reply':
            blob = await getFeedReplyMediaBlob(mediaId)
            break
          default:
            throw new Error('지원하지 않는 이미지 타입입니다')
        }
        
        const url = URL.createObjectURL(blob)
        setImageUrl(url)
      } catch (err) {
        console.error('이미지 로딩 실패:', err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (mediaId) {
      loadImage()
    }

    // cleanup function
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [mediaId, type])

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-muted ${className}`}>
        <div className="w-full h-full bg-muted" />
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <img 
        src={fallbackSrc} 
        alt={alt} 
        className={className}
      />
    )
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={className}
    />
  )
} 