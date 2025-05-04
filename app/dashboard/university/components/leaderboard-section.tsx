"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Star, TrendingUp } from "lucide-react"
import { leaderboardData } from "../data/leaderboard-data"

export function LeaderboardSection() {
  const [timeframe, setTimeframe] = useState("weekly")

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Community Leaderboard</h2>
          <p className="text-muted-foreground">See who's leading the way in learning and trading challenges</p>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">This Week</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="alltime">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="courses">Course Completion</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz Performance</TabsTrigger>
          <TabsTrigger value="optiver">Optiver Challenge</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-0">
          <LeaderboardTable
            data={leaderboardData.courses[timeframe]}
            columns={[
              { header: "Rank", accessor: "rank" },
              { header: "User", accessor: "user" },
              { header: "Courses Completed", accessor: "completed" },
              { header: "Total Hours", accessor: "hours" },
              { header: "Streak", accessor: "streak" },
              { header: "Badges", accessor: "badges" },
            ]}
          />
        </TabsContent>

        <TabsContent value="quizzes" className="mt-0">
          <LeaderboardTable
            data={leaderboardData.quizzes[timeframe]}
            columns={[
              { header: "Rank", accessor: "rank" },
              { header: "User", accessor: "user" },
              { header: "Avg. Score", accessor: "score" },
              { header: "Quizzes Taken", accessor: "quizzes" },
              { header: "Perfect Scores", accessor: "perfect" },
              { header: "Badges", accessor: "badges" },
            ]}
          />
        </TabsContent>

        <TabsContent value="optiver" className="mt-0">
          <LeaderboardTable
            data={leaderboardData.optiver[timeframe]}
            columns={[
              { header: "Rank", accessor: "rank" },
              { header: "User", accessor: "user" },
              { header: "Score", accessor: "score" },
              { header: "Profit/Loss", accessor: "pnl" },
              { header: "Best Trade", accessor: "bestTrade" },
              { header: "Badges", accessor: "badges" },
            ]}
          />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>How to Climb the Leaderboard</CardTitle>
          <CardDescription>Improve your ranking by participating in these activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-primary/10 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Complete Courses</h3>
                <p className="text-sm text-muted-foreground">Finish modules and entire learning paths to earn points</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-primary/10 p-2 rounded-full">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Ace Your Quizzes</h3>
                <p className="text-sm text-muted-foreground">Score high on quizzes to boost your ranking</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-primary/10 p-2 rounded-full">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Trading Challenges</h3>
                <p className="text-sm text-muted-foreground">
                  Participate in the Optiver challenge and other competitions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface LeaderboardTableProps {
  data: any[]
  columns: { header: string; accessor: string }[]
}

function LeaderboardTable({ data, columns }: LeaderboardTableProps) {
  return (
    <div className="rounded-md border overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              {columns.map((column, i) => (
                <th key={i} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={`border-t ${i < 3 ? "bg-muted/20" : ""}`}>
                {columns.map((column, j) => (
                  <td key={j} className="px-4 py-3 text-sm">
                    {column.accessor === "rank" ? (
                      <div className="flex items-center">
                        {row.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500 mr-1.5" />}
                        {row.rank === 2 && <Medal className="h-4 w-4 text-gray-400 mr-1.5" />}
                        {row.rank === 3 && <Award className="h-4 w-4 text-amber-700 mr-1.5" />}
                        {row.rank}
                      </div>
                    ) : column.accessor === "user" ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={row.user} />
                          <AvatarFallback>{row.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{row.user}</span>
                      </div>
                    ) : column.accessor === "badges" ? (
                      <div className="flex gap-1">
                        {row.badges.map((badge: string, k: number) => (
                          <Badge key={k} variant="outline" className="bg-primary/10">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    ) : column.accessor === "pnl" ? (
                      <span className={row.pnl.startsWith("+") ? "text-green-600" : "text-red-600"}>{row.pnl}</span>
                    ) : (
                      row[column.accessor]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

