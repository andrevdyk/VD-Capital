"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type Channel = {
  id: string
  name: string
  type: "text" | "voice"
}

export type Event = {
  id: string
  name: string
  date: string
}

export type Group = {
  id: string
  name: string
  text_channels: Channel[]
  voice_channels: Channel[]
  events: Event[]
}

export async function fetchGroup(groupId: string): Promise<Group | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("groups").select("*").eq("id", groupId).single()

  if (error) {
    console.error("Error fetching group:", error)
    return null
  }

  return {
    ...data,
    text_channels: Array.isArray(data.text_channels) ? data.text_channels : JSON.parse(data.text_channels || "[]"),
    voice_channels: Array.isArray(data.voice_channels) ? data.voice_channels : JSON.parse(data.voice_channels || "[]"),
    events: Array.isArray(data.events) ? data.events : JSON.parse(data.events || "[]"),
  }
}

export async function addChannel(groupId: string, channel: Omit<Channel, "id">): Promise<boolean> {
  const supabase = createClient()
  console.log("Adding channel:", { groupId, channel })
  const { data, error } = await supabase.rpc("add_channel_to_group", {
    p_group_id: groupId,
    p_channel_name: channel.name,
    p_channel_type: channel.type,
  })
  console.log("Add channel result:", { data, error })

  if (error) {
    console.error("Error adding channel:", error)
    return false
  }

  revalidatePath("/dashboard/v/chats")
  return true
}

export async function updateChannel(
  groupId: string,
  channelId: string,
  newName: string,
  channelType: "text" | "voice",
): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.rpc("update_channel_in_group", {
    p_group_id: groupId,
    p_channel_id: channelId,
    p_new_name: newName,
    p_channel_type: channelType,
  })

  if (error) {
    console.error("Error updating channel:", error)
    return false
  }

  revalidatePath("/dashboard/v/chats")
  return true
}

export async function deleteChannel(
  groupId: string,
  channelId: string,
  channelType: "text" | "voice",
): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.rpc("delete_channel_from_group", {
    p_group_id: groupId,
    p_channel_id: channelId,
    p_channel_type: channelType,
  })

  if (error) {
    console.error("Error deleting channel:", error)
    return false
  }

  revalidatePath("/dashboard/v/chats")
  return true
}

export async function addEvent(groupId: string, event: Omit<Event, "id">): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.rpc("add_event_to_group", {
    p_group_id: groupId,
    p_event_name: event.name,
    p_event_date: event.date,
  })

  if (error) {
    console.error("Error adding event:", error)
    return false
  }

  revalidatePath("/dashboard/v/chats")
  return true
}

