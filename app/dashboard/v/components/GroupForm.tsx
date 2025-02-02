"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { createGroup } from "../actions/groups"
import { Checkbox } from "@/components/ui/checkbox"

export function GroupForm({ userId, onSuccess }: { userId: string; onSuccess?: () => void }) {
  const [name, setName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    const result = await createGroup({
      name,
      isPrivate,
      createdBy: userId,
      members: selectedMembers,
    })

    if (result.success) {
      setName("")
      setIsPrivate(false)
      setSelectedMembers([])
      toast({ title: "Group created successfully!" })
      if (onSuccess) onSuccess()
    } else {
      toast({ title: "Error creating group", description: result.error, variant: "destructive" })
    }
  }

  const handleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div>
        <Label htmlFor="name">Group Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="isPrivate" checked={isPrivate} onCheckedChange={setIsPrivate} />
        <Label htmlFor="isPrivate">Private Group</Label>
      </div>
      <div>
        <Label htmlFor="members">Select Members</Label>
        <div className="mt-2 space-y-2">
          {["user1", "user2", "user3"].map((userId) => (
            <div key={userId} className="flex items-center">
              <Checkbox
                id={`user-${userId}`}
                checked={selectedMembers.includes(userId)}
                onCheckedChange={() => handleMemberSelection(userId)}
              />
              <Label htmlFor={`user-${userId}`} className="ml-2">
                User {userId}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit">Create Group</Button>
    </form>
  )
}

