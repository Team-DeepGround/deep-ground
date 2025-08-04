"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { getStudyGroupAggregation } from "@/lib/api/studySchedule"

declare global {
  interface Window {
    kakao: any
  }
}

interface StudyGroupAggregation {
  studyGroupIds: number[]
  count: number
  address: {
    id: number
    city: string
    gu: string
    dong: string
  }
}

interface StudyMapData {
  calculatedStudyGroups: StudyGroupAggregation[]
}

export function useStudyMap(mapInstance: React.MutableRefObject<any>, isMapReady: boolean) {
  const [studyMarkers, setStudyMarkers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [isComposing, setIsComposing] = useState(false)
  const [inputError, setInputError] = useState("")
  const infoWindowInstance = useRef<any>(null)

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setCurrentLocation({ lat, lng })
          
          if (mapInstance.current) {
            mapInstance.current.setCenter(new window.kakao.maps.LatLng(lat, lng))
            mapInstance.current.setLevel(5) // 구 단위 레벨
          }
        },
        () => {
          // 기본 위치 (서울시청)
          const defaultLat = 37.5665
          const defaultLng = 126.9780
          setCurrentLocation({ lat: defaultLat, lng: defaultLng })
          
          if (mapInstance.current) {
            mapInstance.current.setCenter(new window.kakao.maps.LatLng(defaultLat, defaultLng))
            mapInstance.current.setLevel(5)
          }
        }
      )
    }
  }, [mapInstance])

  // 주소로 좌표 변환
  const getCoordinatesFromAddress = useCallback(async (address: string) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) return null

    return new Promise<{ lat: number; lng: number } | null>((resolve) => {
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.addressSearch(address, (result: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const lat = parseFloat(result[0].y)
          const lng = parseFloat(result[0].x)
          resolve({ lat, lng })
        } else {
          resolve(null)
        }
      })
    })
  }, [])

  // 좌표로 주소 변환
  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) return null

    return new Promise<{ city: string; gu: string; dong: string } | null>((resolve) => {
      const geocoder = new window.kakao.maps.services.Geocoder()
      const coord = new window.kakao.maps.LatLng(lat, lng)
      geocoder.coord2Address(coord, (result: any[], status: string) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const address = result[0].address
          resolve({
            city: address.region_1depth_name,
            gu: address.region_2depth_name,
            dong: address.region_3depth_name
          })
        } else {
          resolve(null)
        }
      })
    })
  }, [])

  // 스터디 그룹 집계 데이터 가져오기
  const fetchStudyGroupAggregation = useCallback(async (city: string, gu: string) => {
    try {
      setIsLoading(true)
      const response = await getStudyGroupAggregation(city, gu)
      return response.result as StudyMapData
    } catch (error) {
      console.error('스터디 그룹 집계 조회 실패:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 커스텀 마커 생성
  const createCustomMarker = useCallback((position: any, count: number, dong: string) => {
    const markerContent = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        border: 3px solid white;
        cursor: pointer;
        transition: transform 0.2s;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        <div style="text-align: center;">
          <div style="font-size: 16px; line-height: 1;">${count}</div>
          <div style="font-size: 10px; line-height: 1; opacity: 0.9;">개</div>
        </div>
      </div>
    `

    const customOverlay = new window.kakao.maps.CustomOverlay({
      position: position,
      content: markerContent,
      map: mapInstance.current,
      yAnchor: 1
    })

    // 클릭 이벤트 추가
    window.kakao.maps.event.addListener(customOverlay, 'click', () => {
      // 인포윈도우 표시
      if (infoWindowInstance.current) {
        infoWindowInstance.current.close()
      }

      const infoContent = `
        <div style="padding: 15px; min-width: 200px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${dong}</div>
          <div style="color: #666; font-size: 14px;">스터디 그룹: ${count}개</div>
          <div style="margin-top: 10px; font-size: 12px; color: #999;">
            클릭하여 상세 정보를 확인하세요
          </div>
        </div>
      `

      const infoWindow = new window.kakao.maps.InfoWindow({
        content: infoContent,
        removable: true
      })

      infoWindow.open(mapInstance.current, position)
      infoWindowInstance.current = infoWindow
    })

    return customOverlay
  }, [mapInstance])

  // 지도 중심 변경 시 스터디 그룹 마커 업데이트
  const updateStudyMarkers = useCallback(async () => {
    if (!mapInstance.current || !isMapReady) return

    // 기존 마커 제거
    studyMarkers.forEach(marker => marker.setMap(null))
    setStudyMarkers([])

    const center = mapInstance.current.getCenter()
    const lat = center.getLat()
    const lng = center.getLng()

    // 좌표를 주소로 변환
    const address = await getAddressFromCoordinates(lat, lng)
    if (!address) return

    // 스터디 그룹 집계 데이터 가져오기
    const data = await fetchStudyGroupAggregation(address.city, address.gu)
    if (!data || !data.calculatedStudyGroups) return

    // 각 동별로 마커 생성
    const markers = data.calculatedStudyGroups.map(group => {
      // 동의 중심 좌표를 대략적으로 계산 (실제로는 더 정확한 좌표가 필요)
      const position = new window.kakao.maps.LatLng(lat, lng)
      return createCustomMarker(position, group.count, group.address.dong)
    })

    setStudyMarkers(markers)
  }, [mapInstance, isMapReady, studyMarkers, getAddressFromCoordinates, fetchStudyGroupAggregation, createCustomMarker])

  // 지도 이벤트 리스너 등록
  useEffect(() => {
    if (!mapInstance.current || !isMapReady) return

    const map = mapInstance.current
    const onDragEnd = () => {
      setTimeout(updateStudyMarkers, 500) // 드래그 완료 후 0.5초 뒤 업데이트
    }
    const onZoomChanged = () => {
      setTimeout(updateStudyMarkers, 500) // 줌 변경 후 0.5초 뒤 업데이트
    }

    window.kakao.maps.event.addListener(map, "dragend", onDragEnd)
    window.kakao.maps.event.addListener(map, "zoom_changed", onZoomChanged)

    return () => {
      window.kakao.maps.event.removeListener(map, "dragend", onDragEnd)
      window.kakao.maps.event.removeListener(map, "zoom_changed", onZoomChanged)
    }
  }, [mapInstance, isMapReady, updateStudyMarkers])

  // 검색 자동완성
  useEffect(() => {
    if (!isMapReady || searchInput.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/kakao/search?endpoint=keyword.json&query=${encodeURIComponent(searchInput)}`
        )
        const data = await response.json()
        
        if (data.documents && data.documents.length > 0) {
          setSuggestions(data.documents.slice(0, 5))
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch (error) {
        console.error('검색 자동완성 실패:', error)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchInput, isMapReady])

  // 검색 실행
  const handleSearch = useCallback(async (query?: string) => {
    const searchQuery = query || searchInput.trim()
    if (searchQuery.length < 2) {
      setInputError("2글자 이상 입력해 주세요.")
      return
    }

    setInputError("")
    setShowSuggestions(false)

    // 주소로 좌표 변환
    const coordinates = await getCoordinatesFromAddress(searchQuery)
    if (!coordinates) {
      setInputError("해당 위치를 찾을 수 없습니다.")
      return
    }

    // 지도 이동
    if (mapInstance.current) {
      mapInstance.current.setCenter(new window.kakao.maps.LatLng(coordinates.lat, coordinates.lng))
      mapInstance.current.setLevel(5)
    }
  }, [searchInput, mapInstance, getCoordinatesFromAddress])

  // 추천 항목 클릭
  const handleSuggestionClick = useCallback((suggestion: any) => {
    setSearchInput(suggestion.place_name)
    setShowSuggestions(false)
    handleSearch(suggestion.place_name)
  }, [handleSearch])

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault()
      handleSearch()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setHighlighted(-1)
    }
  }, [isComposing, handleSearch, suggestions.length])

  return {
    studyMarkers,
    isLoading,
    currentLocation,
    searchInput,
    setSearchInput,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    highlighted,
    setHighlighted,
    isComposing,
    setIsComposing,
    inputError,
    setInputError,
    getCurrentLocation,
    handleSearch,
    handleSuggestionClick,
    handleKeyDown,
    updateStudyMarkers
  }
} 