"use client"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Bookmark } from "lucide-react"
import { fetchPosts, likePost } from "../actions/posts"

type Post = {
  id: string
  content: string
  media_url: string | null
  created_at: string
  user_id: string
  likes: number
  comments: number
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
  const [ref, inView] = useInView()

  const loadPosts = async () => {
    if (!userId) {
      setError("User ID is not available")
      return
    }

    setLoading(true)
    const result = await fetchPosts(userId, page)
    setLoading(false)

    if (result.success && result.data) {
      setPosts((prevPosts) => [...prevPosts, ...result.data])
      setPage((prevPage) => prevPage + 1)
    } else {
      setError(result.error || "Failed to fetch posts")
    }
  }

  useEffect(() => {
    loadPosts()
  }, [userId, page]) // Added 'page' to dependencies

  useEffect(() => {
    if (inView) {
      loadPosts()
    }
  }, [inView, page]) // Added 'page' to dependencies

  const handleLike = async (postId: string) => {
    const result = await likePost(postId)
    if (result.success) {
      setPosts((prevPosts) => prevPosts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
    } else {
      console.error("Error liking post:", result.error)
    }
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={post.user.avatar_url || undefined} />
                <AvatarFallback>{post.user.username[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{post.user.username}</p>
                <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p>{post.content}</p>
            {post.media_url && (
              <img
                src={post.media_url || "/placeholder.svg"}
                alt="Post media"
                className="mt-2 rounded-lg max-h-96 w-full object-cover"
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => handleLike(post.id)}>
              <Heart className="mr-2 h-4 w-4" />
              {post.likes}
            </Button>
            <Button variant="ghost">
              <MessageCircle className="mr-2 h-4 w-4" />
              {post.comments}
            </Button>
            <Button variant="ghost">
              <Bookmark className="mr-2 h-4 w-4" />
              Save
            </Button>
          </CardFooter>
        </Card>
      ))}
      {loading && <p>Loading more posts...</p>}
      <div ref={ref} />
    </div>
  )
}

