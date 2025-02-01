"use client"

import { useEffect, useState, useCallback } from "react"
import { useInView } from "react-intersection-observer"
import { fetchPosts } from "../actions/posts"
import { PostCard } from "./PostCard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type Post = {
  id: string
  content: string
  media_urls: string | null
  created_at: string
  user_id: string
  likes: number
  saves: number
  shares: number
  comments: number
  liked_by_user: boolean
  user: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export function Feed({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [ref, inView] = useInView()

  const loadPosts = useCallback(async () => {
    if (!userId || loading || !hasMore) return

    setLoading(true)
    const result = await fetchPosts(userId, page)
    setLoading(false)

    if (result.success && result.data) {
      console.log("Posts received in Feed component:", result.data) // Debug log
      setPosts((prevPosts) => {
        const newPosts = result.data.filter(
          (newPost) => !prevPosts.some((existingPost) => existingPost.id === newPost.id),
        )
        return [...prevPosts, ...newPosts]
      })
      setPage((prevPage) => prevPage + 1)
      setHasMore(result.data.length > 0)
    } else {
      setError(result.error || "Failed to fetch posts")
    }
  }, [userId, page, loading, hasMore])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  useEffect(() => {
    if (inView && hasMore) {
      loadPosts()
    }
  }, [inView, hasMore, loadPosts])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} userId={userId} />
      ))}
      {loading && <p>Loading more posts...</p>}
      {!loading && !hasMore && <p>No more posts to load</p>}
      <div ref={ref} />
    </div>
  )
}

