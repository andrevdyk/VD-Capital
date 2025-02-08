"use server"

import { createClient } from "@/utils/supabase/server"

export type UserProfile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

export async function searchUserProfiles(searchTerm: string): Promise<UserProfile[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
    .limit(10)

  if (error) {
    console.error("Error searching user profiles:", error)
    return []
  }

  return data
}

