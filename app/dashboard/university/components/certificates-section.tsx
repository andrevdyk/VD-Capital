"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { certificatesData } from "../data/certificates-data"
import { Award, Download, Share2, Calendar, CheckCircle, Clock } from "lucide-react"

export function CertificatesSection() {
  const [filter, setFilter] = useState("all")

  const filteredCertificates = certificatesData.certificates.filter(
    (cert) => filter === "all" || cert.category === filter,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Certificates & Achievements</h2>
          <p className="text-muted-foreground">Track your learning journey and showcase your expertise</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Certificates</SelectItem>
              <SelectItem value="course">Course Completion</SelectItem>
              <SelectItem value="specialization">Specialization</SelectItem>
              <SelectItem value="challenge">Challenge</SelectItem>
              <SelectItem value="skill">Skill Assessment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map((certificate, index) => (
          <Card key={index} className="overflow-hidden">
            <div className={`h-3 ${getCertificateCategoryColor(certificate.category)}`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{certificate.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Issued: {certificate.issueDate}</span>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  {getCertificateCategoryLabel(certificate.category)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted/50 rounded-md flex items-center justify-center mb-4 overflow-hidden">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
                    <Award className="h-16 w-16 text-primary/70" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-center text-sm">
                    {certificate.title}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>
                    <span className="font-medium">Completion Status:</span>{" "}
                    {certificate.completed ? "Completed" : "In Progress"}
                  </span>
                </div>

                {certificate.expiryDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>
                      <span className="font-medium">Valid Until:</span> {certificate.expiryDate}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span>
                    <span className="font-medium">Credential ID:</span> {certificate.credentialId}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </CardFooter>
          </Card>
        ))}

        {filteredCertificates.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Award className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Certificates Found</h3>
            <p className="text-muted-foreground max-w-md">
              You don't have any certificates in this category yet. Complete courses and challenges to earn
              certificates.
            </p>
          </div>
        )}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Certificates Progress Overview</CardTitle>
          <CardDescription>Your journey toward completing all available certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {certificatesData.progress.map((category, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">
                        {category.earned}/{category.total}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(category.earned / category.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getCertificateCategoryColor(category: string): string {
  switch (category) {
    case "course":
      return "bg-blue-500"
    case "specialization":
      return "bg-purple-500"
    case "challenge":
      return "bg-amber-500"
    case "skill":
      return "bg-green-500"
    default:
      return "bg-gray-500"
  }
}

function getCertificateCategoryLabel(category: string): string {
  switch (category) {
    case "course":
      return "Course Completion"
    case "specialization":
      return "Specialization"
    case "challenge":
      return "Challenge"
    case "skill":
      return "Skill Assessment"
    default:
      return category
  }
}

