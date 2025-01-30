"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchChats, fetchMessages, sendMessage, type Chat, type Message } from "../actions/chats"
import { fetchProfiles, type Profile } from "../actions/users"

export function ChatSection({ userId }: { userId: string }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    const loadChats = async () => {
      const result = await fetchChats(userId)
      if (result.success && result.data) {
        setChats(result.data)
      } else {
        console.error("Error fetching chats:", result.error)
        setChats([])
      }
    }
    loadChats()
  }, [userId])

  useEffect(() => {
    const loadProfiles = async () => {
      const result = await fetchProfiles()
      if (result.success && result.data) {
        const profileMap = result.data.reduce(
          (acc, profile) => {
            acc[profile.id] = profile
            return acc
          },
          {} as Record<string, Profile>,
        )
        setProfiles(profileMap)
      } else {
        console.error("Error fetching profiles:", result.error)
        setProfiles({})
      }
    }
    loadProfiles()
  }, [])

  useEffect(() => {
    if (selectedChat) {
      const loadMessages = async () => {
        const result = await fetchMessages(selectedChat.id)
        if (result.success && result.data) {
          setMessages(result.data)
        } else {
          console.error("Error fetching messages:", result.error)
          setMessages([])
        }
      }
      loadMessages()
    }
  }, [selectedChat])

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return

    const result = await sendMessage({
      chatId: selectedChat.id,
      userId,
      content: newMessage.trim(),
    })

    if (result.success && result.data) {
      setMessages((prevMessages) => [...prevMessages, result.data])
      setNewMessage("")
      setChats(
        chats.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, last_message: newMessage.trim(), updated_at: new Date().toISOString() }
            : chat,
        ),
      )
    } else {
      console.error("Error sending message:", result.error)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/3 border-r">
        <ScrollArea className="h-full">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className={`m-2 cursor-pointer ${selectedChat?.id === chat.id ? "bg-secondary" : ""}`}
              onClick={() => setSelectedChat(chat)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={profiles[chat.other_user_id]?.avatar_url || undefined} />
                    <AvatarFallback>{profiles[chat.other_user_id]?.username?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{profiles[chat.other_user_id]?.username || "Unknown User"}</div>
                    <div className="text-sm text-muted-foreground">{chat.last_message}</div>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </ScrollArea>
      </div>
      <div className="w-2/3 flex flex-col">
        {selectedChat ? (
          <>
            <ScrollArea className="flex-grow p-4">
              {messages.map((message) => (
                <div key={message.id} className={`mb-4 ${message.user_id === userId ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      message.user_id === userId ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </ScrollArea>
            <div className="p-4 border-t flex">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow mr-2"
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

