"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createComment, fetchComments, type Comment } from "../actions/comments"
import { toast } from "@/components/ui/use-toast"

export function Comments({ postId, userId, isVisible }: { postId: string; userId: string; isVisible: boolean }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isVisible) {
      loadComments()
    }
  }, [isVisible])

  const loadComments = async () => {
    setLoading(true)
    setError(null)
    const result = await fetchComments(postId)
    setLoading(false)
    if (result.success && result.data) {
      setComments(result.data)
    } else {
      setError(result.error || "Failed to fetch comments")
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    setError(null)
    const result = await createComment({ postId, userId, content: newComment.trim() })
    setLoading(false)

    if (result.success && result.data) {
      setComments((prevComments) => [result.data as Comment, ...prevComments])
      setNewComment("")
      toast({
        title: "Success",
        description: "Comment posted successfully!",
      })
    } else {
      setError(result.error || "Failed to create comment")
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!isVisible) return null

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Comments</h3>
      <form onSubmit={handleSubmitComment} className="flex mb-4">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-grow mr-2"
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </Button>
      </form>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.user?.avatar_url || undefined} />
              <AvatarFallback>{comment.user?.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{comment.user?.username || "Unknown User"}</p>
              <p>{comment.content}</p>
              <p className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      {loading && <p>Loading comments...</p>}
    </div>
  )
}

