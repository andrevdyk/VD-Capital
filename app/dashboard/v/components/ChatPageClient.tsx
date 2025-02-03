"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatSection } from "./ChatSection"
import { ChatSidebar } from "./ChatSidebar"
import { ChannelSidebar } from "./ChannelSidebar"
import { fetchGroups, type Group } from "../actions/groups"

type ChatPageClientProps = {
  userId: string
  userAvatar: string
  userDisplayName: string
}

export function ChatPageClient({ userId, userAvatar, userDisplayName }: ChatPageClientProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)

  const loadGroups = useCallback(async () => {
    setIsLoadingGroups(true)
    const result = await fetchGroups(userId)
    if (result.success && result.data) {
      setGroups(result.data)
    } else {
      console.error("Error fetching groups:", result.error)
    }
    setIsLoadingGroups(false)
  }, [userId])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  return (
    <div className="flex h-[calc(100vh-60px)]">
      <ChatSidebar
        userId={userId}
        onGroupSelect={(groupId) => setSelectedGroupId(groupId)}
        groups={groups}
        isLoadingGroups={isLoadingGroups}
        onGroupsChange={loadGroups}
      />
      {selectedGroupId && (
        <ChannelSidebar
          groupId={selectedGroupId}
          userId={userId}
          userAvatar={userAvatar}
          userDisplayName={userDisplayName}
        />
      )}
      <div className="flex-1 p-4">
        <ChatSection userId={userId} groupId={selectedGroupId || ""} />
      </div>
    </div>
  )
}

