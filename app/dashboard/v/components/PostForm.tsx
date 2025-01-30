"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createPost } from "../actions/posts"

export default function PostForm({ userId }: { userId: string }) {
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) return

    try {
      let mediaUrl = null
      if (file) {
        const { data, error } = await supabase.storage
          .from("post-media")
          .upload(`${userId}/${Date.now()}-${file.name}`, file)

        if (error) throw error
        mediaUrl = data.path
      }

      const result = await createPost({ userId, content, mediaUrl })

      if (!result.success) throw new Error(result.error)

      setContent("")
      setFile(null)
      toast({ title: "Post created successfully!" })
    } catch (error) {
      console.error("Error creating post:", error)
      toast({ title: "Error creating post", variant: "destructive" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="content">Post Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          required
        />
      </div>
      <div>
        <Label htmlFor="file">Upload Photo or Video</Label>
        <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept="image/*,video/*" />
      </div>
      <Button type="submit">Create Post</Button>
    </form>
  )
}

