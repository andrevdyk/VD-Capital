"use client"

import { MessageSquare, Phone, Settings, CalendarDays} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type SimpleSidebarProps = {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function SimpleSidebar({ activeSection, onSectionChange }: SimpleSidebarProps) {
  const sections = [
    { id: "chats", icon: MessageSquare, label: "Chats" },
    { id: "calls", icon: Phone, label: "Calls" },
    { id: "meetings", icon: CalendarDays, label: "Meetings" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="flex flex-col items-center space-y-4 py-4 w-16 border-r">
      <TooltipProvider>
        {sections.map((section) => (
          <Tooltip key={section.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeSection === section.id ? "default" : "ghost"}
                size="icon"
                onClick={() => onSectionChange(section.id)}
              >
                <section.icon className="h-5 w-5" />
                <span className="sr-only">{section.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{section.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}

