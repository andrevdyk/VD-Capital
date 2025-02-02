"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type Profile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  updated_at: string | null
  cover_image_url: string | null
}

export async function searchUsers(searchTerm: string, currentUserId: string) {
  const supabase = createClient()

  console.log(`Searching for users with term: ${searchTerm}, currentUserId: ${currentUserId}`)

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
    .neq("id", currentUserId)
    .limit(10)

  if (error) {
    console.error("Error searching users:", error)
    return { success: false, error: "Failed to search users" }
  }

  console.log("Search results:", data)
  return { success: true, data }
}

export async function fetchProfiles(): Promise<{ success: boolean; data: Profile[] | null; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").select("*")

  if (error) {
    console.error("Error fetching profiles:", error)
    return { success: false, data: null, error: "Failed to fetch profiles" }
  }

  return { success: true, data }
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select()

  if (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "Failed to update profile" }
  }

  return { success: true, data: data[0] }
}

export async function createProfile({
  userId,
  username,
  displayName,
  avatarUrl,
}: {
  userId: string
  username: string
  displayName: string
  avatarUrl?: string
}) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username,
      display_name: displayName,
      avatar_url: avatarUrl || null,
    })
    .select()

  if (error) {
    console.error("Error creating profile:", error)
    return { success: false, error: "Failed to create profile" }
  }

  revalidatePath("/")
  return { success: true, data: data[0] }
}

export async function getProfile(userId: string): Promise<{ success: boolean; data: Profile | null; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, updated_at, cover_image_url")
    .eq("id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // Profile not found
      return { success: false, data: null, error: "Profile not found" }
    }
    console.error("Error fetching profile:", error)
    return { success: false, data: null, error: "Failed to fetch profile" }
  }

  return { success: true, data }
}

