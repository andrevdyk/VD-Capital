"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchChats, type Chat } from "../actions/chats"
import { cn } from "@/lib/utils"

export function ChatList({ userId, limit }: { userId: string; limit?: number }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)

  useEffect(() => {
    const loadChats = async () => {
      const result = await fetchChats(userId)
      if (result.success && result.data) {
        setChats(limit ? result.data.slice(0, limit) : result.data)
      } else {
        console.error("Error fetching chats:", result.error)
      }
    }
    loadChats()
  }, [userId, limit])

  return (
    <div className="space-y-2 px-4">
      {chats.map((chat) => (
        <Card
          key={chat.id}
          className={cn("cursor-pointer hover:bg-accent transition-colors", activeChat === chat.id && "bg-accent")}
          onClick={() => setActiveChat(chat.id)}
        >
          <CardHeader className="p-3">
            <CardTitle className="flex items-center space-x-2 text-sm font-medium">
              <Avatar className="h-8 w-8">
                <AvatarImage src={chat.user.avatar_url || undefined} />
                <AvatarFallback>{chat.user.username[0]}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden flex-1">
                <div className="truncate">{chat.user.username}</div>
                <div className="text-xs text-muted-foreground truncate">{chat.last_message}</div>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

