import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const interval = searchParams.get('interval') as "1d" | undefined

  console.log('API route hit:', { symbol, startDate, endDate, interval })

  if (!symbol || !startDate || !endDate || !interval) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    const queryOptions: {
      period1: string;
      period2: string;
      interval: typeof interval;
    } = {
      period1: startDate,
      period2: endDate,
      interval: interval
    }
    console.log('Fetching historical data with options:', queryOptions)

    const result = await yahooFinance.historical(symbol, queryOptions)

    console.log(`Fetched ${result.length} data points`)

    if (result.length === 0) {
      throw new Error('No data returned from Yahoo Finance')
    }

    const formattedData = result.map((item: any) => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume
    }))

    return NextResponse.json(formattedData)
  } catch (error: any) {
    console.error('Error fetching stock data:', error)
    
    if (error.name === 'HTTPError' && error.response?.statusCode === 404) {
      return NextResponse.json({ error: 'Stock data not found. The stock may not exist or may have been delisted.' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to fetch stock data', details: error.message }, { status: 500 })
  }
}

