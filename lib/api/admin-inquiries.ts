// lib/api/admin-inquiries.ts
import { api } from "@/lib/api-client"

export type InquiryStatus = "PENDING" | "IN_PROGRESS" | "ANSWERED" | "CLOSED"

export interface AdminInquirySummary {
  id: number
  title: string
  status: InquiryStatus
  createdAt: string
}

export interface AdminInquiryAnswer {
  id: number
  inquiryId: number
  adminId: number
  adminNickname: string
  content: string
  createdAt: string
}

export interface AdminInquiryDetail {
  id: number
  title: string
  content: string
  status: InquiryStatus
  createdAt: string
  updatedAt: string
  answers: AdminInquiryAnswer[]
}

export async function fetchAdminInquiryList(status?: InquiryStatus) {
  const res = await api.get<{ result: AdminInquirySummary[] }>("/admin/inquiries", {
    params: status ? { status } : undefined,
  })
  return res.result ?? []
}

export async function fetchAdminInquiryDetail(id: string | number) {
  const res = await api.get<{ result: AdminInquiryDetail }>(`/admin/inquiries/${id}`)
  return res.result
}

export async function postAdminInquiryAnswer(id: string | number, content: string) {
  const res = await api.post(`/admin/inquiries/${id}/answers`, { content })
  return res.result
}

export async function patchAdminInquiryStatus(id: string | number, status: InquiryStatus) {
  const res = await api.patch(`/admin/inquiries/${id}/status`, undefined, {
    params: { status },
  })
  return res.result
}
