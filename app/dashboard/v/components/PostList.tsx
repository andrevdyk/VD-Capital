"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Bookmark } from "lucide-react"

type Post = {
  id: string
  content: string
  media_url: string | null
  user_id: string
  created_at: string
  likes: number
  saves: number
  user: {
    name: string
    avatar_url: string
  }
}

export default function PostList({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        user:users(name, avatar_url)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching posts:", error)
    } else {
      setPosts(data)
    }
  }

  const handleLike = async (postId: string) => {
    const { error } = await supabase.rpc("increment_likes", { post_id: postId })
    if (error) {
      console.error("Error liking post:", error)
    } else {
      fetchPosts()
    }
  }

  const handleSave = async (postId: string) => {
    const { error } = await supabase.rpc("increment_saves", { post_id: postId })
    if (error) {
      console.error("Error saving post:", error)
    } else {
      fetchPosts()
    }
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={post.user.avatar_url} />
                <AvatarFallback>{post.user.name[0]}</AvatarFallback>
              </Avatar>
              <CardTitle>{post.user.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p>{post.content}</p>
            {post.media_url && (
              <div className="mt-2">
                {post.media_url.endsWith(".mp4") ? (
                  <video src={post.media_url} controls className="w-full rounded-lg" />
                ) : (
                  <img src={post.media_url || "/placeholder.svg"} alt="Post media" className="w-full rounded-lg" />
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => handleLike(post.id)}>
              <Heart className="mr-2 h-4 w-4" /> {post.likes}
            </Button>
            <Button variant="ghost" onClick={() => handleSave(post.id)}>
              <Bookmark className="mr-2 h-4 w-4" /> {post.saves}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

/*We need to add functionality for all the other shapes,

Lets start with a rectangle

Needs 8 points
Middle points on each line adjust the height
After click on rectangle icon, user should be able to click once and move the mouse which is locked to the other corner
Needs a point in the centre of rectangle to move it freely
Needs a dialog to change the fill color and line color
Dialog needs 3 tabs, Style, Text, and Coordinates
I think it will be a good idea to separate each group of technical analysis items.

So have Lines as its own component, and have shapes as its own component,

Can we do that?*/