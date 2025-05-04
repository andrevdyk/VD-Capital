"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { roadmapData } from "../data/roadmap-data"

export function RoadmapSection() {
  const [selectedCategory, setSelectedCategory] = useState("fundamentals")

  const currentRoadmap = roadmapData.find((r) => r.id === selectedCategory)

  return (
    <div className="space-y-6">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
          <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
          <TabsTrigger value="economics">Economics</TabsTrigger>
        </TabsList>

        {roadmapData.map((roadmap) => (
          <TabsContent key={roadmap.id} value={roadmap.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{roadmap.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                  <div className="space-y-8">
                    {roadmap.steps.map((step, index) => (
                      <div key={index} className="relative pl-12">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-lg font-medium">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>

                          {step.topics && (
                            <div className="grid gap-2 pt-2">
                              {step.topics.map((topic, topicIndex) => (
                                <div key={topicIndex} className="flex items-start gap-2">
                                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                                  <span>{topic}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {step.resources && (
                            <div className="pt-2">
                              <h4 className="text-sm font-medium mb-2">Recommended Resources:</h4>
                              <ul className="space-y-1 text-sm">
                                {step.resources.map((resource, resourceIndex) => (
                                  <li key={resourceIndex} className="text-muted-foreground">
                                    • {resource}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

