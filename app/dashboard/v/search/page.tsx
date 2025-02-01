"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type User = {
  id: string
  name: string
  avatar_url: string
}

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm) return

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .ilike("name", `%${searchTerm}%`)
      .limit(10)

    if (error) {
      console.error("Error searching users:", error)
    } else {
      //setSearchResults(data)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Search Users</h1>
      <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for users..."
          className="flex-grow"
        />
        <Button type="submit">Search</Button>
      </form>
      <div className="space-y-4">
        {searchResults.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <span>{user.name}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

