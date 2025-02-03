"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type Message = {
  id: string
  group_id: string
  channel_id: string
  user_id: string
  content: string
  created_at: string
  user: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export type Chat = {
  id: string
  user: {
    id: string
    username: string
    avatar_url: string | null
  }
  last_message: string | null
  updated_at: string
}

export async function fetchChats(userId: string): Promise<{ success: boolean; data: Chat[] | null; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("chats")
    .select(`
      id,
      last_message,
      updated_at,
      user:profiles!chats_other_user_id_fkey(id, username, avatar_url)
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching chats:", error)
    return { success: false, data: null, error: "Failed to fetch chats" }
  }

  const chats: Chat[] = data.map((item: any) => ({
    id: item.id,
    user: {
      id: item.user[0].id,
      username: item.user[0].username,
      avatar_url: item.user[0].avatar_url,
    },
    last_message: item.last_message,
    updated_at: item.updated_at,
  }))

  return { success: true, data: chats }
}

export async function fetchMessages(
  channelId: string,
): Promise<{ success: boolean; data: Message[] | null; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      user:profiles(id, username, avatar_url)
    `)
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    return { success: false, data: null, error: "Failed to fetch messages" }
  }

  return { success: true, data }
}

interface SendMessageData {
  groupId: string
  channelId: string
  userId: string
  content: string
}

export async function sendMessage({ groupId, channelId, userId, content }: SendMessageData) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("messages")
    .upsert({
      group_id: groupId,
      channel_id: channelId,
      user_id: userId,
      content,
    })
    .select(`
      *,
      user:profiles(id, username, avatar_url)
    `)
    .single()

  if (error) {
    console.error("Error sending message:", error)
    return {
      success: false,
      error: `Failed to send message: ${error.message}`,
      details: error,
    }
  }

  revalidatePath("/dashboard/v/chats")
  return { success: true, data }
}

