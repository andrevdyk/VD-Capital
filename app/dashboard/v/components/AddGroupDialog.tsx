"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { createGroup } from "../actions/groups"
import { searchUsers } from "../actions/users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X } from "lucide-react"

type User = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

export function AddGroupDialog({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}) {
  const [name, setName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = useCallback(async () => {
    if (searchTerm.trim()) {
      setIsSearching(true)
      try {
        console.log("Searching for users in AddGroupDialog with term:", searchTerm)
        const result = await searchUsers(searchTerm, userId)
        console.log("Search result in AddGroupDialog:", result)
        if (result.success && result.data) {
          const filteredResults = result.data.filter((user) => !selectedUsers.some((u) => u.id === user.id))
          console.log("Filtered results:", filteredResults)
          setSearchResults(filteredResults)
        } else {
          console.error("Search failed:", result.error)
          toast({ title: "Error searching users", description: result.error, variant: "destructive" })
        }
      } catch (error) {
        console.error("Error searching users:", error)
        toast({ title: "Error searching users", description: "An unexpected error occurred", variant: "destructive" })
      } finally {
        setIsSearching(false)
      }
    } else {
      setSearchResults([])
    }
  }, [searchTerm, userId, selectedUsers])

  const addUser = (user: User) => {
    setSelectedUsers((prev) => [...prev, user])
    setSearchResults((prev) => prev.filter((u) => u.id !== user.id))
    setSearchTerm("")
  }

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    setIsLoading(true)
    try {
      const result = await createGroup({
        name,
        isPrivate,
        createdBy: userId,
        members: selectedUsers.map((u) => u.id),
      })

      if (result.success) {
        setName("")
        setIsPrivate(false)
        setSelectedUsers([])
        toast({ title: "Group created successfully!" })
        onOpenChange(false)
      } else {
        throw new Error(result.error || "Failed to create group")
      }
    } catch (error) {
      console.error("Error creating group:", error)
      toast({ title: "Error creating group", description: (error as Error).message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
        </DialogHeader>
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
            <Switch id="isPrivate" checked={isPrivate} onCheckedChange={setIsPrivate} />
            <Label htmlFor="isPrivate">Private Group</Label>
          </div>
          <div>
            <Label htmlFor="addMembers">Add Members</Label>
            <div className="flex space-x-2">
              <Input
                id="addMembers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                placeholder="Search by username or display name..."
              />
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  handleSearch()
                }}
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">{user.display_name}</span>
                      <span className="text-sm text-muted-foreground block">@{user.username}</span>
                    </div>
                  </div>
                  <Button type="button" size="sm" onClick={() => addUser(user)}>
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
          {searchResults.length === 0 && searchTerm && !isSearching && (
            <p className="text-sm text-muted-foreground">No users found</p>
          )}
          {selectedUsers.length > 0 && (
            <div className="mt-4">
              <Label>Selected Users</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">{user.display_name}</span>
                        <span className="text-sm text-muted-foreground block">@{user.username}</span>
                      </div>
                    </div>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeUser(user.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

