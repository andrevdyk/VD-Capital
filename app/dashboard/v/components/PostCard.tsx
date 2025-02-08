import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Bookmark, ImageOff } from "lucide-react"
import { likePost } from "../actions/posts"
import { cn } from "@/lib/utils"

type Post = {
  id: string
  content: string
  media_urls: string[] | null
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

export function PostCard({ post, userId, compact = false }: { post: Post; userId: string; compact?: boolean }) {
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [isLiked, setIsLiked] = useState(post.liked_by_user)
  const [likeCount, setLikeCount] = useState(post.likes)

  const mediaUrls = useMemo(() => {
    if (!post.media_urls) return []
    return Array.isArray(post.media_urls) ? post.media_urls : JSON.parse(post.media_urls)
  }, [post.media_urls])

  const handleImageError = (url: string) => {
    console.error(`Failed to load image for post ${post.id}: ${url}`)
    setImageError((prev) => ({ ...prev, [url]: true }))
  }

  const handleLike = async () => {
    const result = await likePost(post.id, userId)
    if (result.success) {
      setIsLiked(result.liked ?? !isLiked)
      setLikeCount(result.likes ?? likeCount)
    } else {
      console.error("Error liking post:", result.error)
    }
  }

  const renderMedia = () => {
    if (mediaUrls.length === 0) return null

    return (
      <div className={cn("overflow-hidden", compact ? "aspect-square" : "aspect-video")}>
        {imageError[mediaUrls[0]] ? (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ImageOff className="h-12 w-12 text-gray-400" />
          </div>
        ) : (
          <img
            src={mediaUrls[0] || "/placeholder.svg"}
            alt="Post media"
            className="w-full h-full object-cover"
            onError={() => handleImageError(mediaUrls[0])}
          />
        )}
      </div>
    )
  }

  if (compact) {
    return (
      <div className="relative group">
        {renderMedia()}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="text-white flex items-center space-x-2">
            <Heart className="h-6 w-6" />
            <span>{likeCount}</span>
            <MessageCircle className="h-6 w-6 ml-2" />
            <span>{post.comments}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      {renderMedia()}
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={post.user.avatar_url || undefined} />
            <AvatarFallback>{post.user.username[0]}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{post.user.username}</span>
        </div>
        <p className="text-sm mb-2 line-clamp-2">{post.content}</p>
        <div className="flex justify-between text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={handleLike}>
            <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            {likeCount}
          </Button>
          <Button variant="ghost" size="sm">
            <MessageCircle className="mr-1 h-4 w-4" />
            {post.comments}
          </Button>
          <Button variant="ghost" size="sm">
            <Bookmark className="mr-1 h-4 w-4" />
            {post.saves}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

