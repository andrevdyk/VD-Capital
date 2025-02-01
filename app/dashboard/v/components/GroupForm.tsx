"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createGroup } from "../actions/groups"

export default function GroupForm({ userId }: { userId: string }) {
  const [name, setName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    try {
      const result = await createGroup({ name, isPrivate, createdBy: userId })

      if (!result.success) throw new Error(result.error)

      setName("")
      setIsPrivate(false)
      toast({ title: "Group created successfully!" })
    } catch (error) {
      console.error("Error creating group:", error)
      toast({ title: "Error creating group", variant: "destructive" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Input
          id="isPrivate"
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        <Label htmlFor="isPrivate">Private Group</Label>
      </div>
      <Button type="submit">Create Group</Button>
    </form>
  )
}

