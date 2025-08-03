"use client"

import { useState, useEffect, useRef } from "react"

declare global {
  interface Window {
    kakao: any
  }
}

const KAKAO_JAVASCRIPT_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
console.log('KAKAO_JAVASCRIPT_KEY:', KAKAO_JAVASCRIPT_KEY)

export function useKakaoMap(mapContainerRef: React.RefObject<HTMLDivElement | null>) {
  const [isMapReady, setIsMapReady] = useState(false)
  const mapInstance = useRef<any>(null)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    const scriptId = "kakao-map-script"
    const initMap = () => {
      window.kakao.maps.load(() => {
        let lat = 37.5665
        let lng = 126.9780

        const createMap = (lat: number, lng: number) => {
          setTimeout(() => {
            if (!mapContainerRef.current) return
            const map = new window.kakao.maps.Map(mapContainerRef.current, {
              center: new window.kakao.maps.LatLng(lat, lng),
              level: 3,
            })
            mapInstance.current = map
            setIsMapReady(true)
            setMyLocation({ lat, lng })
          }, 100); // 100ms 지연
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            position => {
              lat = position.coords.latitude
              lng = position.coords.longitude
              createMap(lat, lng)
            },
            () => {
              createMap(lat, lng)
            }
          )
        } else {
          createMap(lat, lng)
        }
      })
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script")
      script.id = scriptId
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&autoload=false&libraries=services`
      script.async = true
      document.head.appendChild(script)
      script.onload = initMap
    } else {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(initMap)
      }
    }
  }, [mapContainerRef])

  return { mapInstance, isMapReady, myLocation }
} 