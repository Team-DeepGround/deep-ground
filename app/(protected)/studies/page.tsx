"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { api } from "@/lib/api-client"
import { StudyList } from "@/components/studies/StudyList"

interface StudyGroup {
  id: number;
  title: string;
  description: string;
  period: string;
  recruitmentPeriod: string;
  tags: { id: number; name: string }[];
  maxMembers: number;
  currentMembers: number;
  organizer: {
    name: string;
    avatar: string;
  };
  isOnline: boolean;
  location: string;
}

interface StudyGroupSearchResponse {
  status: number;
  message: string;
  result: {
    content: StudyGroup[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
      };
      offset: number;
      unpaged: boolean;
      paged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    first: boolean;
    size: number;
    number: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
  };
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

export default function StudiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [locationFilter, setLocationFilter] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<string>("latest")
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [activeTab, setActiveTab] = useState<"all" | "recruiting" | "ongoing">("all")

  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // 페이지당 표시할 항목 수
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(false)

  // Debounce search term to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Memoize API parameters to prevent unnecessary API calls
  const apiParams = useMemo(() => {
    const params: any = {
      page: String(currentPage - 1),
      size: String(itemsPerPage),
    };

    if (debouncedSearchTerm) {
      params.keyword = debouncedSearchTerm;
    }

    // 탭에 따른 상태 필터링
    if (activeTab === "recruiting") {
      params.groupStatus = "RECRUITING"
    } else if (activeTab === "ongoing") {
      params.groupStatus = "ONGOING"
    }

    if (selectedTags.length > 0) {
      params.techStackNames = selectedTags;
    }

    if (locationFilter === 'online') {
      params.onOffline = 'ONLINE';
    } else if (locationFilter === 'offline') {
      params.onOffline = 'OFFLINE';
    } else {
      params.onOffline = 'ALL';
    }

    return params;
  }, [debouncedSearchTerm, currentPage, selectedTags, activeTab, locationFilter]);

  // Memoize fetch function to prevent unnecessary re-creation
  const fetchStudyGroups = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/study-group/search', {
        params: apiParams
      }) as StudyGroupSearchResponse;
      setStudyGroups(response.result.content)
      setTotalPages(response.result.totalPages)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }, [apiParams]);

  useEffect(() => {
    fetchStudyGroups()
  }, [fetchStudyGroups])

  // Memoize callback functions to prevent unnecessary re-renders
  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }, [])

  const handleSelectedTagsChange = useCallback((tags: string[]) => {
    setSelectedTags(tags)
    setCurrentPage(1)
  }, [])

  const handleLocationFilterChange = useCallback((filter: string | null) => {
    setLocationFilter(filter)
    setCurrentPage(1)
  }, [])

  const handleSortOrderChange = useCallback((order: string) => {
    setSortOrder(order)
  }, [])

  const handleActiveTabChange = useCallback((tab: "all" | "recruiting" | "ongoing") => {
    setActiveTab(tab)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // Memoize StudyList props to prevent unnecessary re-renders
  const studyListProps = useMemo(() => ({
    studies: studyGroups,
    isLoading,
    searchTerm,
    onSearchTermChange: handleSearchTermChange,
    selectedTags,
    onSelectedTagsChange: handleSelectedTagsChange,
    locationFilter,
    onLocationFilterChange: handleLocationFilterChange,
    sortOrder,
    onSortOrderChange: handleSortOrderChange,
    activeTab,
    onActiveTabChange: handleActiveTabChange,
    currentPage,
    totalPages,
    onPageChange: handlePageChange
  }), [
    studyGroups,
    isLoading,
    searchTerm,
    handleSearchTermChange,
    selectedTags,
    handleSelectedTagsChange,
    locationFilter,
    handleLocationFilterChange,
    sortOrder,
    handleSortOrderChange,
    activeTab,
    handleActiveTabChange,
    currentPage,
    totalPages,
    handlePageChange
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">스터디 찾기</h1>
          <p className="text-muted-foreground mt-1">관심 있는 스터디를 찾아보세요</p>
        </div>
        <Button asChild>
          <Link href="/studies/create">
            <Plus className="mr-2 h-4 w-4" />
            스터디 개설하기
          </Link>
        </Button>
      </div>

      <StudyList {...studyListProps} />
    </div>
  )
}
