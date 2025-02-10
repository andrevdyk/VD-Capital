"use server"
import { createClient } from "@/utils/supabase/server"

export async function getChats(userId: string) {
  console.log("Getting chats for userId:", userId)
  const supabase = createClient()

  const { data: chats, error } = await supabase
    .from("chat")
    .select(`
      *,
      other_user:limited_profiles!other_user_id(display_name, avatar_url),
      created_by:limited_profiles!created_by(id, display_name, avatar_url),
      messages:messages(id, seen_at)
    `)
    .or(`other_user_id.eq.${userId},created_by.eq.${userId}`)

  if (error) {
    console.error("Error fetching chats:", error)
    return null
  }

  console.log("Raw chats data:", chats)

  const processedChats = chats.map((chat) => ({
    ...chat,
    name: chat.other_user?.display_name || "Unknown User",
    avatar_url: chat.other_user?.avatar_url,
    unread_count: chat.messages.filter((message: { seen_at: null | string }) => message.seen_at === null).length,
  }))

  console.log("Processed chats:", processedChats)
  return processedChats
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
  console.log("Fetching messages for chat:", chatId)
  if (!chatId) {
    console.error("Invalid chatId provided to getMessages")
    return null
  }
  const supabase = createClient()
  const { data: messages, error } = await supabase
    .from("messages")
    .select(`
      *,
      profile:limited_profiles(display_name, avatar_url)
    `)
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    return null
  }

  console.log("Raw messages data:", messages)

  const processedMessages = messages.map((message) => ({
    ...message,
    profile: message.profile || { display_name: "Unknown User", avatar_url: null },
  }))

  console.log("Processed messages:", processedMessages)
  return processedMessages
}

export async function createChat(userId: string, otherUserId: string) {
  const supabase = createClient()
  const newChatData = {
    created_by: userId,
    is_group: false,
    other_user_id: otherUserId,
    members: [userId, otherUserId],
    admins: [userId],
    name: null,
    avatar_url: null,
  }

  console.log("Attempting to create chat with data:", newChatData)
  const { data, error } = await supabase.from("chat").insert(newChatData).select().single()

  if (error) {
    console.error("Error creating chat:", error)
    return { error }
  }

  return { data }
}

export async function sendMessage(chatId: string, userId: string, content: string) {
  console.log("Sending message with chatId:", chatId, "userId:", userId, "content:", content)
  const supabase = createClient()
  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      profile_id: userId,
      content: content,
    })
    .select()
    .single()

  if (error) {
    console.error("Error sending message:", error)
    return { error }
  }

  console.log("Message sent successfully:", data)
  return { data }
}

