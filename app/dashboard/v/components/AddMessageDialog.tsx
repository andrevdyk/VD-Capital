"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { searchUsers } from "../actions/users"
import { toast } from "@/components/ui/use-toast"

type User = {
  id: string
  username: string
  avatar_url: string | null
}

export function AddMessageDialog({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}) {
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      try {
        console.log("Searching for users in AddMessageDialog")
        const result = await searchUsers(searchTerm, userId)
        console.log("Search result in AddMessageDialog:", result)
        if (result.success && result.data) {
          setSearchResults(result.data)
        } else {
          console.error("Search failed:", result.error)
          toast({ title: "Error searching users", description: result.error, variant: "destructive" })
        }
      } catch (error) {
        console.error("Error searching users:", error)
        toast({ title: "Error searching users", description: "An unexpected error occurred", variant: "destructive" })
      }
    }
  }

  const handleStartChat = (otherUserId: string) => {
    // Implement logic to start a new chat or navigate to an existing chat
    console.log(`Starting chat with user: ${otherUserId}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start a New Message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search for users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </div>
        </form>
        <div className="mt-4 space-y-2">
          {searchResults.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>{user.username[0]}</AvatarFallback>
                </Avatar>
                <span>{user.username}</span>
              </div>
              <Button size="sm" onClick={() => handleStartChat(user.id)}>
                Message
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

