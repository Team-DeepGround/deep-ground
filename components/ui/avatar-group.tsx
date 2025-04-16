"use client"

import * as React from "react"

const AvatarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className="flex -space-x-2 rtl:space-x-reverse" ref={ref} {...props} />
  },
)
AvatarGroup.displayName = "AvatarGroup"

export { AvatarGroup }
