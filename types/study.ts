export interface Reply {
  replyId: number
  nickname: string
  content: string
  createdAt: string
}

export interface Comment {
  commentId: number
  nickname: string
  content: string
  createdAt: string
  replies: Reply[]
}

export interface Participant {
  memberId: number
  profileId: number
  nickname: string
}

export interface StudyGroupDetail {
  id: number
  title: string
  explanation: string
  writer: string
  memberCount: number
  groupLimit: number
  location: string
  recruitStartDate: string
  recruitEndDate: string
  studyStartDate: string
  studyEndDate: string
  commentCount: number
  participants: Participant[]
  comments: Comment[]
  offline: boolean
  sessions: StudySession[]
  memberStatus: "NOT_APPLIED" | "PENDING" | "APPROVED"
}

export interface StudySession {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  participants: string[]
}
