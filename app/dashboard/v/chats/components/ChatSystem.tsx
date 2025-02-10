"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Search, Send, Paperclip, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { getChats, getMessages, createChat } from "../actions/chatActions"
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react"
import { useRouter } from "next/navigation"

type Chat = {
  chat_id: string
  name: string | null
  last_message: string | null
  avatar_url: string | null
  is_group: boolean
  other_user_id: string | null
  other_user: {
    id: string
    avatar_url: string | null
    display_name: string
  }
  created_by: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  unread_count: number
}

type Message = {
  id: string
  chat_id: string
  profile_id: string
  content: string
  created_at: string
  profile: UserProfile | null
  attachment_url?: string
  attachment_type?: string
  seen_at?: string | null
}

type UserProfile = {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

type Attachment = {
  file: File
  type: string
  url: string
}

const AttachmentDialog = ({
  isOpen,
  onClose,
  attachmentUrl,
  attachmentType,
}: {
  isOpen: boolean
  onClose: () => void
  attachmentUrl: string
  attachmentType: string
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] sm:max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Attachment</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex justify-center items-center">
          {attachmentType === "image" ? (
            <img
              src={attachmentUrl || "/placeholder.svg"}
              alt="Enlarged attachment"
              className="max-w-full max-h-[60vh] object-contain"
            />
          ) : attachmentType === "video" ? (
            <video src={attachmentUrl} controls className="max-w-full max-h-[60vh]" />
          ) : (
            <div>Unsupported attachment type</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ChatSystem({ userId }: { userId: string }) {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState<{ url: string; type: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()

  const fetchChats = useCallback(async () => {
    console.log("Fetching chats for user:", userId)
    const fetchedChats = await getChats(userId)
    console.log("Fetched chats:", fetchedChats)
    if (fetchedChats) {
      setChats(fetchedChats)
      setFilteredChats(fetchedChats)
    } else {
      console.log("No chats fetched or an error occurred")
    }
  }, [userId])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  useEffect(() => {
    console.log("Chats state updated:", chats)
  }, [chats])

  const markMessagesAsSeen = async (chatId: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ seen_at: new Date().toISOString() })
      .eq("chat_id", chatId)
      .is("seen_at", null)

    if (error) {
      console.error("Error marking messages as seen:", error)
    }
  }

  const handleChatSelect = async (chat: Chat) => {
    console.log("Selecting chat:", chat)
    setSelectedChat(chat)
    if (chat && chat.chat_id) {
      const fetchedMessages = await getMessages(chat.chat_id)
      console.log("Fetched messages:", fetchedMessages)
      if (fetchedMessages) {
        setMessages(fetchedMessages)
        // Mark messages as seen
        await markMessagesAsSeen(chat.chat_id)
        // Reset unread count
        setChats((prevChats) => prevChats.map((c) => (c.chat_id === chat.chat_id ? { ...c, unread_count: 0 } : c)))
        setFilteredChats((prevChats) =>
          prevChats.map((c) => (c.chat_id === chat.chat_id ? { ...c, unread_count: 0 } : c)),
        )
      } else {
        console.error("Failed to fetch messages for chat:", chat.chat_id)
        setMessages([])
      }
    } else {
      console.error("Invalid chat object:", chat)
      setMessages([])
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = chats.filter((chat) => chat.name?.toLowerCase().includes(term.toLowerCase()))
    setFilteredChats(filtered)
  }

  const sendMessage = async () => {
    if (!selectedChat || !selectedChat.chat_id || (!newMessage.trim() && !attachment)) {
      console.error("Cannot send message: Invalid chat or empty message")
      return
    }

    console.log("Sending message to chat:", selectedChat.chat_id)

    let attachmentUrl = null
    let attachmentType = null

    if (attachment) {
      const { data, error } = await supabase.storage
        .from("chat-attachments")
        .upload(`${selectedChat.chat_id}/${Date.now()}-${attachment.file.name}`, attachment.file)

      if (error) {
        console.error("Error uploading attachment:", error)
        toast({ title: "Error", description: "Failed to upload attachment", variant: "destructive" })
        return
      }

      const { data: publicUrl } = supabase.storage.from("chat-attachments").getPublicUrl(data.path)

      attachmentUrl = publicUrl.publicUrl
      attachmentType = attachment.type
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        chat_id: selectedChat.chat_id,
        profile_id: userId,
        content: newMessage.trim(),
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
      })
      .select()
      .single()

    if (error) {
      console.error("Error sending message:", error)
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" })
    } else {
      console.log("Message sent successfully:", data)
      setMessages([...messages, data])
      setNewMessage("")
      setAttachment(null)
    }
  }

  const handleCreateChat = async (otherUserId: string) => {
    const { data, error } = await createChat(userId, otherUserId)

    if (error) {
      console.error("Error creating chat:", error)
      toast({ title: "Error", description: "Failed to create chat", variant: "destructive" })
    } else {
      await fetchChats()
      setShowNewChatDialog(false)
      if (data) {
        setSelectedChat(data)
      }
    }
  }

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const navigateToUserProfile = (userId: string) => {
    router.push(`/dashboard/v/profile/${userId}`)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({ title: "Error", description: "File size exceeds 20MB limit", variant: "destructive" })
        return
      }

      const fileType = file.type.split("/")[0]
      if (fileType !== "image" && fileType !== "video") {
        toast({ title: "Error", description: "Only image and video files are allowed", variant: "destructive" })
        return
      }

      setAttachment({
        file,
        type: fileType,
        url: URL.createObjectURL(file),
      })
    }
  }

  const removeAttachment = () => {
    setAttachment(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAttachmentClick = (url: string, type: string) => {
    setSelectedAttachment({ url, type })
    setShowAttachmentDialog(true)
  }

  const ChatList = ({ chats, onChatSelect }: { chats: Chat[]; onChatSelect: (chat: Chat) => void }) => (
    <ScrollArea className="h-[calc(100vh-10rem)]">
      {chats.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">No chats found</div>
      ) : (
        chats.map((chat) => {
          const displayName =
            chat.other_user_id === userId ? chat.created_by.display_name : chat.other_user.display_name
          const avatarUrl = chat.other_user_id === userId ? chat.created_by.avatar_url : chat.other_user.avatar_url

          return (
            <div
              key={chat.chat_id}
              className="flex items-center space-x-4 p-2 hover:bg-accent rounded-lg cursor-pointer"
              onClick={() => onChatSelect(chat)}
            >
              <Avatar>
                <AvatarImage src={avatarUrl || undefined} alt={displayName || "Chat avatar"} />
                <AvatarFallback>{displayName?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-sm text-muted-foreground truncate">{chat.last_message || "No messages yet"}</p>
              </div>
              {chat.unread_count > 0 && (
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-[#1A6DFF] to-[#C822FF] flex items-center justify-center">
                  <span className="text-xs font-medium text-white">{chat.unread_count}</span>
                </div>
              )}
            </div>
          )
        })
      )}
    </ScrollArea>
  )

  const NewChatDialog = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<UserProfile[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const supabase = createClientComponentClient()

    const handleSearch = useCallback(async () => {
      if (searchTerm.trim()) {
        setIsSearching(true)
        try {
          const { data, error } = await supabase
            .from("limited_profiles")
            .select("id, username, display_name, avatar_url")
            .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
            .limit(10)

          if (error) {
            throw error
          }

          console.log("Search results:", data)
          setSearchResults(data.filter((user) => user.id !== userId))
        } catch (error) {
          console.error("Error searching users:", error)
          toast({
            title: "Error searching users",
            description: "An unexpected error occurred",
            variant: "destructive",
          })
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, [searchTerm, userId, supabase])

    useEffect(() => {
      const debounceTimer = setTimeout(() => {
        handleSearch()
      }, 300)

      return () => clearTimeout(debounceTimer)
    }, [handleSearch])

    return (
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a New Chat</DialogTitle>
          </DialogHeader>
          <Input placeholder="Search for users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <ScrollArea className="mt-4 max-h-[300px]">
            {isSearching ? (
              <div className="text-center p-4">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-lg cursor-pointer"
                >
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.display_name?.[0] || user.username?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.display_name || user.username}</div>
                      {user.username && <div className="text-sm text-muted-foreground">@{user.username}</div>}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleCreateChat(user.id)}>
                    Message
                  </Button>
                </div>
              ))
            ) : searchTerm && !isSearching ? (
              <div className="text-center p-4">No users found</div>
            ) : null}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  const renderAttachmentPreview = () => {
    if (!attachment) return null

    return (
      <div className="mt-2 p-2 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Attachment Preview</span>
          <Button variant="ghost" size="sm" onClick={removeAttachment}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {attachment.type === "image" ? (
          <img src={attachment.url || "/placeholder.svg"} alt="Attachment preview" className="max-h-40 rounded" />
        ) : attachment.type === "video" ? (
          <video src={attachment.url} controls className="max-h-40 rounded" />
        ) : (
          <div className="flex items-center space-x-2">
            <Paperclip className="h-5 w-5" />
            <span className="text-sm truncate">{attachment.file.name}</span>
          </div>
        )}
      </div>
    )
  }

  useEffect(() => {
    console.log("Selected chat updated:", selectedChat)
  }, [selectedChat])

  useEffect(() => {
    const subscription = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMessage = payload.new as Message
        if (newMessage.chat_id !== selectedChat?.chat_id) {
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.chat_id === newMessage.chat_id
                ? { ...chat, unread_count: chat.unread_count + 1, last_message: newMessage.content }
                : chat,
            ),
          )
          setFilteredChats((prevChats) =>
            prevChats.map((chat) =>
              chat.chat_id === newMessage.chat_id
                ? { ...chat, unread_count: chat.unread_count + 1, last_message: newMessage.content }
                : chat,
            ),
          )
        } else {
          setMessages((prevMessages) => [...prevMessages, newMessage])
          // Mark the new message as seen if the chat is currently open
          markMessagesAsSeen(newMessage.chat_id)
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, selectedChat, markMessagesAsSeen]) // Added markMessagesAsSeen to dependencies

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <Search className="w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setShowNewChatDialog(true)}>New Chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Tabs defaultValue="all" className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="direct">Direct</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="flex-grow">
            <ChatList chats={filteredChats} onChatSelect={handleChatSelect} />
          </TabsContent>
          <TabsContent value="direct" className="flex-grow">
            <ChatList chats={filteredChats.filter((chat) => !chat.is_group)} onChatSelect={handleChatSelect} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-grow flex flex-col">
        {selectedChat ? (
          <>
            <div
              className="p-4 border-b flex items-center space-x-2 cursor-pointer"
              onClick={() =>
                navigateToUserProfile(
                  selectedChat.other_user_id === userId ? selectedChat.created_by.id : selectedChat.other_user.id,
                )
              }
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    selectedChat.other_user_id === userId
                      ? selectedChat.created_by.avatar_url || undefined
                      : selectedChat.other_user.avatar_url || undefined
                  }
                  alt="User avatar"
                />
                <AvatarFallback>
                  {(selectedChat.other_user_id === userId
                    ? selectedChat.created_by.display_name
                    : selectedChat.other_user.display_name)?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">
                {selectedChat.other_user_id === userId
                  ? selectedChat.created_by.display_name
                  : selectedChat.other_user.display_name}
              </h2>
            </div>
            <ScrollArea className="flex-grow p-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground">No messages yet</div>
              ) : (
                messages.map((message) => {
                  const isCurrentUser = message.profile_id === userId
                  const messageTime = new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })

                  return (
                    <div key={message.id} className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={message.profile?.avatar_url || undefined} />
                          <AvatarFallback>{message.profile?.display_name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                        <div
                          className={`p-2 rounded-lg ${
                            isCurrentUser ? "bg-gradient-to-r from-[#1A6DFF] to-[#C822FF] text-white" : "bg-muted"
                          }`}
                        >
                          {message.content}
                          {message.attachment_url && (
                            <div className="mt-2">
                              {message.attachment_type === "image" ? (
                                <img
                                  src={message.attachment_url || "/placeholder.svg"}
                                  alt="Attachment"
                                  className="max-w-xs rounded cursor-pointer"
                                  onClick={() => handleAttachmentClick(message.attachment_url!, "image")}
                                />
                              ) : message.attachment_type === "video" ? (
                                <video
                                  src={message.attachment_url}
                                  controls
                                  className="max-w-xs rounded cursor-pointer"
                                  onClick={() => handleAttachmentClick(message.attachment_url!, "video")}
                                />
                              ) : (
                                <a
                                  href={message.attachment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline"
                                >
                                  View Attachment
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">{messageTime}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </ScrollArea>
            <div className="p-4 border-t">
              {attachment && renderAttachmentPreview()}
              <div className="flex space-x-2 relative mt-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    😊
                  </Button>
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  style={{ display: "none" }}
                />
              </div>
              {showEmojiPicker && (
                <div className="absolute bottom-16 right-2">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a chat to start messaging
          </div>
        )}
      </div>

      <NewChatDialog />
      {selectedAttachment && (
        <AttachmentDialog
          isOpen={showAttachmentDialog}
          onClose={() => setShowAttachmentDialog(false)}
          attachmentUrl={selectedAttachment.url}
          attachmentType={selectedAttachment.type}
        />
      )}
    </div>
  )
}

