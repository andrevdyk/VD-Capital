"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Info, AlertTriangle, ArrowRight } from "lucide-react"
import { glossaryTerms } from "../data/glossary-data"

export function GlossarySection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)

  const filteredTerms = glossaryTerms.filter((term) => {
    const matchesSearch =
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = category === "all" || term.category === category
    return matchesSearch && matchesCategory
  })

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "fundamentals", label: "Fundamentals" },
    { value: "technical", label: "Technical Analysis" },
    { value: "economics", label: "Economics" },
    { value: "markets", label: "Markets" },
    { value: "instruments", label: "Trading Instruments" },
  ]

  const selectedTermData = glossaryTerms.find((term) => term.term === selectedTerm)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms or definitions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((term, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTerm(term.term)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{term.term}</CardTitle>
                  <Badge variant="outline">{getCategoryLabel(term.category)}</Badge>
                </div>
                <CardDescription className="line-clamp-1">{term.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{term.definition}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No terms found matching your criteria.</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("")
                setCategory("all")
              }}
            >
              Reset filters
            </Button>
          </div>
        )}
      </div>

      <Dialog open={selectedTerm !== null} onOpenChange={(open) => !open && setSelectedTerm(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedTermData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  {selectedTermData.term}
                  <Badge variant="outline" className="ml-2">
                    {getCategoryLabel(selectedTermData.category)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>Comprehensive explanation and visual guide</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="visual">Visual Guide</TabsTrigger>
                  <TabsTrigger value="misconceptions">Misconceptions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="prose max-w-none dark:prose-invert">
                    <h3>Definition</h3>
                    <p>{selectedTermData.definition}</p>

                    {selectedTermData.extendedDefinition && (
                      <>
                        <h3>Detailed Explanation</h3>
                        <p>{selectedTermData.extendedDefinition}</p>
                      </>
                    )}

                    {selectedTermData.keyPoints && (
                      <>
                        <h3>Key Points</h3>
                        <ul>
                          {selectedTermData.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {selectedTermData.examples && (
                      <>
                        <h3>Examples</h3>
                        <ul>
                          {selectedTermData.examples.map((example, index) => (
                            <li key={index}>{example}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {selectedTermData.relatedTerms && (
                      <>
                        <h3>Related Terms</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedTermData.relatedTerms.map((term, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => setSelectedTerm(term)}
                            >
                              {term}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="visual" className="space-y-4 mt-4">
                  {selectedTermData.visualGuide ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={selectedTermData.visualGuide.image || "/placeholder.svg?height=400&width=600"}
                            alt={`Visual guide for ${selectedTermData.term}`}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="prose max-w-none dark:prose-invert">
                        <h3>How to Identify/Draw</h3>
                        <p>{selectedTermData.visualGuide.howToIdentify}</p>

                        {selectedTermData.visualGuide.steps && (
                          <>
                            <h4>Step-by-Step Guide</h4>
                            <ol>
                              {selectedTermData.visualGuide.steps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">No Visual Guide Available</h3>
                      <p className="text-muted-foreground">
                        This term doesn't have a visual guide yet. Check back later for updates.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="misconceptions" className="space-y-4 mt-4">
                  {selectedTermData.misconceptions ? (
                    <div className="space-y-4">
                      <div className="prose max-w-none dark:prose-invert">
                        <h3>Common Misconceptions</h3>
                        <ul>
                          {selectedTermData.misconceptions.map((misconception, index) => (
                            <li key={index} className="mb-4">
                              <div className="flex gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-amber-700 dark:text-amber-400">{misconception.myth}</strong>
                                  <p>{misconception.reality}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">No Misconceptions Listed</h3>
                      <p className="text-muted-foreground">
                        We haven't documented common misconceptions for this term yet. Check back later for updates.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setSelectedTerm(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "fundamentals":
      return "Fundamentals"
    case "technical":
      return "Technical Analysis"
    case "economics":
      return "Economics"
    case "markets":
      return "Markets"
    case "instruments":
      return "Trading Instruments"
    default:
      return category
  }
}

