"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { historicalEventsData } from "../data/historical-events-data"
import { CalendarDays, TrendingDown, TrendingUp, AlertTriangle, BookOpen, DollarSign } from "lucide-react"

export function HistoricalEventsSection() {
  const [era, setEra] = useState("all")
  const [category, setCategory] = useState("all")

  const filteredEvents = historicalEventsData.events.filter((event) => {
    const matchesEra = era === "all" || event.era === era
    const matchesCategory = category === "all" || event.category === category
    return matchesEra && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-medium">Financial History Timeline</h3>
          <p className="text-muted-foreground">Learn from the past to prepare for the future</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={era} onValueChange={setEra}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select era" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Eras</SelectItem>
              <SelectItem value="ancient">Ancient</SelectItem>
              <SelectItem value="medieval">Medieval</SelectItem>
              <SelectItem value="industrial">Industrial Revolution</SelectItem>
              <SelectItem value="modern">Modern Era</SelectItem>
              <SelectItem value="contemporary">Contemporary</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="markets">Markets & Exchanges</SelectItem>
              <SelectItem value="crisis">Financial Crises</SelectItem>
              <SelectItem value="innovation">Financial Innovations</SelectItem>
              <SelectItem value="currency">Currency & Banking</SelectItem>
              <SelectItem value="regulation">Regulation & Policy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

        <div className="space-y-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Date column with timeline dot */}
                  <div className="md:w-32 flex md:flex-col md:items-end">
                    <div className="font-medium text-lg">{event.year}</div>
                    <div className="text-sm text-muted-foreground hidden md:block">{event.era}</div>

                    {/* Timeline dot - visible only on md+ screens */}
                    <div className="absolute left-16 top-1.5 w-4 h-4 rounded-full border-2 border-primary bg-background hidden md:block" />
                  </div>

                  {/* Content */}
                  <Card className="flex-1 md:ml-8">
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <CategoryIcon category={event.category} />
                            {getCategoryLabel(event.category)}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-primary/10">
                          {event.location}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{event.description}</p>

                      {event.impact && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Impact & Legacy:</h4>
                          <p className="text-sm text-muted-foreground">{event.impact}</p>
                        </div>
                      )}

                      {event.lessons && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium text-sm mb-2">Lessons for Investors:</h4>
                          <ul className="space-y-1">
                            {event.lessons.map((lesson, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <div className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>{lesson}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case "markets":
      return <TrendingUp className="h-4 w-4 text-blue-500" />
    case "crisis":
      return <TrendingDown className="h-4 w-4 text-red-500" />
    case "innovation":
      return <BookOpen className="h-4 w-4 text-green-500" />
    case "currency":
      return <DollarSign className="h-4 w-4 text-amber-500" />
    case "regulation":
      return <AlertTriangle className="h-4 w-4 text-purple-500" />
    default:
      return <CalendarDays className="h-4 w-4" />
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "markets":
      return "Markets & Exchanges"
    case "crisis":
      return "Financial Crisis"
    case "innovation":
      return "Financial Innovation"
    case "currency":
      return "Currency & Banking"
    case "regulation":
      return "Regulation & Policy"
    default:
      return category
  }
}

