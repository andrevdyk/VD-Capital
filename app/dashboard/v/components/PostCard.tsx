import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Bookmark, ImageOff } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Comments } from "./Comments"
import { ShareModal } from "./ShareModal"
import { likePost } from "../actions/posts"

type Post = {
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

export function PostCard({ post, userId }: { post: Post; userId: string }) {
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const [showComments, setShowComments] = useState(false)
  const [isLiked, setIsLiked] = useState(post.liked_by_user)
  const [likeCount, setLikeCount] = useState(post.likes)

  const mediaUrls = useMemo(() => {
    if (!post.media_urls) return []
    try {
      return JSON.parse(post.media_urls) as string[]
    } catch {
      console.error(`Failed to parse media_urls for post ${post.id}`)
      return []
    }
  }, [post.media_urls, post.id])

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

    if (mediaUrls.length === 1) {
      return (
        <div className="mt-4">
          {imageError[mediaUrls[0]] ? (
            <div className="bg-gray-200 rounded-lg flex items-center justify-center h-64">
              <ImageOff className="h-12 w-12 text-gray-400" />
            </div>
          ) : (
            <img
              src={mediaUrls[0] || "/placeholder.svg"}
              alt="Post media"
              className="rounded-lg max-h-96 w-full object-cover"
              onError={() => handleImageError(mediaUrls[0])}
            />
          )}
        </div>
      )
    }

    return (
      <div className="mt-4 relative">
        <Carousel className="w-full">
          <CarouselContent>
            {mediaUrls.map((url, index) => (
              <CarouselItem key={index}>
                {imageError[url] ? (
                  <div className="bg-gray-200 rounded-lg flex items-center justify-center h-64">
                    <ImageOff className="h-12 w-12 text-gray-400" />
                  </div>
                ) : (
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Post media ${index + 1}`}
                    className="rounded-lg max-h-96 w-full object-cover"
                    onError={() => handleImageError(url)}
                  />
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2" />
        </Carousel>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
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
        {renderMedia()}
        {showComments && (
          <div className="mt-4 border-t pt-4">
            <Comments postId={post.id} userId={userId} isVisible={showComments} />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={handleLike}>
          <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          {likeCount}
        </Button>
        <Button variant="ghost" onClick={() => setShowComments(!showComments)}>
          <MessageCircle className="mr-2 h-4 w-4" />
          {post.comments}
        </Button>
        <Button variant="ghost">
          <Bookmark className="mr-2 h-4 w-4" />
          {post.saves}
        </Button>
        <ShareModal postId={post.id} shareCount={post.shares} />
      </CardFooter>
    </Card>
  )
}

