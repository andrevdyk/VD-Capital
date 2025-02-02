"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateGroupData {
  name: string
  isPrivate: boolean
  createdBy: string
  members: string[]
}

export type Group = {
  id: string
  name: string
  is_private: boolean
  created_by: string
  created_at: string
  updated_at: string
  member_ids: string[]
  creatorInfo?: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
  }
}

export async function createGroup({
  name,
  isPrivate,
  createdBy,
  members,
}: CreateGroupData): Promise<{ success: boolean; data: Group | null; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("groups")
      .insert({
        name,
        is_private: isPrivate,
        created_by: createdBy,
        member_ids: [createdBy, ...members],
      })
      .select()
      .single()

    if (error) throw error

    console.log("Group created successfully:", data)
    revalidatePath("/dashboard/v/chats")
    return { success: true, data }
  } catch (error) {
    console.error("Error creating group:", error)
    return { success: false, data: null, error: (error as Error).message }
  }
}

export async function fetchGroups(userId: string): Promise<{ success: boolean; data: Group[] | null; error?: string }> {
  const supabase = createClient()

  try {
    console.log("Fetching groups for userId:", userId)

    const { data: groupsData, error: groupsError } = await supabase
      .from("groups")
      .select(`
        *,
        created_by (
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .or(`created_by.eq.${userId},member_ids.cs.{${userId}}`)

    if (groupsError) throw groupsError

    console.log("Fetched groups:", groupsData)

    const groups: Group[] = groupsData.map((group) => ({
      ...group,
      created_by: group.created_by.id,
      creatorInfo: {
        id: group.created_by.id,
        username: group.created_by.username,
        displayName: group.created_by.display_name,
        avatarUrl: group.created_by.avatar_url,
      },
    }))

    return { success: true, data: groups }
  } catch (error) {
    console.error("Error fetching groups:", error)
    return { success: false, data: null, error: (error as Error).message }
  }
}

export async function searchGroups(
  searchTerm: string,
): Promise<{ success: boolean; data: Group[] | null; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .ilike("name", `%${searchTerm}%`)
    .eq("is_private", false)

  if (error) {
    console.error("Error searching groups:", error)
    return { success: false, data: null, error: "Failed to search groups" }
  }

  return { success: true, data }
}

export async function addGroupMember(groupId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.rpc("add_group_member", { group_id: groupId, user_id: userId })

    if (error) throw error

    revalidatePath("/dashboard/v/chats")
    return { success: true }
  } catch (error) {
    console.error("Error adding group member:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function removeGroupMember(
  groupId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.rpc("remove_group_member", { group_id: groupId, user_id: userId })

    if (error) throw error

    revalidatePath("/dashboard/v/chats")
    return { success: true }
  } catch (error) {
    console.error("Error removing group member:", error)
    return { success: false, error: (error as Error).message }
  }
}

