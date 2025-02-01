"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type Post = {
  id: string
  content: string
  media_urls: string | null
  created_at: string
  user_id: string
  likes: number
  comments: number
  saves: number
  shares: number
  liked_by_user: boolean
  user: {
    id: string
    username: string
    avatar_url: string | null
  }
}

interface CreatePostData {
  userId: string
  content: string
  mediaUrls: string[]
}

export async function createPost({ userId, content, mediaUrls }: CreatePostData) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      content,
      media_urls: mediaUrls.length > 0 ? mediaUrls : null,
    })
    .select()

  if (error) {
    console.error("Error creating post:", error)
    return { success: false, error: "Failed to create post" }
  }

  revalidatePath("/dashboard/v")
  return { success: true, data: data[0] }
}

export async function fetchPosts(userId: string | undefined, page = 1, pageSize = 10) {
  const supabase = createClient()

  if (!userId) {
    console.error("Error: userId is undefined")
    return { success: false, error: "Invalid user ID" }
  }

  try {
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
      .select(`
        *,
        likes (user_id),
        profiles (id, username, avatar_url),
        comments:comments(count),
        saves:saves(count)
      `)
      .or(
        followingIds.length > 0
          ? `user_id.eq.${userId},user_id.in.(${followingIds.join(",")})`
          : `user_id.eq.${userId}`,
      )
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) {
      console.error("Error fetching posts:", error)
      return { success: false, error: `Failed to fetch posts: ${error.message}` }
    }

    console.log("Fetched posts data:", data)

    // Combine post data with user data
    const postsWithUserData = data.map((post) => ({
      ...post,
      liked_by_user: post.likes.some((like: { user_id: string }) => like.user_id === userId),
      likes: post.likes.length,
      comments: post.comments[0]?.count ?? 0,
      saves: post.saves[0]?.count ?? 0,
      user: post.profiles,
    }))

    return { success: true, data: postsWithUserData }
  } catch (error) {
    console.error("Unexpected error in fetchPosts:", error)
    return { success: false, error: `Unexpected error: ${(error as Error).message}` }
  }
}

export async function likePost(postId: string, userId: string) {
  const supabase = createClient()

  // Check if the user has already liked the post
  const { data: existingLike, error: likeCheckError } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single()

  if (likeCheckError && likeCheckError.code !== "PGRST116") {
    console.error("Error checking like status:", likeCheckError)
    return { success: false, error: "Failed to check like status" }
  }

  const action: "increment" | "decrement" = existingLike ? "decrement" : "increment"

  // Perform the like/unlike action
  const { data, error } = await supabase.rpc(action === "increment" ? "increment_likes" : "decrement_likes", {
    post_id: postId,
  })

  if (error) {
    console.error(`Error ${action === "increment" ? "liking" : "unliking"} post:`, error)
    return { success: false, error: `Failed to ${action === "increment" ? "like" : "unlike"} post` }
  }

  // Insert or delete the like record
  if (action === "increment") {
    await supabase.from("likes").insert({ post_id: postId, user_id: userId })
  } else {
    await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId)
  }

  // Fetch the updated post to get the new like count
  const { data: updatedPost, error: fetchError } = await supabase
    .from("posts")
    .select("likes")
    .eq("id", postId)
    .single()

  if (fetchError) {
    console.error("Error fetching updated post:", fetchError)
    return { success: false, error: "Failed to fetch updated post" }
  }

  revalidatePath("/dashboard/v")
  return { success: true, likes: updatedPost.likes, liked: action === "increment" }
}

export async function incrementShares(postId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("increment_shares", { post_id: postId }).select("shares").single()

  if (error) {
    console.error("Error incrementing shares:", error)
    return { success: false, error: "Failed to increment shares" }
  }

  return { success: true, shares: data.shares }
}

