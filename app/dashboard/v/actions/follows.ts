"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function followUser(followerId: string, followingId: string) {
  const supabase = createClient()

  const { error } = await supabase.from("follows").insert({
    follower_id: followerId,
    following_id: followingId,
  })

  if (error) {
    console.error("Error following user:", error)
    return { success: false, error: "Failed to follow user" }
  }

  revalidatePath("/dashboard/v")
  return { success: true }
}

export async function unfollowUser(followerId: string, followingId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("follows")
    .delete()
    .match({ follower_id: followerId, following_id: followingId })

  if (error) {
    console.error("Error unfollowing user:", error)
    return { success: false, error: "Failed to unfollow user" }
  }

  revalidatePath("/dashboard/v")
  return { success: true }
}

export async function getFollowingCount(userId: string) {
  const supabase = createClient()

  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId)

  if (error) {
    console.error("Error getting following count:", error)
    return { success: false, error: "Failed to get following count" }
  }

  return { success: true, count }
}

export async function getFollowersCount(userId: string) {
  const supabase = createClient()

  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId)

  if (error) {
    console.error("Error getting followers count:", error)
    return { success: false, error: "Failed to get followers count" }
  }

  return { success: true, count }
}

