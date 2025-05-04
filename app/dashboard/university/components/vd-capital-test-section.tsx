"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { vdCapitalTestData } from "../data/vd-capital-test-data"
import { BarChart, Award, Clock } from "lucide-react"

export function VDCapitalTestSection() {
  const [activeTab, setActiveTab] = useState("about")
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">VD Capital Market Making Challenge</CardTitle>
              <CardDescription className="text-base">
                Test your trading skills in a simulated market making environment
              </CardDescription>
            </div>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Challenge
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">Real Market Simulation</h3>
                <p className="text-sm text-muted-foreground">
                  Experience realistic market conditions with order book dynamics
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">Timed Challenges</h3>
                <p className="text-sm text-muted-foreground">Complete trading scenarios under time pressure</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">Compete & Learn</h3>
                <p className="text-sm text-muted-foreground">
                  Compare your results with others and improve your skills
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-0 space-y-4">
          <div className="prose max-w-none dark:prose-invert">
            <h3>What is Market Making?</h3>
            <p>
              Market makers are crucial participants in financial markets who provide liquidity by continuously offering
              to buy and sell assets. They profit from the spread between bid and ask prices while managing inventory
              risk.
            </p>

            <h3>About the VD Capital Challenge</h3>
            <p>
              The VD Capital Market Making Challenge simulates real-world trading scenarios where you act as a market
              maker. Your goal is to provide competitive quotes while managing risk and maximizing profit. This
              challenge tests your:
            </p>

            <ul>
              <li>Understanding of market microstructure</li>
              <li>Risk management skills</li>
              <li>Decision-making under pressure</li>
              <li>Ability to price assets accurately</li>
              <li>Strategy development and optimization</li>
            </ul>

            <h3>How It Works</h3>
            <p>
              You'll be given a virtual trading environment with simulated market data. Your task is to set bid and ask
              prices for various assets, manage your inventory, and respond to changing market conditions. The challenge
              includes multiple scenarios with increasing difficulty.
            </p>

            <h3>Scoring</h3>
            <p>Your performance is evaluated based on:</p>
            <ul>
              <li>Profit and Loss (P&L)</li>
              <li>Quote quality (spread width and competitiveness)</li>
              <li>Risk management (inventory control)</li>
              <li>Reaction time to market events</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vdCapitalTestData.scenarios.map((scenario, index) => (
              <Card key={index} className={scenario.locked ? "opacity-75" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle>{scenario.title}</CardTitle>
                    <Badge
                      variant={
                        scenario.difficulty === "Beginner"
                          ? "outline"
                          : scenario.difficulty === "Intermediate"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {scenario.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Time Limit:</span>
                      <span className="font-medium">{scenario.timeLimit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Assets:</span>
                      <span className="font-medium">{scenario.assets}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Market Conditions:</span>
                      <span className="font-medium">{scenario.marketConditions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate:</span>
                      <span className="font-medium">{scenario.completionRate}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled={scenario.locked}>
                    {scenario.locked ? "Locked" : "Start Challenge"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>See who's leading in the VD Capital Market Making Challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Best Scenario</TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vdCapitalTestData.leaderboard.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={entry.user} />
                              <AvatarFallback>{entry.user.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span>{entry.user}</span>
                          </div>
                        </TableCell>
                        <TableCell>{entry.score}</TableCell>
                        <TableCell className={entry.pnl.startsWith("+") ? "text-green-600" : "text-red-600"}>
                          {entry.pnl}
                        </TableCell>
                        <TableCell>{entry.bestScenario}</TableCell>
                        <TableCell className="text-right">{entry.completed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vdCapitalTestData.resources.map((resource, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{resource.duration}</Badge>
                    <Badge variant="outline">{resource.level}</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    {resource.type === "Video" ? "Watch Now" : resource.type === "Interactive" ? "Try Now" : "Read Now"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

