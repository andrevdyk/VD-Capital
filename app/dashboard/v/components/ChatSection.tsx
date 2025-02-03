"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchMessages, sendMessage, type Message as MessageType } from "../actions/chats"
import { Message } from "./Message"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchGroup, type Channel } from "../actions/channels"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/utils/supabase/client"

export function ChatSection({ userId, groupId }: { userId: string; groupId: string }) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadChannels = async () => {
      if (groupId) {
        const group = await fetchGroup(groupId)
        if (group) {
          setChannels([...(group.text_channels || []), ...(group.voice_channels || [])])
        }
      }
    }
    loadChannels()
  }, [groupId])

  useEffect(() => {
    if (selectedChannel) {
      const loadMessages = async () => {
        const result = await fetchMessages(selectedChannel)
        if (result.success && result.data) {
          setMessages(result.data)
        } else {
          console.error("Error fetching messages:", result.error)
        }
      }
      loadMessages()

      // Subscribe to new messages
      const subscription = supabase
        .channel(`public:messages:channel_id=eq.${selectedChannel}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `channel_id=eq.${selectedChannel}`,
          },
          (payload) => {
            const newMessage = payload.new as MessageType
            setMessages((prevMessages) => [...prevMessages, newMessage])
          },
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    } else {
      setMessages([])
    }
  }, [selectedChannel, supabase])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [scrollAreaRef]) //Corrected dependency

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChannel || !newMessage.trim()) return

    const result = await sendMessage({
      groupId,
      channelId: selectedChannel,
      userId,
      content: newMessage.trim(),
    })

    if (result.success && result.data) {
      setNewMessage("")
    } else {
      console.error("Error sending message:", result.error, result.details)
      toast({
        title: "Error",
        description: result.error || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
        <Select onValueChange={(value) => setSelectedChannel(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a channel" />
          </SelectTrigger>
          <SelectContent>
            {channels.map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <ScrollArea className="flex-grow mb-4" ref={scrollAreaRef}>
          {messages.map((message) => (
            <Message
              key={message.id}
              content={message.content}
              isCurrentUser={message.user_id === userId}
              user={message.user}
            />
          ))}
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={selectedChannel ? "Type a message..." : "Select a channel to send a message"}
            className="flex-grow"
            disabled={!selectedChannel}
          />
          <Button type="submit" disabled={!selectedChannel}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

