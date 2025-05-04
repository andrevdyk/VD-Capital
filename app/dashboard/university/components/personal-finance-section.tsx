"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { personalFinanceData } from "../data/personal-finance-data"
import {
  DollarSign,
  TrendingDown,
  Umbrella,
  Home,
  GraduationCap,
  Heart,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react"

export function PersonalFinanceSection() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {personalFinanceData.quickTips.map((tip, index) => (
          <Card key={index} className="bg-muted/30">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <div className="mt-1 bg-primary/10 p-2 rounded-full">
                  {tip.icon === "dollar" && <DollarSign className="h-4 w-4 text-primary" />}
                  {tip.icon === "trending" && <TrendingDown className="h-4 w-4 text-primary" />}
                  {tip.icon === "umbrella" && <Umbrella className="h-4 w-4 text-primary" />}
                </div>
                <div>
                  <CardTitle className="text-base">{tip.title}</CardTitle>
                  <CardDescription>{tip.subtitle}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{tip.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="life-stages" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="life-stages">Life Stages</TabsTrigger>
          <TabsTrigger value="financial-situations">Financial Situations</TabsTrigger>
          <TabsTrigger value="market-conditions">Market Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="life-stages" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personalFinanceData.lifeStages.map((stage, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {stage.icon === "graduation" && <GraduationCap className="h-5 w-5 text-primary" />}
                    {stage.icon === "home" && <Home className="h-5 w-5 text-primary" />}
                    {stage.icon === "heart" && <Heart className="h-5 w-5 text-primary" />}
                    <CardTitle>{stage.title}</CardTitle>
                  </div>
                  <CardDescription>{stage.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Financial Priorities:</h4>
                      <div className="flex flex-wrap gap-2">
                        {stage.priorities.map((priority, i) => (
                          <Badge key={i} variant="outline" className="bg-primary/10">
                            {priority}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Strategies:</h4>
                      <ul className="space-y-2">
                        {stage.strategies.map((strategy, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <ArrowUpRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {stage.pitfalls && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Common Pitfalls:</h4>
                        <ul className="space-y-2">
                          {stage.pitfalls.map((pitfall, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span>{pitfall}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial-situations" className="mt-0">
          <Accordion type="single" collapsible className="w-full">
            {personalFinanceData.financialSituations.map((situation, index) => (
              <AccordionItem key={index} value={`situation-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <Badge
                      variant={
                        situation.severity === "high"
                          ? "destructive"
                          : situation.severity === "medium"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {situation.severity === "high"
                        ? "Urgent"
                        : situation.severity === "medium"
                          ? "Important"
                          : "Consider"}
                    </Badge>
                    <span>{situation.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-4">
                    <p>{situation.description}</p>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Immediate Steps:</h4>
                      <ol className="space-y-2 list-decimal list-inside">
                        {situation.immediateSteps.map((step, i) => (
                          <li key={i} className="text-sm">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Long-term Strategy:</h4>
                      <p className="text-sm">{situation.longTermStrategy}</p>
                    </div>

                    {situation.resourcesNeeded && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Resources You May Need:</h4>
                        <ul className="space-y-1">
                          {situation.resourcesNeeded.map((resource, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <div className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span>{resource}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="market-conditions" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personalFinanceData.marketConditions.map((condition, index) => (
              <Card
                key={index}
                className={
                  condition.type === "negative"
                    ? "border-red-200 dark:border-red-800"
                    : condition.type === "positive"
                      ? "border-green-200 dark:border-green-800"
                      : ""
                }
              >
                <CardHeader
                  className={
                    condition.type === "negative"
                      ? "bg-red-50 dark:bg-red-950/20"
                      : condition.type === "positive"
                        ? "bg-green-50 dark:bg-green-950/20"
                        : ""
                  }
                >
                  <CardTitle className="text-lg">{condition.title}</CardTitle>
                  <CardDescription>{condition.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">What to Do:</h4>
                      <ul className="space-y-2">
                        {condition.whatToDo.map((action, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <ArrowUpRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">What to Avoid:</h4>
                      <ul className="space-y-2">
                        {condition.whatToAvoid.map((action, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">Historical Perspective:</h4>
                      <p className="text-sm">{condition.historicalPerspective}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

