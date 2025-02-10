"use server"
import { createClient } from "@/utils/supabase/server"

export async function getChats(userId: string) {
  const supabase = createClient()
  const { data: chats, error } = await supabase.from("chat").select("*").eq("id", userId)

  if (error) {
    console.error("Error fetching chats:", error)
    return null
  }

  return chats
}

export async function getLimitedProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("limited_profiles")
    .select("id, username, display_name, avatar_url")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching limited profile:", error)
    return null
  }

  return data
}

export async function getMessages(chatId: string) {
  const supabase = createClient()
  const { data: messages, error } = await supabase.from("messages").select("*").eq("chat_id", chatId)

  if (error) {
    console.error("Error fetching messages:", error)
    return null
  }

  return messages
}

export async function createChat(userId: string, otherUserId: string) {
  const supabase = createClient()
  const newChatData = {
    created_by: userId,
    is_group: false,
    other_user_id: otherUserId,
    members: [userId, otherUserId],
    admins: [userId], // Add the creator as an admin
    name: null,
    avatar_url: null,
  }

  const { data, error } = await supabase.from("chat").insert(newChatData).select().single()

  if (error) {
    console.error("Error creating chat:", error)
    return { error }
  }

  return { data }
}

