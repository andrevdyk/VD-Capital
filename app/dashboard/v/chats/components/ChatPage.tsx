"use client"

import { useState } from "react"
import { SimpleSidebar } from "./SimpleSidebar"
import { MeetingsPage } from "./MeetingsPage"

type ChatPageClientProps = {
  userId: string
}

export function ChatPageClient({ userId }: ChatPageClientProps) {
  const [activeSection, setActiveSection] = useState("chats")

  return (
    <div className="flex h-[calc(100vh-60px)]">
      <SimpleSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 p-4 overflow-auto">
        {activeSection === "chats" && <p>Chats content will be displayed here.</p>}
        {activeSection === "calls" && <p>Calls content will be displayed here.</p>}
        {activeSection === "meetings" && <MeetingsPage userId={userId} />}
        {activeSection === "settings" && <p>Settings content will be displayed here.</p>}
      </div>
    </div>
  )
}

