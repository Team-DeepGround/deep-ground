"use client"

import { useState, useEffect } from "react"

interface AuthImageProps {
  mediaId: number
  type: "profile" | "feed" | "answer"
  alt: string
  className?: string
  style?: React.CSSProperties
}

export function AuthImage({ mediaId, type, alt, className, style }: AuthImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchImage = async () => {
      try {
        setIsLoading(true)
        setError(false)
        
        const token = localStorage.getItem("auth_token")
        const endpoint = `/media/${type}/${mediaId}`
        
        const response = await fetch(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        if (isMounted) {
          setImageUrl(url)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("이미지 로드 실패:", err)
        if (isMounted) {
          setError(true)
          setIsLoading(false)
        }
      }
    }

    fetchImage()

    return () => {
      isMounted = false
    }
  }, [mediaId, type])

  // imageUrl cleanup을 위한 별도 useEffect
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={style}
      >
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
          로딩 중...
        </div>
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center text-gray-400 text-xs ${className}`}
        style={style}
      >
        이미지 없음
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  )
}
