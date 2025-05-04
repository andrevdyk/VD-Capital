import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.FMP_API_KEY
    const response = await fetch(`https://financialmodelingprep.com/stable/company-screener?apikey=${apiKey}`)

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}

