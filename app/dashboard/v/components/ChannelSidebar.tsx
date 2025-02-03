"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { PlusCircle, Hash, Volume2, Users, Calendar, MoreVertical } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  type Event,
  type Group,
  fetchGroup,
  addChannel,
  updateChannel,
  deleteChannel,
  addEvent,
} from "../actions/channels"

type ChannelSidebarProps = {
  groupId: string
  userId: string
  userAvatar: string
  userDisplayName: string
}

export function ChannelSidebar({ groupId, userId, userAvatar, userDisplayName }: ChannelSidebarProps) {
  const [group, setGroup] = useState<Group | null>(null)
  const [selectedVoiceChannel, setSelectedVoiceChannel] = useState<string | null>(null)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelType, setNewChannelType] = useState<"text" | "voice">("text")
  const [newEventName, setNewEventName] = useState("")
  const [newEventDate, setNewEventDate] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")

  useEffect(() => {
    const loadGroup = async () => {
      const fetchedGroup = await fetchGroup(groupId)
      console.log("Fetched group data:", fetchedGroup)
      if (fetchedGroup) {
        setGroup(fetchedGroup)
      }
    }
    loadGroup()
  }, [groupId])

  const handleAddChannel = async () => {
    if (newChannelName && group) {
      console.log("Adding new channel:", { name: newChannelName, type: newChannelType })
      const success = await addChannel(group.id, { name: newChannelName, type: newChannelType })
      if (success) {
        const updatedGroup = await fetchGroup(group.id)
        if (updatedGroup) {
          setGroup(updatedGroup)
          setNewChannelName("")
          toast({ title: "Channel created", description: `${newChannelName} has been added.` })
        } else {
          toast({ title: "Error", description: "Failed to fetch updated group data.", variant: "destructive" })
        }
      } else {
        toast({ title: "Error", description: "Failed to create channel.", variant: "destructive" })
      }
    }
  }

  const handleUpdateChannel = async (channelId: string, newName: string, channelType: "text" | "voice") => {
    if (group) {
      const success = await updateChannel(group.id, channelId, newName, channelType)
      if (success) {
        setGroup((prevGroup) => {
          if (!prevGroup) return null
          return {
            ...prevGroup,
            text_channels:
              prevGroup.text_channels?.map((ch) => (ch.id === channelId ? { ...ch, name: newName } : ch)) ?? [],
            voice_channels:
              prevGroup.voice_channels?.map((ch) => (ch.id === channelId ? { ...ch, name: newName } : ch)) ?? [],
          }
        })
        toast({ title: "Channel updated", description: `Channel has been renamed to ${newName}.` })
      } else {
        toast({ title: "Error", description: "Failed to update channel.", variant: "destructive" })
      }
    }
  }

  const handleDeleteChannel = async (channelId: string, channelType: "text" | "voice") => {
    if (group) {
      const success = await deleteChannel(group.id, channelId, channelType)
      if (success) {
        setGroup((prevGroup) => {
          if (!prevGroup) return null
          return {
            ...prevGroup,
            [channelType === "text" ? "text_channels" : "voice_channels"]:
              prevGroup[channelType === "text" ? "text_channels" : "voice_channels"]?.filter(
                (ch) => ch.id !== channelId,
              ) ?? [],
          }
        })
        toast({ title: "Channel deleted", description: "The channel has been removed." })
      } else {
        toast({ title: "Error", description: "Failed to delete channel.", variant: "destructive" })
      }
    }
  }

  const handleAddEvent = async () => {
    if (newEventName && newEventDate && group) {
      const newEvent: Event = {
        id: Date.now().toString(),
        name: newEventName,
        date: newEventDate,
      }
      const success = await addEvent(group.id, newEvent)
      if (success) {
        setGroup((prevGroup) => {
          if (!prevGroup) return null
          return {
            ...prevGroup,
            events: [...(prevGroup.events ?? []), newEvent],
          }
        })
        setNewEventName("")
        setNewEventDate("")
        toast({ title: "Event created", description: `${newEventName} has been scheduled.` })
      } else {
        toast({ title: "Error", description: "Failed to create event.", variant: "destructive" })
      }
    }
  }

  const handleInviteUser = () => {
    if (inviteEmail) {
      // Here you would typically send an invitation to the email address
      console.log(`Inviting user: ${inviteEmail}`)
      setInviteEmail("")
      toast({ title: "Invitation sent", description: `An invite has been sent to ${inviteEmail}.` })
    }
  }

  if (!group) {
    return <div>Loading...</div>
  }

  return (
    <Sidebar className="ml-[310px] mt-[120px] w-64 border-r">
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-semibold">{group.name}</h2>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="text-channels">
              <AccordionTrigger className="px-4">Text Channels</AccordionTrigger>
              <AccordionContent>
                {group.text_channels?.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between px-4 py-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <Hash className="h-4 w-4 mr-2" />
                      {channel.name}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onSelect={() => {
                            const newName = prompt("Enter new channel name", channel.name)
                            if (newName) handleUpdateChannel(channel.id, newName, "text")
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDeleteChannel(channel.id, "text")}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="voice-channels">
              <AccordionTrigger className="px-4">Voice Channels</AccordionTrigger>
              <AccordionContent>
                {group.voice_channels?.map((channel) => (
                  <div key={channel.id} className="flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setSelectedVoiceChannel(channel.id === selectedVoiceChannel ? null : channel.id)}
                      >
                        <Volume2 className="h-4 w-4 mr-2" />
                        {channel.name}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onSelect={() => {
                              const newName = prompt("Enter new channel name", channel.name)
                              if (newName) handleUpdateChannel(channel.id, newName, "voice")
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleDeleteChannel(channel.id, "voice")}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {selectedVoiceChannel === channel.id && (
                      <div className="flex items-center space-x-2 ml-8 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={userAvatar} />
                          <AvatarFallback>{userDisplayName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{userDisplayName}</span>
                      </div>
                    )}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="events">
              <AccordionTrigger className="px-4">Events</AccordionTrigger>
              <AccordionContent>
                {group.events?.map((event) => (
                  <Button key={event.id} variant="ghost" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.name} - {event.date}
                  </Button>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <Separator className="my-4" />
          <div className="px-4 space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Channel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Channel</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select onValueChange={(value) => setNewChannelType(value as "text" | "voice")}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select channel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="voice">Voice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddChannel}>Add Channel</Button>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="event-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="event-name"
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="event-date" className="text-right">
                      Date
                    </Label>
                    <Input
                      id="event-date"
                      type="datetime-local"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <Button onClick={handleInviteUser}>Send Invite</Button>
              </DialogContent>
            </Dialog>
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}

