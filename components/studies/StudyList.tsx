"use client"

import { useState, useMemo, useCallback, memo, useEffect } from "react"
import { StudyCard, StudyGroup } from "./StudyCard"
import { StudyCardSkeleton } from "./StudyCardSkeleton"
import { StudyFilterSidebar } from "./StudyFilterSidebar"
import { StudyFilterSidebarSkeleton } from "./StudyFilterSidebarSkeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface StudyListProps {
  studies: StudyGroup[]
  isLoading?: boolean
  searchTerm: string
  onSearchTermChange: (term: string) => void
  selectedTags: string[]
  onSelectedTagsChange: (tags: string[]) => void
  locationFilter: string | null
  onLocationFilterChange: (filter: string | null) => void
  sortOrder: string
  onSortOrderChange: (order: string) => void
  activeTab: "all" | "recruiting" | "upcoming"
  onActiveTabChange: (tab: "all" | "recruiting" | "upcoming") => void
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const StudyList = memo(function StudyList({
  studies,
  isLoading = false,
  searchTerm,
  onSearchTermChange,
  selectedTags,
  onSelectedTagsChange,
  locationFilter,
  onLocationFilterChange,
  sortOrder,
  onSortOrderChange,
  activeTab,
  onActiveTabChange,
  currentPage,
  totalPages,
  onPageChange
}: StudyListProps) {
  const [internalSortOrder, setInternalSortOrder] = useState(sortOrder)
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab)

  // 외부 상태와 동기화 - 초기값만 동기화
  useEffect(() => {
    setInternalSortOrder(sortOrder)
  }, [sortOrder])

  useEffect(() => {
    setInternalActiveTab(activeTab)
  }, [activeTab])

  // 외부로 변경사항 전달
  useEffect(() => {
    if (internalSortOrder !== sortOrder) {
      onSortOrderChange(internalSortOrder)
    }
  }, [internalSortOrder, onSortOrderChange])

  useEffect(() => {
    if (internalActiveTab !== activeTab) {
      onActiveTabChange(internalActiveTab)
    }
  }, [internalActiveTab, onActiveTabChange])

  const sortedStudies = useMemo(() => {
    return [...studies].sort((a, b) => {
      if (internalSortOrder === "latest") {
        return new Date(b.recruitmentPeriod.split(" ~ ")[1]).getTime() -
               new Date(a.recruitmentPeriod.split(" ~ ")[1]).getTime()
      } else if (internalSortOrder === "popular") {
        return b.currentMembers / b.maxMembers - a.currentMembers / a.maxMembers
      } else if (internalSortOrder === "closing") {
        return new Date(a.recruitmentPeriod.split(" ~ ")[1]).getTime() -
               new Date(b.recruitmentPeriod.split(" ~ ")[1]).getTime()
      }
      return 0
    })
  }, [studies, internalSortOrder])

  const filteredAndSortedStudies = useMemo(() => {
    return sortedStudies.filter((study) => {
      const matchesLocation =
        !locationFilter ||
        (locationFilter === "online" && study.isOnline) ||
        (locationFilter === "offline" && !study.isOnline)

      return matchesLocation
    })
  }, [sortedStudies, locationFilter])

  const handleTabChange = useCallback((value: string) => {
    setInternalActiveTab(value as typeof activeTab)
    onPageChange(1)
  }, [onPageChange])

  const handleSortOrderChange = useCallback((order: string) => {
    setInternalSortOrder(order)
  }, [])

  const handlePreviousPage = useCallback(() => {
    onPageChange(Math.max(1, currentPage - 1))
  }, [currentPage, onPageChange])

  const handleNextPage = useCallback(() => {
    onPageChange(Math.min(totalPages, currentPage + 1))
  }, [currentPage, totalPages, onPageChange])

  const handlePageClick = useCallback((page: number) => {
    onPageChange(page)
  }, [onPageChange])

  // Memoize study cards to prevent unnecessary re-renders
  const studyCards = useMemo(() => {
    return filteredAndSortedStudies.map((study) => (
      <StudyCard key={study.id} study={study} />
    ))
  }, [filteredAndSortedStudies])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 mb-8">
        {/* 필터 사이드바 스켈레톤 */}
        <StudyFilterSidebarSkeleton />

        {/* 스터디 목록 스켈레톤 */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="opacity-50 pointer-events-none">
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="recruiting">모집중</TabsTrigger>
                <TabsTrigger value="upcoming">예정</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select disabled>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <StudyCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 mb-8">
      {/* 필터 사이드바 */}
      <StudyFilterSidebar
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
        selectedTags={selectedTags}
        onSelectedTagsChange={onSelectedTagsChange}
        locationFilter={locationFilter}
        onLocationFilterChange={onLocationFilterChange}
        onPageReset={() => onPageChange(1)}
      />

      {/* 스터디 목록 */}
      <div className="space-y-6">
        <Tabs defaultValue="all" value={internalActiveTab} onValueChange={handleTabChange}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="recruiting">모집중</TabsTrigger>
              <TabsTrigger value="upcoming">예정</TabsTrigger>
            </TabsList>
            <Select value={internalSortOrder} onValueChange={handleSortOrderChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="closing">마감임박순</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {["all", "recruiting", "upcoming"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              {filteredAndSortedStudies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {studyCards}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">검색 결과가 없습니다.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePreviousPage}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => handlePageClick(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={handleNextPage}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
})