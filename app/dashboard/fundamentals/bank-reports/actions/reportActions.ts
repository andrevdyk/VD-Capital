'use server'

import { createClient } from "@/utils/supabase/server"
import { Report } from "../types/report"

export async function getReports(
  page: number = 1, 
  pageSize: number = 10, 
  search: string = '',
  assetClass: string = 'All'
): Promise<{ reports: Report[], hasMore: boolean } | null> {
  const supabase = createClient()

  try {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .order('published_date', { ascending: false })

    if (search) {
      query = query.or(`title.ilike.%${search}%,ai_summary.ilike.%${search}%`)
    }

    if (assetClass !== 'All') {
      query = query.eq('asset_class', assetClass)
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Error fetching reports:', error)
      return null
    }

    return {
      reports: data as Report[],
      hasMore: (count ?? 0) > to + 1
    }
  } catch (error) {
    console.error('Unexpected error in getReports:', error)
    throw new Error(`Failed to fetch reports: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getReportById(id: string): Promise<Report | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching report:', error)
      return null
    }

    return data as Report
  } catch (error) {
    console.error('Unexpected error in getReportById:', error)
    return null
  }
}