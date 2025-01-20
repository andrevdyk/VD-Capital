'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchBar() {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/?search=${encodeURIComponent(search)}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
      <Input
        type="text"
        placeholder="Search reports"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-grow"
      />
      <Button type="submit">Search</Button>
    </form>
  )
}

