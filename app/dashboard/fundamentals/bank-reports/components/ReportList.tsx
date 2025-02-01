'use client'

import { useEffect, useState, useCallback } from 'react'
import { Report } from '../types/report'
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from 'next/link'
import { getReports } from '../actions/reportActions'
import { useInView } from 'react-intersection-observer'

const assetClasses = ['All', 'Currencies', 'Commodities', 'Cryptocurrencies', 'Stocks', 'Indices']

export default function ReportList() {
  const [reports, setReports] = useState<Report[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [assetClass, setAssetClass] = useState('All')
  const { ref, inView } = useInView()

  const loadMoreReports = useCallback(async (reset = false) => {
    if (loading) return
    setLoading(true)
    const currentPage = reset ? 1 : page
    const result = await getReports(currentPage, 10, search, assetClass)
    setLoading(false)

    if (result) {
      setReports(prevReports => reset ? result.reports : [...prevReports, ...result.reports])
      setHasMore(result.hasMore)
      setPage(prevPage => reset ? 2 : prevPage + 1)
    }
  }, [loading, page, search, assetClass])

  useEffect(() => {
    setReports([])
    setPage(1)
    setHasMore(true)
    loadMoreReports(true)
  }, [loadMoreReports, search, assetClass]) //Fixed unnecessary dependencies

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreReports()
    }
  }, [inView, hasMore, loading, loadMoreReports])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleAssetClassChange = (value: string) => {
    setAssetClass(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Reports</CardTitle>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={handleSearch}
          />
          <Select value={assetClass} onValueChange={handleAssetClassChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select asset class" />
            </SelectTrigger>
            <SelectContent>
              {assetClasses.map((ac) => (
                <SelectItem key={ac} value={ac}>{ac}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-300px)]">
        {reports.map((report: Report) => (
          <Link href={`?reportId=${report.id}`} key={report.id}>
            <div className="p-4 hover:bg-muted cursor-pointer border-b last:border-b-0 h-24 flex flex-col justify-center">
              <h3 className="font-semibold text-lg mb-1 truncate">{report.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{report.publisher}</p>
              <p className="text-xs text-muted-foreground">{new Date(report.published_date).toLocaleDateString()}</p>
            </div>
          </Link>
        ))}
        {hasMore && (
          <div ref={ref} className="p-4 text-center">
            {loading ? 'Loading more reports...' : 'Load more'}
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}