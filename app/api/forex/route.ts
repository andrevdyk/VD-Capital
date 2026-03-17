import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const API_KEY = '1124bba6bd544e05b8ce83a7b508a3ea'

const INTERVAL_CONFIG: Record<string, { outputsize: number; cacheTTLMinutes: number }> = {
  '1min':  { outputsize: 1440, cacheTTLMinutes: 1   },
  '5min':  { outputsize: 1440, cacheTTLMinutes: 5   },
  '15min': { outputsize: 2880, cacheTTLMinutes: 15  },
  '1h':    { outputsize: 1440, cacheTTLMinutes: 60  },
  '4h':    { outputsize: 720,  cacheTTLMinutes: 240 },
  '12h':   { outputsize: 730,  cacheTTLMinutes: 720 },
  '1day':  { outputsize: 1825, cacheTTLMinutes: 1440 },
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') || 'EUR/USD'
  const interval = searchParams.get('interval') || '1h'

  const config = INTERVAL_CONFIG[interval]
  if (!config) return NextResponse.json({ error: 'Invalid interval' }, { status: 400 })

  const supabase = await createClient()

  // Check cache freshness
  const { data: cached } = await supabase
    .from('forex_candles')
    .select('*')
    .eq('symbol', symbol)
    .eq('interval', interval)
    .order('time', { ascending: false })
    .limit(1)

  if (cached && cached.length > 0) {
    const cachedAt = new Date(cached[0].cached_at)
    const ageMinutes = (Date.now() - cachedAt.getTime()) / 60000
    if (ageMinutes < config.cacheTTLMinutes) {
      // Cache is fresh — return all cached rows
      const { data: allCached } = await supabase
        .from('forex_candles')
        .select('*')
        .eq('symbol', symbol)
        .eq('interval', interval)
        .order('time', { ascending: true })

      return NextResponse.json({ candles: allCached, source: 'cache' })
    }
  }

  // Cache stale or empty — fetch from Twelve Data
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${config.outputsize}&apikey=${API_KEY}`
  const res = await fetch(url)
  const json = await res.json()

  if (json.status === 'error' || !json.values) {
    return NextResponse.json({ error: json.message || 'API error' }, { status: 500 })
  }

  const candles = json.values.map((v: any) => ({
    symbol,
    interval,
    time: new Date(v.datetime).toISOString(),
    open: parseFloat(v.open),
    high: parseFloat(v.high),
    low: parseFloat(v.low),
    close: parseFloat(v.close),
    cached_at: new Date().toISOString(),
  }))

  // Upsert into Supabase
  await supabase
    .from('forex_candles')
    .upsert(candles, { onConflict: 'symbol,interval,time' })

  return NextResponse.json({ candles: candles.reverse(), source: 'api' })
}