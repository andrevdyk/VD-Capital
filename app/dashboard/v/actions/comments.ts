"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type Comment = {
  id: string
  content: string
  created_at: string
  user: {
    id: string
    username: string
    avatar_url: string | null
  } | null
}

type CommentResponse = {
  id: string
  content: string
  created_at: string
  user: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export async function fetchComments(
  postId: string,
): Promise<{ success: boolean; data: Comment[] | null; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("comments")
    .select(`
      id,
      content,
      created_at,
      user:profiles!inner (id, username, avatar_url)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching comments:", error)
    return { success: false, data: null, error: "Failed to fetch comments" }
  }

  // Transform the data to match the Comment type and handle potential missing user data
  const transformedData: Comment[] = data.map((comment: any) => ({
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    user: comment.user
      ? {
          id: comment.user.id,
          username: comment.user.username || "Unknown User",
          avatar_url: comment.user.avatar_url,
        }
      : null,
  }))

  return { success: true, data: transformedData }
}

interface CreateCommentData {
  postId: string
  userId: string
  content: string
}

export async function createComment({
  postId,
  userId,
  content,
}: CreateCommentData): Promise<{ success: boolean; data?: Comment; error?: string }> {
  const supabase = createClient()

  try {
    // First, ensure the user exists in the public.profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", userId)
      .single()

    if (profileError || !profileData) {
      console.error("User profile not found:", profileError)
      return { success: false, error: "User profile not found" }
    }

    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content,
      })
      .select(`
        id,
        content,
        created_at,
        user:profiles!inner (id, username, avatar_url)
      `)
      .single()

    if (commentError || !commentData) {
      console.error("Supabase error creating comment:", commentError)
      return { success: false, error: `Failed to create comment: ${commentError?.message}` }
    }

    // Cast the response to our known type
    const response = commentData as unknown as CommentResponse

    // Transform the data to match the Comment type
    const transformedData: Comment = {
      id: response.id,
      content: response.content,
      created_at: response.created_at,
      user: {
        id: response.user.id,
        username: response.user.username || "Unknown User",
        avatar_url: response.user.avatar_url,
      },
    }

    revalidatePath("/dashboard/v")
    return { success: true, data: transformedData }
  } catch (error) {
    console.error("Unexpected error creating comment:", error)
    return { success: false, error: `Unexpected error creating comment: ${(error as Error).message}` }
  }
}

export async function updateComment(commentId: string, content: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase
    .from("comments")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", commentId)

  if (error) {
    console.error("Error updating comment:", error)
    return { success: false, error: "Failed to update comment" }
  }

  revalidatePath("/dashboard/v")
  return { success: true }
}

export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase.from("comments").delete().eq("id", commentId)

  if (error) {
    console.error("Error deleting comment:", error)
    return { success: false, error: "Failed to delete comment" }
  }

  revalidatePath("/dashboard/v")
  return { success: true }
}

