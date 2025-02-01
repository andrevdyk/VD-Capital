"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { updateProfile } from "../actions/users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ImageEditor from "./ImageEditor"
import { uploadFile } from "../actions/uploads"

type Profile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

export function EditProfileForm({ profile }: { profile: Profile }) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "")
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await updateProfile(profile.id, { display_name: displayName, avatar_url: avatarUrl })
    if (result.success) {
      toast({ title: "Profile updated successfully!" })
      setIsEditing(false)
    } else {
      toast({ title: "Failed to update profile", variant: "destructive" })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setIsAvatarDialogOpen(true)
    }
  }

  const handleAvatarSave = async (editedImage: string) => {
    try {
      // Convert the data URL to a Blob
      const response = await fetch(editedImage)
      const blob = await response.blob()

      // Create a File object
      const file = new File([blob], `avatar-${Date.now()}.jpg`, { type: "image/jpeg" })

      // Create FormData object
      const formData = new FormData()
      formData.append("file", file)
      formData.append("path", `avatars/${profile.id}/${file.name}`)

      const uploadResult = await uploadFile(formData)

      if (uploadResult.success && uploadResult.url) {
        const updateResult = await updateProfile(profile.id, { avatar_url: uploadResult.url })
        if (updateResult.success) {
          setAvatarUrl(`${uploadResult.url}?t=${Date.now()}`)
          setIsAvatarDialogOpen(false)
          toast({ title: "Avatar updated successfully!", description: "Your new avatar is now visible to others." })
        } else {
          throw new Error(updateResult.error || "Failed to update profile")
        }
      } else {
        throw new Error(uploadResult.error || "Failed to upload file")
      }
    } catch (error) {
      console.error("Error updating avatar:", error)
      toast({
        title: "Failed to update avatar",
        description: `Error: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  if (!isEditing) {
    return <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="displayName">Display Name</Label>
        <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="avatar">Avatar</Label>
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={`${avatarUrl}?t=${Date.now()}`}
              alt="Profile Avatar"
              onError={(e) => {
                console.error("Failed to load avatar image")
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <AvatarFallback>{profile.username[0]}</AvatarFallback>
          </Avatar>
          <Button type="button" variant="outline" onClick={() => document.getElementById("avatar-upload")?.click()}>
            Choose Image
          </Button>
          <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>
      </div>
      <div className="flex space-x-2">
        <Button type="submit">Save Changes</Button>
        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>

      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Avatar</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <ImageEditor image={URL.createObjectURL(selectedFile)} onSave={handleAvatarSave} aspectRatio={1} />
          )}
        </DialogContent>
      </Dialog>
    </form>
  )
}

