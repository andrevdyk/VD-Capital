"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { learningPaths } from "../data/learning-path-data"
import { CheckCircle, Lock, PlayCircle, BookOpen, BarChart2 } from "lucide-react"

export function LearningPathSection() {
  const [selectedLevel, setSelectedLevel] = useState("beginner")

  const currentPath = learningPaths.find((path) => path.id === selectedLevel)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {learningPaths.map((path) => (
          <Button
            key={path.id}
            variant={selectedLevel === path.id ? "default" : "outline"}
            onClick={() => setSelectedLevel(path.id)}
            className="flex items-center gap-2"
          >
            {path.icon === "chart" && <BarChart2 className="h-4 w-4" />}
            {path.icon === "book" && <BookOpen className="h-4 w-4" />}
            {path.name}
          </Button>
        ))}
      </div>

      {currentPath && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{currentPath.name}</CardTitle>
              <CardDescription>{currentPath.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-medium">{currentPath.progress}%</span>
                  </div>
                  <Progress value={currentPath.progress} className="h-2" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-primary/10">
                    {currentPath.modules.length} Modules
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10">
                    {currentPath.estimatedHours} Hours
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10">
                    {currentPath.difficulty}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Accordion type="multiple" className="w-full">
            {currentPath.modules.map((module, index) => (
              <AccordionItem key={index} value={`module-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border">
                      {module.completed ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : module.locked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <span className="text-sm">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{module.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {module.lessons.length} lessons • {module.estimatedMinutes} min
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-10 space-y-4">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <Card key={lessonIndex} className={`${lesson.locked ? "opacity-60" : ""}`}>
                        <CardHeader className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <CardTitle className="text-base">{lesson.title}</CardTitle>
                              <CardDescription>
                                {lesson.type} • {lesson.duration} min
                              </CardDescription>
                            </div>
                            {lesson.completed && <CheckCircle className="h-5 w-5 text-primary" />}
                            {lesson.locked && <Lock className="h-5 w-5 text-muted-foreground" />}
                          </div>
                        </CardHeader>
                        {!lesson.locked && (
                          <CardFooter className="p-4 pt-0">
                            <Button variant="outline" size="sm" className="gap-1">
                              {lesson.type === "Video" ? (
                                <PlayCircle className="h-4 w-4" />
                              ) : (
                                <BookOpen className="h-4 w-4" />
                              )}
                              {lesson.completed ? "Review" : "Start"}
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    ))}

                    {!module.locked && (
                      <Card className="bg-muted/50">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Module Assessment</CardTitle>
                          <CardDescription>
                            Quiz • {module.quizQuestions} questions • {module.quizMinutes} min
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0">
                          <Button variant="outline" size="sm" disabled={!module.allLessonsCompleted}>
                            {module.quizCompleted ? "Retake Quiz" : "Take Quiz"}
                          </Button>
                        </CardFooter>
                      </Card>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  )
}

