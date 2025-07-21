"use client"

import React, { useRef } from "react"
import { useKakaoMap } from "@/hooks/useKakaoMap"
import { usePlaceSearch } from "@/hooks/usePlaceSearch"
import { SearchInput } from "@/app/components/place/SearchInput"
import { PlaceMap } from "@/app/components/place/PlaceMap"

export default function PlacePage() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const { mapInstance, isMapReady } = useKakaoMap(mapRef)
  const {
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
    handleSuggestionClick,
    handleKeyDown,
  } = usePlaceSearch(mapInstance, isMapReady)

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold mb-4">모임장소</h1>
      <SearchInput
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        isMapReady={isMapReady}
        handleKeyDown={handleKeyDown}
        setIsComposing={setIsComposing}
        setShowSuggestions={setShowSuggestions}
        setHighlighted={setHighlighted}
        setInputError={setInputError}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        highlighted={highlighted}
        handleSuggestionClick={handleSuggestionClick}
        inputError={inputError}
      />
      <PlaceMap mapRef={mapRef} />
    </div>
  )
} 
