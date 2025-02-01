"use client"

import { useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createPost } from "../actions/posts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Image, Paperclip, MapPin, Smile, Send, X } from "lucide-react"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { Input } from "@/components/ui/input"

export default function PostForm({ userId, userAvatar }: { userId: string; userAvatar?: string }) {
  const [content, setContent] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [textareaHeight, setTextareaHeight] = useState("40px")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content && files.length === 0) return

    setIsUploading(true)

    try {
      const mediaUrls = await Promise.all(
        files.map(async (file) => {
          const fileExt = file.name.split(".").pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `${userId}/${fileName}`

          const { error: uploadError } = await supabase.storage.from("posts").upload(filePath, file)

          if (uploadError) {
            throw uploadError
          }

          const { data } = supabase.storage.from("posts").getPublicUrl(filePath)

          return data.publicUrl
        }),
      )

      const result = await createPost({ userId, content, mediaUrls })

      if (!result.success) throw new Error(result.error)

      setContent("")
      setFiles([])
      toast({ title: "Post created successfully!" })
    } catch (error) {
      console.error("Error creating post:", error)
      toast({ title: "Error creating post", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files as FileList)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const addEmoji = (emoji: { native: string }) => {
    setContent((prevContent) => prevContent + emoji.native)
    setShowEmojiPicker(false)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    e.target.style.height = "40px"
    e.target.style.height = `${e.target.scrollHeight}px`
    setTextareaHeight(`${e.target.scrollHeight}px`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start space-x-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={userAvatar} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <Label htmlFor="content" className="sr-only">
            Post Content
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={handleTextareaChange}
            placeholder="What's on your mind?"
            className="w-full min-h-[40px] resize-none py-2 px-3 overflow-hidden rounded-2xl bg-muted"
            style={{ height: textareaHeight }}
          />
          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={`Uploaded file ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <Button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <div className="flex space-x-2">
              <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-5 w-5" />
                <span className="sr-only">Add photo</span>
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                <Image className="h-5 w-5" />
                <span className="sr-only">Add image</span>
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Add attachment</span>
              </Button>
              <Button type="button" size="icon" variant="ghost">
                <MapPin className="h-5 w-5" />
                <span className="sr-only">Add location</span>
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <Smile className="h-5 w-5" />
                <span className="sr-only">Add emoji</span>
              </Button>
            </div>
            <Button
              type="submit"
              className="flex items-center space-x-2"
              disabled={(!content && files.length === 0) || isUploading}
            >
              <span>{isUploading ? "Posting..." : "Post"}</span>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {showEmojiPicker && (
            <div className="absolute z-10 mt-2">
              <Picker data={data} onEmojiSelect={addEmoji} />
            </div>
          )}
        </div>
      </div>
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/*,video/*"
        className="hidden"
      />
    </form>
  )
}

