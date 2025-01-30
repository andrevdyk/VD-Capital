"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type Chat = {
  id: string
  user_id: string
  other_user_id: string
  last_message: string | null
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  chat_id: string
  user_id: string
  content: string
  created_at: string
}

export async function fetchChats(userId: string): Promise<{ success: boolean; data: Chat[] | null; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching chats:", error)
    return { success: false, data: null, error: "Failed to fetch chats" }
  }

  return { success: true, data }
}

export async function fetchMessages(
  chatId: string,
): Promise<{ success: boolean; data: Message[] | null; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    return { success: false, data: null, error: "Failed to fetch messages" }
  }

  return { success: true, data }
}

interface SendMessageData {
  chatId: string
  userId: string
  content: string
}

export async function sendMessage({
  chatId,
  userId,
  content,
}: SendMessageData): Promise<{ success: boolean; data?: Message; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      user_id: userId,
      content,
    })
    .select()

  if (error) {
    console.error("Error sending message:", error)
    return { success: false, error: "Failed to send message" }
  }

  // Update the chat's last message and timestamp
  await supabase.from("chats").update({ last_message: content, updated_at: new Date().toISOString() }).eq("id", chatId)

  revalidatePath("/chats")
  return { success: true, data: data[0] }
}

