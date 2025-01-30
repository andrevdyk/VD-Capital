"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createProfile } from "../actions/users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfileCreationForm({ userId }: { userId: string }) {
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !displayName) {
      toast({ title: "Username and Display Name are required", variant: "destructive" })
      return
    }

    try {
      const result = await createProfile({ userId, username, displayName, avatarUrl })
      if (result.success) {
        toast({ title: "Profile created successfully!" })
        router.push("/dashboard/v")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error creating profile:", error)
      toast({ title: "Error creating profile", variant: "destructive" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />
      </div>
      <div>
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          required
        />
      </div>
      <div>
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="Enter avatar URL (optional)"
        />
      </div>
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{username[0]?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <Button type="submit">Create Profile</Button>
      </div>
    </form>
  )
}

