"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchMessages, sendMessage, type Message } from "../actions/chats"

export function ChatSection({ userId }: { userId: string }) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (selectedChat) {
      const loadMessages = async () => {
        const result = await fetchMessages(selectedChat)
        if (result.success && result.data) {
          setMessages(result.data)
        } else {
          console.error("Error fetching messages:", result.error)
        }
      }
      loadMessages()
    }
  }, [selectedChat])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChat || !newMessage.trim()) return

    const result = await sendMessage({
      chatId: selectedChat,
      userId,
      content: newMessage.trim(),
    })

    if (result.success && result.data) {
      setMessages((prevMessages) => [...prevMessages, result.data as Message])
      setNewMessage("")
    } else {
      console.error("Error sending message:", result.error)
    }
  }

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <ScrollArea className="flex-grow mb-4">
          {messages.map((message) => (
            <div key={message.id} className={`mb-4 ${message.user_id === userId ? "text-right" : "text-left"}`}>
              <div className="flex items-start space-x-2">
                <Avatar>
                  <AvatarImage src={message.user.avatar_url || undefined} />
                  <AvatarFallback>{message.user.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{message.user.username}</p>
                  <p>{message.content}</p>
                  <p className="text-sm text-muted-foreground">{new Date(message.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardContent>
    </Card>
  )
}

