"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchGroups } from "../actions/groups"

type Group = {
  id: string
  name: string
  is_private: boolean
}

export default function GroupList({ userId }: { userId: string }) {
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    const loadGroups = async () => {
      const result = await fetchGroups(userId)
      if (result.success) {
        setGroups(result.data)
      } else {
        console.error("Error fetching groups:", result.error)
      }
    }
    loadGroups()
  }, [userId])

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {group.name}
              {group.is_private && (
                <span className="ml-2 text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-1">
                  Private
                </span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

