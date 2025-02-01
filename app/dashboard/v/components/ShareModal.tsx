"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Share2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { incrementShares } from "../actions/posts"

export function ShareModal({ postId, shareCount }: { postId: string; shareCount: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [localShareCount, setLocalShareCount] = useState(shareCount)
  const shareUrl = `${window.location.origin}/post/${postId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      const result = await incrementShares(postId)
      if (result.success) {
        setLocalShareCount(result.shares)
      }
      toast({ title: "Link copied to clipboard!" })
    } catch (err) {
      console.error("Failed to copy text: ", err)
      toast({ title: "Failed to copy link", variant: "destructive" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Share2 className="mr-2 h-4 w-4" />
          {localShareCount}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this post</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input value={shareUrl} readOnly />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

