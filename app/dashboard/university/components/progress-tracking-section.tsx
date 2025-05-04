"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { progressTrackingData } from "../data/progress-tracking-data"
import { CheckCircle, Clock, AlertCircle, BookOpen, Play, BarChart2, Search } from "lucide-react"

export function ProgressTrackingSection() {
  const [pathFilter, setPathFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLessons = progressTrackingData.lessons.filter((lesson) => {
    const matchesPath = pathFilter === "all" || lesson.path === pathFilter
    const matchesStatus = statusFilter === "all" || lesson.status === statusFilter
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.module.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesPath && matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {progressTrackingData.summary.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className={`p-2 rounded-full ${getStatColor(stat.type)}`}>
                  {stat.type === "completed" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {stat.type === "inProgress" && <Clock className="h-5 w-5 text-amber-600" />}
                  {stat.type === "notStarted" && <AlertCircle className="h-5 w-5 text-blue-600" />}
                </div>
              </div>
              <Progress value={stat.percentage} className="h-2 mt-2" indicatorClassName={getProgressColor(stat.type)} />
              <p className="text-sm text-muted-foreground mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all-lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all-lessons">All Lessons</TabsTrigger>
          <TabsTrigger value="recommended">Recommended Next</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
        </TabsList>

        <TabsContent value="all-lessons" className="mt-0 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search lessons..."
                className="pl-8 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={pathFilter} onValueChange={setPathFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by path" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Paths</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="inProgress">In Progress</SelectItem>
                <SelectItem value="notStarted">Not Started</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Lesson</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Module</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Path</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {lesson.type === "video" && <Play className="h-4 w-4 text-primary" />}
                        {lesson.type === "reading" && <BookOpen className="h-4 w-4 text-primary" />}
                        {lesson.type === "interactive" && <BarChart2 className="h-4 w-4 text-primary" />}
                        <span>{lesson.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{lesson.module}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline" className={getPathBadgeColor(lesson.path)}>
                        {lesson.path}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{lesson.duration}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        {lesson.status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {lesson.status === "inProgress" && <Clock className="h-4 w-4 text-amber-500" />}
                        {lesson.status === "notStarted" && <AlertCircle className="h-4 w-4 text-blue-500" />}
                        {lesson.status === "locked" && <AlertCircle className="h-4 w-4 text-gray-400" />}
                        <span>{getStatusLabel(lesson.status)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button variant="outline" size="sm" disabled={lesson.status === "locked"}>
                        {getActionLabel(lesson.status)}
                      </Button>
                    </td>
                  </tr>
                ))}

                {filteredLessons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No lessons found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Next Steps</CardTitle>
              <CardDescription>Based on your progress and learning goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressTrackingData.recommended.map((item, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-muted p-4 flex items-center justify-center md:w-48">
                        {item.type === "video" && <Play className="h-8 w-8 text-primary" />}
                        {item.type === "reading" && <BookOpen className="h-8 w-8 text-primary" />}
                        {item.type === "interactive" && <BarChart2 className="h-8 w-8 text-primary" />}
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.module}</p>
                          </div>
                          <Badge variant="outline" className={getPathBadgeColor(item.path)}>
                            {item.path}
                          </Badge>
                        </div>
                        <p className="text-sm mb-4">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">{item.duration}</div>
                          <Button size="sm">Start Now</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookmarked" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Bookmarked Lessons</CardTitle>
              <CardDescription>Lessons you've saved for later</CardDescription>
            </CardHeader>
            <CardContent>
              {progressTrackingData.bookmarked.length > 0 ? (
                <div className="space-y-4">
                  {progressTrackingData.bookmarked.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        {item.type === "video" && <Play className="h-5 w-5 text-primary mt-0.5" />}
                        {item.type === "reading" && <BookOpen className="h-5 w-5 text-primary mt-0.5" />}
                        {item.type === "interactive" && <BarChart2 className="h-5 w-5 text-primary mt-0.5" />}
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.module} • {item.duration}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Bookmarked Lessons</h3>
                  <p className="text-muted-foreground">
                    You haven't bookmarked any lessons yet. Bookmark lessons to save them for later.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getStatColor(type: string): string {
  switch (type) {
    case "completed":
      return "bg-green-100 dark:bg-green-900/20"
    case "inProgress":
      return "bg-amber-100 dark:bg-amber-900/20"
    case "notStarted":
      return "bg-blue-100 dark:bg-blue-900/20"
    default:
      return "bg-gray-100 dark:bg-gray-900/20"
  }
}

function getProgressColor(type: string): string {
  switch (type) {
    case "completed":
      return "bg-green-500"
    case "inProgress":
      return "bg-amber-500"
    case "notStarted":
      return "bg-blue-500"
    default:
      return "bg-gray-500"
  }
}

function getPathBadgeColor(path: string): string {
  switch (path) {
    case "Beginner":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
    case "Intermediate":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
    case "Advanced":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
    default:
      return ""
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Completed"
    case "inProgress":
      return "In Progress"
    case "notStarted":
      return "Not Started"
    case "locked":
      return "Locked"
    default:
      return status
  }
}

function getActionLabel(status: string): string {
  switch (status) {
    case "completed":
      return "Review"
    case "inProgress":
      return "Continue"
    case "notStarted":
      return "Start"
    case "locked":
      return "Locked"
    default:
      return "View"
  }
}

