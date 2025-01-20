/*'use server'

import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'
import { v4 as uuidv4 } from 'uuid'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { Report } from '../types/report'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function processReport(url: string) {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({ format: 'A4' })
    await browser.close()

    const filename = `${uuidv4()}.pdf`
    const { data, error } = await supabase
      .storage
      .from('reports')
      .upload(filename, pdf, {
        contentType: 'application/pdf'
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase
      .storage
      .from('reports')
      .getPublicUrl(filename)

    const content = await page.content()
    const { text: summary } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Summarize the following content from an investment bank report: ${content}`,
    })

    const { text: title } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Extract the title of this investment report: ${content}`,
    })

    const { text: publisherAndAuthor } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Extract the publisher (investment bank name) and author of this report: ${content}`,
    })

    const [publisher, author] = publisherAndAuthor.split(',').map(s => s.trim())

    const { text: publishedDate } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Extract the published date of this report in YYYY-MM-DD format: ${content}`,
    })

    const report: Report = {
      id: uuidv4(),
      title,
      publisher,
      author,
      publishedDate,
      createdAt: new Date().toISOString(),
      aiSummary: summary,
      pdfUrl: publicUrl,
    }

    const { error: insertError } = await supabase
      .from('reports')
      .insert(report)

    if (insertError) throw insertError

    return report
  } catch (error) {
    console.error('Error processing report:', error)
    throw error
  }
}

export async function getReports(search: string = '', publisher: string = '') {
  let query = supabase
    .from('reports')
    .select('*')
    .order('createdAt', { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%,aiSummary.ilike.%${search}%`)
  }

  if (publisher) {
    query = query.eq('publisher', publisher)
  }

  const { data, error } = await query

  if (error) throw error

  return data as Report[]
}

export async function getPublishers() {
  const { data, error } = await supabase
    .from('reports')
    .select('publisher')
    .distinct()

  if (error) throw error

  return data.map(item => item.publisher)
}

*/