"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

interface CreatePostData {
  userId: string
  content: string
  mediaUrl: string | null
}

export async function createPost({ userId, content, mediaUrl }: CreatePostData) {
  const supabase = createClient()

  const { error } = await supabase.from("posts").insert({
    user_id: userId,
    content,
    media_url: mediaUrl,
  })

  if (error) {
    console.error("Error creating post:", error)
    return { success: false, error: "Failed to create post" }
  }

  revalidatePath("/dashboard/v")
  return { success: true }
}

export async function fetchPosts(userId: string | undefined, page = 1, pageSize = 10) {
  const supabase = createClient()

  if (!userId) {
    console.error("Error: userId is undefined")
    return { success: false, error: "Invalid user ID" }
  }

  // First, get the list of users the current user is following
  const { data: followingData, error: followingError } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)

  if (followingError) {
    console.error("Error fetching following list:", followingError, "for userId:", userId)
    return { success: false, error: "Failed to fetch following list" }
  }

  const followingIds = Array.from(new Set(followingData?.map((f) => f.following_id).filter(Boolean) || []))

  // Then, fetch posts from these users and the current user
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .or(
      followingIds.length > 0 ? `user_id.eq.${userId},user_id.in.(${followingIds.join(",")})` : `user_id.eq.${userId}`,
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) {
    console.error("Error fetching posts:", error)
    return { success: false, error: "Failed to fetch posts" }
  }

  // Fetch user data for the posts
  const userIds = Array.from(new Set(data.map((post) => post.user_id)))
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", userIds)

  if (userError) {
    console.error("Error fetching user data:", userError)
    return { success: false, error: "Failed to fetch user data" }
  }

  // Combine post data with user data
  const postsWithUserData = data.map((post) => ({
    ...post,
    user: userData.find((user) => user.id === post.user_id),
  }))

  return { success: true, data: postsWithUserData }
}

export async function likePost(postId: string) {
  const supabase = createClient()

  const { error } = await supabase.rpc("increment_likes", { post_id: postId })

  if (error) {
    console.error("Error liking post:", error)
    return { success: false, error: "Failed to like post" }
  }

  revalidatePath("/dashboard/v")
  return { success: true }
}

