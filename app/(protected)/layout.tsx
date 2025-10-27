"use client"

import RequireProfile from "@/components/guards/require-profile"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <RequireProfile>{children}</RequireProfile>
}
