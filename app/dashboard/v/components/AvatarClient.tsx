"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AvatarClientProps {
  avatarUrl: string | null
  username: string
}

export function AvatarClient({ avatarUrl, username }: AvatarClientProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Avatar className="w-24 h-24 border-4 border-background">
      <AvatarImage
        src={imageError ? "/placeholder.svg" : `${avatarUrl}?t=${Date.now()}`}
        alt="Profile Avatar"
        onError={() => setImageError(true)}
      />
      <AvatarFallback>{username[0]}</AvatarFallback>
    </Avatar>
  )
}

