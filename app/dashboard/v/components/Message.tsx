import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MessageProps {
  content: string
  isCurrentUser: boolean
  user: {
    username: string
    avatar_url: string | null
  }
}

export function Message({ content, isCurrentUser, user }: MessageProps) {
  if (isCurrentUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-primary text-primary-foreground rounded-3xl py-2 px-4 max-w-[100%]">{content}</div>
      </div>
    )
  }

  return (
    <div className="flex items-start mb-4">
      <Avatar className="mr-2">
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback>{user.username[0]}</AvatarFallback>
      </Avatar>
      <div>
        <div className="bg-secondary text-secondary-foreground rounded-3xl py-2 px-4 max-w-[100%]">{content}</div>
      </div>
    </div>
  )
}

