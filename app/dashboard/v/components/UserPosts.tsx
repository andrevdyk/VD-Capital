"use client"

import { useState, useEffect } from "react"
import { fetchPosts } from "../actions/posts"
import { PostCard } from "./PostCard"

export function UserPosts({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      const result = await fetchPosts(userId)
      if (result.success && result.data) {
        setPosts(result.data)
      }
      setLoading(false)
    }
    loadPosts()
  }, [userId])

  if (loading) {
    return <div>Loading posts...</div>
  }

  if (posts.length === 0) {
    return <div>No posts yet.</div>
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} userId={userId} />
      ))}
    </div>
  )
}

