"use client"

import { useState, useMemo, useCallback, memo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { getTechStacks, TechStack } from "@/lib/api/techStack"

interface StudyFilterSidebarProps {
  searchTerm: string
  onSearchTermChange: (term: string) => void
  selectedTags: string[]
  onSelectedTagsChange: (tags: string[]) => void
  locationFilter: string | null
  onLocationFilterChange: (filter: string | null) => void
  onPageReset?: () => void
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized TechTag component
const TechTag = memo(function TechTag({
  tag,
  isSelected,
  onClick
}: {
  tag: string
  isSelected: boolean
  onClick: (tag: string) => void
}) {
  return (
    <Badge
      variant={isSelected ? "default" : "outline"}
      className="cursor-pointer"
      onClick={() => onClick(tag)}
    >
      {tag}
    </Badge>
  )
})

export const StudyFilterSidebar = memo(function StudyFilterSidebar({
  searchTerm,
  onSearchTermChange,
  selectedTags,
  onSelectedTagsChange,
  locationFilter,
  onLocationFilterChange,
  onPageReset
}: StudyFilterSidebarProps) {
  // 내부 상태로 관리하여 리렌더링 최소화
  const [internalSearchTerm, setInternalSearchTerm] = useState(searchTerm)
  const [internalSelectedTags, setInternalSelectedTags] = useState(selectedTags)
  const [internalLocationFilter, setInternalLocationFilter] = useState(locationFilter)

  // 페이지 리셋 플래그
  const [shouldResetPage, setShouldResetPage] = useState(false)

  // Debounce search term
  const debouncedSearchTerm = useDebounce(internalSearchTerm, 300)

  // 외부 상태와 동기화 - 초기값만 동기화
  useEffect(() => {
    setInternalSearchTerm(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    setInternalSelectedTags(selectedTags)
  }, [selectedTags])

  useEffect(() => {
    setInternalLocationFilter(locationFilter)
  }, [locationFilter])

  // 외부로 변경사항 전달
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      onSearchTermChange(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm, onSearchTermChange])

  useEffect(() => {
    if (internalSelectedTags !== selectedTags) {
      onSelectedTagsChange(internalSelectedTags)
    }
  }, [internalSelectedTags, onSelectedTagsChange])

  useEffect(() => {
    if (internalLocationFilter !== locationFilter) {
      onLocationFilterChange(internalLocationFilter)
    }
  }, [internalLocationFilter, onLocationFilterChange])

  // 페이지 리셋 처리
  useEffect(() => {
    if (shouldResetPage) {
      onPageReset?.()
      setShouldResetPage(false)
    }
  }, [shouldResetPage, onPageReset])

  // Memoize callback functions
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalSearchTerm(e.target.value)
    setShouldResetPage(true)
  }, [])

  const handleLocationFilterChange = useCallback((value: string) => {
    setInternalLocationFilter(value === "all" ? null : value)
    setShouldResetPage(true)
  }, [])

  const handleTagClick = useCallback((tag: string) => {
    setInternalSelectedTags(prev => {
      const newTags = prev.includes(tag) 
        ? prev.filter((t) => t !== tag) 
        : [...prev, tag]
      
      // 태그가 실제로 변경되었을 때만 페이지 리셋
      if (newTags.length !== prev.length || !prev.includes(tag) !== !newTags.includes(tag)) {
        setShouldResetPage(true)
      }
      
      return newTags
    })
  }, [])

  const [availableTags, setAvailableTags] = useState<TechStack[]>([])
  useEffect(() => {
    getTechStacks().then((tags) => {
      setAvailableTags(tags)
    })
  }, [])

  // Memoize tech tags rendering
  const techTags = useMemo(() => {
    return availableTags.map((tag) => (
      <TechTag
        key={tag.id + '-' + tag.name}
        tag={tag.name}
        isSelected={internalSelectedTags.includes(tag.name)}
        onClick={handleTagClick}
      />
    ))
  }, [availableTags, internalSelectedTags, handleTagClick])

  return (
    <Card className="h-fit">
      <CardHeader>
        <h2 className="text-lg font-semibold">필터</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">검색</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="스터디 검색..."
              className="pl-8"
              value={internalSearchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">스터디 장소</label>
          <Select
            value={internalLocationFilter || ""}
            onValueChange={handleLocationFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="모든 장소" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 장소</SelectItem>
              <SelectItem value="online">온라인</SelectItem>
              <SelectItem value="offline">오프라인</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">기술 태그</label>
          <div className="flex flex-wrap gap-2">
            {techTags}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}) 