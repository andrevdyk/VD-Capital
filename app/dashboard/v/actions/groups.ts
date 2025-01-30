"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateGroupData {
  name: string
  isPrivate: boolean
  createdBy: string
}

export async function createGroup({ name, isPrivate, createdBy }: CreateGroupData) {
  const supabase = createClient()

  const { error } = await supabase.from("groups").insert({
    name,
    is_private: isPrivate,
    created_by: createdBy,
  })

  if (error) {
    console.error("Error creating group:", error)
    return { success: false, error: "Failed to create group" }
  }

  revalidatePath("/dashboard/v/chats")
  return { success: true }
}

export async function fetchGroups(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("groups").select("*").or(`created_by.eq.${userId},members.cs.{${userId}}`)

  if (error) {
    console.error("Error fetching groups:", error)
    return { success: false, error: "Failed to fetch groups" }
  }

  return { success: true, data }
}

