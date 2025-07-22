"use client"

import React from "react"

interface PlaceMapProps {
  mapRef: React.RefObject<HTMLDivElement | null>
}

export function PlaceMap({ mapRef }: PlaceMapProps) {
  return (
    <div
      ref={mapRef}
      className="w-full h-[50vh] mt-16 rounded shadow border relative z-0"
    />
  )
} 