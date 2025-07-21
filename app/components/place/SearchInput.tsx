"use client"

import React from "react"

interface SearchInputProps {
  searchInput: string
  setSearchInput: (value: string) => void
  isMapReady: boolean
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  setIsComposing: (isComposing: boolean) => void
  setShowSuggestions: (show: boolean) => void
  setHighlighted: (index: number) => void
  setInputError: (error: string) => void
  showSuggestions: boolean
  suggestions: any[]
  highlighted: number
  handleSuggestionClick: (place: any) => void
  inputError: string
}

export function SearchInput({
  searchInput,
  setSearchInput,
  isMapReady,
  handleKeyDown,
  setIsComposing,
  setShowSuggestions,
  setHighlighted,
  setInputError,
  showSuggestions,
  suggestions,
  highlighted,
  handleSuggestionClick,
  inputError,
}: SearchInputProps) {
  return (
    <div className="absolute top-[90px] left-8 z-20 w-full max-w-xs">
      <div className="relative mb-3">
        <input
          type="text"
          className="w-full rounded-xl bg-black/80 text-white placeholder-gray-300 border-none outline-none px-4 py-3 shadow-lg text-base font-semibold focus:ring-2 focus:ring-blue-500"
          placeholder={
            isMapReady
              ? "장소명 또는 '장소명 카테고리'를 입력하세요 (예: 강남역 카페)"
              : "지도를 불러오는 중입니다..."
          }
          value={searchInput}
          onChange={e => {
            setSearchInput(e.target.value)
            setShowSuggestions(true)
            setHighlighted(-1)
            setInputError("")
          }}
          autoComplete="off"
          disabled={!isMapReady}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={e => {
            setIsComposing(false)
            setSearchInput(e.currentTarget.value)
          }}
        />
        {/* 추천 리스트 드롭다운 */}
        {showSuggestions && suggestions.length > 0 && isMapReady && (
          <ul className="absolute left-0 right-0 mt-2 bg-black/90 rounded-xl shadow-xl border border-gray-700 overflow-hidden max-h-60 z-20">
            {suggestions.map((s, i) => (
              <li
              key={s.id || `${s.place_name}-${s.x}-${s.y}-${i}`}
                className={`px-4 py-2 cursor-pointer text-white hover:bg-blue-700 transition text-base ${
                  highlighted === i ? "bg-blue-700" : ""
                }`}
                onMouseDown={() => handleSuggestionClick(s)}
                onMouseEnter={() => setHighlighted(i)}
              >
                <span className="font-semibold">{s.place_name}</span>
                {s.road_address_name && (
                  <span className="ml-2 text-xs text-gray-300">
                    {s.road_address_name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {inputError && (
          <div className="text-red-400 text-sm mt-2 ml-1">{inputError}</div>
        )}
      </div>
    </div>
  )
} 