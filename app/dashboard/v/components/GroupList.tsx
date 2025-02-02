"use client"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { Group } from "../actions/groups"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Crown } from "lucide-react"

type GroupWithCreator = Group & {
  creatorInfo?: {
    displayName: string
    username: string
    avatarUrl: string | null
  }
}

type GroupListProps = {
  userId: string
  isPrivate: boolean
  activeGroupId: string | null
  onGroupSelect: (groupId: string) => void
  groups: GroupWithCreator[]
}

export function GroupList({ userId, isPrivate, activeGroupId, onGroupSelect, groups }: GroupListProps) {
  // const [groups, setGroups] = useState<GroupWithCreator[]>([])
  // const [error, setError] = useState<string | null>(null)
  // const [isLoading, setIsLoading] = useState(true)

  // const loadGroups = useCallback(async () => {
  //   setIsLoading(true)
  //   const result = await fetchGroups(userId)
  //   if (result.success && result.data) {
  //     const filteredGroups = result.data.filter((group) => group.is_private === isPrivate)
  //     const groupsWithCreatorInfo = await Promise.all(
  //       filteredGroups.map(async (group) => {
  //         const creatorResult = await getProfile(group.created_by)
  //         if (creatorResult.success && creatorResult.data) {
  //           return {
  //             ...group,
  //             creatorInfo: {
  //               displayName: creatorResult.data.display_name,
  //               username: creatorResult.data.username,
  //               avatarUrl: creatorResult.data.avatar_url,
  //             },
  //           }
  //         }
  //         return group
  //       }),
  //     )
  //     setGroups(groupsWithCreatorInfo)
  //     setError(null)
  //   } else {
  //     console.error("Error fetching groups:", result.error)
  //     setError(result.error || "Failed to fetch groups")
  //   }
  //   setIsLoading(false)
  // }, [userId, isPrivate])

  // useEffect(() => {
  //   loadGroups()
  // }, [loadGroups])

  // if (isLoading) {
  //   return <div className="text-center">Loading groups...</div>
  // }

  // if (error) {
  //   return <div className="text-red-500 px-4">Error: {error}</div>
  // }

  return (
    <div className="space-y-2 px-4">
      {groups.map((group) => (
        <TooltipProvider key={group.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card
                className={cn(
                  "cursor-pointer hover:bg-accent transition-colors",
                  activeGroupId === group.id && "bg-accent",
                )}
                onClick={() => onGroupSelect(group.id)}
              >
                <CardHeader className="p-3">
                  <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{group.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{group.name}</span>
                  </CardTitle>
                </CardHeader>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="p-0 w-64">
              <div className="p-4 bg-popover rounded-md shadow-md">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold">Members:</span>
                  <span>{group.member_ids.length}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Crown className="h-4 w-4 mt-1 flex-shrink-0" />
                  <div className="flex-grow">
                    <span className="font-semibold">Creator:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={group.creatorInfo?.avatarUrl || undefined} />
                        <AvatarFallback>{group.creatorInfo?.displayName?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-grow">
                        <div className="text-sm font-medium truncate">
                          {group.creatorInfo?.displayName || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          @{group.creatorInfo?.username || "unknown"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {groups.length === 0 && <p className="text-sm text-muted-foreground px-2">No groups found</p>}
    </div>
  )
}

