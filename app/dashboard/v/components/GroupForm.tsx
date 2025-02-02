"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { createGroup } from "../actions/groups"

export function GroupForm({ userId, onSuccess }: { userId: string; onSuccess?: () => void }) {
  const [name, setName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    const result = await createGroup({ name, isPrivate, createdBy: userId })

    if (result.success) {
      setName("")
      setIsPrivate(false)
      toast({ title: "Group created successfully!" })
      if (onSuccess) onSuccess()
    } else {
      toast({ title: "Error creating group", description: result.error, variant: "destructive" })
    }
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
      <Button type="submit">Create Group</Button>
    </form>
  )
}

