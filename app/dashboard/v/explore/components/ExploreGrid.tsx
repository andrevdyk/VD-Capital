"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle } from "lucide-react"

type Post = {
  id: string
  media_url: string
  likes: number
  comments: number
}
/*
export default function ExploreGrid() {
  const [posts, setPosts] = useState<Post[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchTrendingPosts()
  }, [])

  const fetchTrendingPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("id, media_url, likes, comments")
      .order("likes", { ascending: false })
      .limit(12)

    if (error) {
      console.error("Error fetching trending posts:", error)
    } else {
      setPosts(data)
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="p-0 relative">
            {post.media_url.endsWith(".mp4") ? (
              <video src={post.media_url} className="w-full h-48 object-cover" />
            ) : (
              <img src={post.media_url || "/placeholder.svg"} alt="Post media" className="w-full h-48 object-cover" />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

*/