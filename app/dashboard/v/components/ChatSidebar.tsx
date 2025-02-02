"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search } from "lucide-react"
import { GroupList } from "./GroupList"
import { ChatList } from "./ChatList"
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader } from "@/components/ui/sidebar"
import { AddGroupDialog } from "./AddGroupDialog"
import { AddMessageDialog } from "./AddMessageDialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import type { Group } from "../actions/groups"

export function ChatSidebar({
  userId,
  onGroupSelect,
  groups,
  isLoadingGroups,
  onGroupsChange,
}: {
  userId: string
  onGroupSelect: (groupId: string) => void
  groups: Group[]
  isLoadingGroups: boolean
  onGroupsChange: () => void
}) {
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false)
  const [isAddMessageDialogOpen, setIsAddMessageDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAllChats, setShowAllChats] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    // Implement search logic here
  }

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId)
    onGroupSelect(groupId)
  }

  const handleAddGroup = () => {
    setIsAddGroupDialogOpen(true)
  }

  const handleAddGroupComplete = () => {
    setIsAddGroupDialogOpen(false)
    onGroupsChange()
  }

  return (
    <Sidebar className="ml-[50px] mt-[60px] w-64">
      <SidebarHeader>
        <h2 className="text-xl font-semibold px-4 py-2">Chat</h2>
        <div className="px-4 py-2">
          <Input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} className="w-full" />
          <Search className="h-4 w-4" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="messages">
              <div className="flex items-center justify-between px-4">
                <AccordionTrigger className="py-2 text-muted-foreground hover:text-foreground text-base">
                  Messages
                </AccordionTrigger>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setIsAddMessageDialogOpen(true)}>
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Start a New Message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <AccordionContent>
                <ChatList userId={userId} limit={showAllChats ? undefined : 5} />
                {!showAllChats && (
                  <Button variant="link" size="sm" className="mt-2 w-full" onClick={() => setShowAllChats(true)}>
                    Show More
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="groups">
              <div className="flex items-center justify-between px-4">
                <AccordionTrigger className="py-2 text-muted-foreground hover:text-foreground text-base">
                  Groups
                </AccordionTrigger>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={handleAddGroup}>
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create or Join a Group</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <AccordionContent>
                {isLoadingGroups ? (
                  <div className="text-center">Loading groups...</div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 px-4 text-sm font-semibold">Public Groups</h4>
                      <GroupList
                        userId={userId}
                        isPrivate={false}
                        activeGroupId={selectedGroupId}
                        onGroupSelect={handleGroupSelect}
                        groups={groups.filter((group) => !group.is_private)}
                      />
                    </div>
                    <div>
                      <h4 className="mb-2 px-4 text-sm font-semibold">Private Groups</h4>
                      <GroupList
                        userId={userId}
                        isPrivate={true}
                        activeGroupId={selectedGroupId}
                        onGroupSelect={handleGroupSelect}
                        groups={groups.filter((group) => group.is_private)}
                      />
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SidebarGroup>
      </SidebarContent>
      <AddGroupDialog
        open={isAddGroupDialogOpen}
        onOpenChange={(open) => {
          setIsAddGroupDialogOpen(open)
          if (!open) {
            handleAddGroupComplete()
          }
        }}
        userId={userId}
      />
      <AddMessageDialog open={isAddMessageDialogOpen} onOpenChange={setIsAddMessageDialogOpen} userId={userId} />
    </Sidebar>
  )
}

