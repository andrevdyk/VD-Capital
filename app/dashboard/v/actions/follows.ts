"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleFollow(followerId: string, followingId: string) {
  const supabase = createClient()

  // Check if the follow relationship already exists
  const { data: existingFollow, error: checkError } = await supabase
    .from("follows")
    .select()
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle()

  if (checkError) {
    console.error("Error checking follow status:", checkError)
    return { success: false, error: "Failed to check follow status" }
  }

  let isFollowing: boolean

  if (existingFollow) {
    // Unfollow
    const { error: unfollowError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId)

    if (unfollowError) {
      console.error("Error unfollowing:", unfollowError)
      return { success: false, error: "Failed to unfollow" }
    }
    isFollowing = false
  } else {
    // Follow
    const { error: followError } = await supabase
      .from("follows")
      .insert({ follower_id: followerId, following_id: followingId })

    if (followError) {
      console.error("Error following:", followError)
      return { success: false, error: "Failed to follow" }
    }
    isFollowing = true
  }

  revalidatePath("/dashboard/v/profile/[id]")
  return { success: true, isFollowing }
}

export async function getFollowStatus(followerId: string, followingId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("follows")
    .select()
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle()

  if (error) {
    console.error("Error getting follow status:", error)
    return { success: false, error: "Failed to get follow status" }
  }

  return { success: true, isFollowing: !!data }
}

