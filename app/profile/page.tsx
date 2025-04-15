"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function ProfilePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  
  // 프로필 정보 상태
  const [profile, setProfile] = useState({
    nickname: "개발자123",
    email: user?.email || "user@example.com",
    bio: "풀스택 개발자입니다. React, Next.js, Node.js를 주로 사용합니다.",
    techStack: ["React", "Next.js", "Node.js", "TypeScript"],
    links: {
      github: "https://github.com/username",
      linkedin: "https://linkedin.com/in/username",
      website: "https://mywebsite.com",
      twitter: "https://twitter.com/username"
    }
  })
  
  // 기술 스택 관리
  const [newTech, setNewTech] = useState("")
  
  const handleAddTech = () => {
    if (newTech.trim() && !profile.techStack.includes(newTech.trim())) {
      setProfile({
        ...profile,
        techStack: [...profile.techStack, newTech.trim()]
      })
      setNewTech("")
    }
  }
