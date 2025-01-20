'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Report } from '../types/report'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { getReportById } from '../actions/reportActions'

export default function ReportDetail() {
  const searchParams = useSearchParams()
  const reportId = searchParams.get('reportId')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    if (reportId) {
      getReportById(reportId).then(setSelectedReport)
    } else {
      setSelectedReport(null)
    }
  }, [reportId])

  if (!selectedReport) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Select a report to view details</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{selectedReport.title}</CardTitle>
        <CardDescription>{selectedReport.publisher} - {new Date(selectedReport.published_date).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p className="mb-4 text-muted-foreground">{selectedReport.ai_summary}</p>
        <h2 className="text-xl font-semibold mb-2">Full Report</h2>
        <iframe src={selectedReport.pdf_url} className="w-full h-[600px]" title={selectedReport.title} />
      </CardContent>
    </Card>
  )
}

