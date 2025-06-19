import { api } from "../api-client"
import { auth } from "@/lib/auth"
import type { ApiResponse } from "@/lib/api-types"

// 일정 전체 조회용 타입
export interface MemberScheduleCalendarResponseDto {
  memberStudyScheduleId: number
  studyScheduleId: number
  // studyId: number
  title: string
  startTime: string
  endTime: string
}

// 일정 상세 조회용 타입
export interface MemberScheduleDetailResponseDto {
  memberStudyScheduleId: number
  studyScheduleId: number
  title: string
  startTime: string
  endTime: string
  description: string
  location: string
  isAvailable: boolean
  isImportant: boolean
  memo: string
}

// 로그인한 사용자의 모든 일정 조회
export async function fetchMySchedules(): Promise<MemberScheduleCalendarResponseDto[]> {
  const token = await auth.getToken()

  const res = await fetch("/api/calendar/my-schedules", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  })

  if (!res.ok) {
    throw new Error("일정 목록을 불러오지 못했습니다")
  }

  const json: ApiResponse<MemberScheduleCalendarResponseDto[]> = await res.json()

  if (!json.result) {
    throw new Error("일정 목록이 비어 있습니다")
  }

  return json.result
}

// 상세 조회
export const fetchScheduleDetail = async (
  memberStudyScheduleId: number
): Promise<MemberScheduleDetailResponseDto> => {
  const res = await api.get<ApiResponse<MemberScheduleDetailResponseDto>>(
    `/calendar/my-schedules/${memberStudyScheduleId}`
  );

  if (!res.result) {
    throw new Error("상세 일정을 찾을 수 없습니다.");
  }

  return res.result;
}

// 일정 상태 및 메모 수정
export const updateMemberSchedule = async (
  memberStudyScheduleId: number,
  data: {
    attendance?: "attending" | "not_attending" | "pending"
    isImportant?: boolean
    memo?: string
    isAvailable?: boolean
  }
): Promise<MemberScheduleDetailResponseDto> => {
  const res = await api.patch<ApiResponse<MemberScheduleDetailResponseDto>>(
    `/calendar/my-schedules/${memberStudyScheduleId}`,
    data
  )

  if (!res.result) {
    throw new Error("일정 수정 결과가 없습니다")
  }

  return res.result
}
