// components/admin/InquiryStatusBadge.tsx
import { Badge } from "@/components/ui/badge"
import { type InquiryStatus } from "@/lib/api/admin-inquiries"

export default function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  const map: Record<InquiryStatus, { label: string; variant?: "default" | "secondary" | "destructive" | "outline" }> = {
    PENDING: { label: "접수", variant: "secondary" },
    IN_PROGRESS: { label: "진행중", variant: "default" },
    ANSWERED: { label: "답변완료", variant: "outline" },
    CLOSED: { label: "종결", variant: "destructive" },
  }
  const v = map[status] ?? { label: status }
  return <Badge variant={v.variant}>{v.label}</Badge>
}
