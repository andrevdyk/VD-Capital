"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { alternativeInvestmentsData } from "../data/alternative-investments-data"
import {
  Building,
  Gem,
  Briefcase,
  TreePine,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  AlertTriangle,
} from "lucide-react"

export function AlternativeInvestmentsSection() {
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="prose max-w-none dark:prose-invert mb-6">
        <p>
          While traditional financial markets offer many investment opportunities, alternative investments can provide
          diversification, potentially higher returns, and protection against market volatility. Explore these options
          to build a more resilient portfolio.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alternativeInvestmentsData.types.map((investment, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${selectedInvestment === investment.id ? "ring-2 ring-primary" : "hover:shadow-md"}`}
                onClick={() => setSelectedInvestment(investment.id === selectedInvestment ? null : investment.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {investment.icon === "building" && <Building className="h-5 w-5 text-primary" />}
                    {investment.icon === "gem" && <Gem className="h-5 w-5 text-primary" />}
                    {investment.icon === "briefcase" && <Briefcase className="h-5 w-5 text-primary" />}
                    {investment.icon === "tree" && <TreePine className="h-5 w-5 text-primary" />}
                    {investment.icon === "piggy" && <PiggyBank className="h-5 w-5 text-primary" />}
                    <CardTitle className="text-lg">{investment.title}</CardTitle>
                  </div>
                  <CardDescription>{investment.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Typical Returns:</span>
                    <span className="font-medium">{investment.typicalReturns}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Minimum Investment:</span>
                    <span className="font-medium">{investment.minimumInvestment}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedInvestment && (
            <Card className="mt-6 bg-muted/30">
              <CardHeader>
                <CardTitle>
                  {alternativeInvestmentsData.types.find((i) => i.id === selectedInvestment)?.title}
                </CardTitle>
                <CardDescription>
                  {alternativeInvestmentsData.types.find((i) => i.id === selectedInvestment)?.shortDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm">
                    {alternativeInvestmentsData.types.find((i) => i.id === selectedInvestment)?.fullDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">Advantages</h3>
                    <ul className="space-y-1">
                      {alternativeInvestmentsData.types
                        .find((i) => i.id === selectedInvestment)
                        ?.advantages.map((advantage, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{advantage}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">Disadvantages</h3>
                    <ul className="space-y-1">
                      {alternativeInvestmentsData.types
                        .find((i) => i.id === selectedInvestment)
                        ?.disadvantages.map((disadvantage, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{disadvantage}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">Best For</h3>
                    <ul className="space-y-1">
                      {alternativeInvestmentsData.types
                        .find((i) => i.id === selectedInvestment)
                        ?.bestFor.map((profile, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <div className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span>{profile}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">How to Get Started</h3>
                  <ol className="space-y-1 list-decimal list-inside">
                    {alternativeInvestmentsData.types
                      .find((i) => i.id === selectedInvestment)
                      ?.howToStart.map((step, i) => (
                        <li key={i} className="text-sm">
                          {step}
                        </li>
                      ))}
                  </ol>
                </div>

                <div className="pt-2">
                  <h3 className="font-medium mb-2">Popular Platforms/Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {alternativeInvestmentsData.types
                      .find((i) => i.id === selectedInvestment)
                      ?.platforms.map((platform, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/10">
                          {platform}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Alternative vs. Traditional Investments</CardTitle>
              <CardDescription>
                Compare key characteristics to understand where alternatives fit in your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Characteristic</TableHead>
                      <TableHead>Traditional Investments</TableHead>
                      <TableHead>Alternative Investments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alternativeInvestmentsData.comparison.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.characteristic}</TableCell>
                        <TableCell>{row.traditional}</TableCell>
                        <TableCell>{row.alternative}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-400 mb-1">Important Consideration</h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Alternative investments should typically make up only a portion of a well-diversified portfolio.
                      The appropriate allocation depends on your risk tolerance, investment timeline, and financial
                      goals.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="getting-started" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Steps to Begin with Alternative Investments</CardTitle>
                <CardDescription>A methodical approach to adding alternatives to your portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {alternativeInvestmentsData.gettingStarted.steps.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Factors to Consider</CardTitle>
                <CardDescription>Evaluate these aspects before investing in alternatives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alternativeInvestmentsData.gettingStarted.factors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 bg-primary/10 p-2 rounded-full">
                        {factor.icon === "dollar" && <DollarSign className="h-4 w-4 text-primary" />}
                        {factor.icon === "clock" && <Clock className="h-4 w-4 text-primary" />}
                        {factor.icon === "alert" && <AlertTriangle className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{factor.title}</h3>
                        <p className="text-sm text-muted-foreground">{factor.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Download Alternative Investment Checklist
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

