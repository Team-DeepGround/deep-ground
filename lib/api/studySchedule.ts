import { api } from "@/lib/api-client"

export interface CreateStudyScheduleRequest {
    title: string
    startTime: string // ← ISO-8601 문자열 (LocalDateTime 형태)
    endTime: string
    description: string
    location?: string
    isAvailable?: boolean | null
    isImportant?: boolean
    memo?: string
  }

  export interface StudyScheduleResponseDto {
    id: number
    studyScheduleId: number
    title: string
    startTime: string
    endTime: string
    description: string
    location: string
    isAvailable?: boolean | null
    isImportant?: boolean
    memo?: string
  }

  export interface UpdateStudyScheduleRequest {
    title: string
    startTime: string
    endTime: string
    description: string
    location?: string
    isAvailable?: boolean | null
    isImportant?: boolean
    memo?: string
  }

  export interface Schedule {
    id: number
    studyScheduleId: number
    title: string
    startTime: string
    endTime: string
    description: string
    location: string
    date: string // extra field (추가됨)
    isAvailable?: "attending" | "not_attending" | null
    isImportant?: boolean
    memo?: string
  }
  
  export async function createStudySchedule(
    studyGroupId: number,
    data: CreateStudyScheduleRequest
  ): Promise<{ status: number; message: string; result: StudyScheduleResponseDto }> {
    const res = await api.post(`/study-group/${studyGroupId}/schedules`, data)
    return res as any
  }

  export const fetchStudySchedulesByGroup = async (
    studyGroupId: number
  ): Promise<StudyScheduleResponseDto[]> => {
    const res = await api.get(`/study-group/${studyGroupId}/schedules`)
  
    if (!res.result) {
      throw new Error("일정 목록이 비어 있습니다")
    }
  
    return res.result
  }

  export async function updateStudySchedule(
    studyGroupId: number,
    scheduleId: number,
    data: UpdateStudyScheduleRequest
  ): Promise<{ status: number; message: string; result: StudyScheduleResponseDto }> {
    const res = await api.patch(`/study-group/${studyGroupId}/schedules/${scheduleId}`, data)
    return res as any
  }

  export async function deleteStudySchedule(
    studyGroupId: number,
    scheduleId: number
  ): Promise<{ status: number; message: string }> {
    const response = await api.delete(`/study-group/${studyGroupId}/schedules/${scheduleId}`)
    return {
      status: 200,
      message: response.message || '일정이 성공적으로 삭제되었습니다.'
    }
  }

  // 변환 함수
export function convertToSchedule(dto: StudyScheduleResponseDto): Schedule {
  return {
    id: dto.id,  // memberStudyScheduleId 기준이라면 여기에 dto.memberStudyScheduleId
    studyScheduleId: dto.studyScheduleId,
    title: dto.title,
    startTime: dto.startTime,
    endTime: dto.endTime,
    description: dto.description,
    location: dto.location,
    date: dto.startTime.split("T")[0],
  }
  }
  