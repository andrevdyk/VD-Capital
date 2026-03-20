'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  createChart, IChartApi, ISeriesApi,
  ColorType, UTCTimestamp, LineStyle,
} from 'lightweight-charts'
import { Badge }  from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const SYMBOL  = 'EUR/USD'
const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY!

const UP_COLOR  = '#03b198'
const DN_COLOR  = '#ff2f67'
const POC_COLOR = '#f59e0b'   // Point of Control — amber
const VAH_COLOR = '#818cf8'   // Value Area High — indigo
const VAL_COLOR = '#818cf8'   // Value Area Low  — indigo
const BULL_BAR  = 'rgba(3,177,152,0.6)'
const BEAR_BAR  = 'rgba(255,47,103,0.6)'

const TIMEFRAMES = [
  { label: '1m',  interval: '1min'  },
  { label: '5m',  interval: '5min'  },
  { label: '15m', interval: '15min' },
  { label: '1H',  interval: '1h'    },
  { label: '4H',  interval: '4h'    },
  { label: '1D',  interval: '1day'  },
]

const BUCKET_COUNTS = [24, 48, 96, 128, 200]

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candle {
  time:  number
  open:  number
  high:  number
  low:   number
  close: number
}

interface PriceBucket {
  price:      number   // midpoint of bucket
  volume:     number   // total estimated volume
  bullVol:    number   // estimated buy volume
  bearVol:    number   // estimated sell volume
  isPOC:      boolean
  isVA:       boolean  // inside value area
}

interface VolumeProfile {
  buckets:   PriceBucket[]
  poc:       number    // Point of Control price
  vah:       number    // Value Area High
  val:       number    // Value Area Low
  totalVol:  number
  priceHigh: number
  priceLow:  number
  bucketSize: number
}

// ─── Volume Profile Engine ────────────────────────────────────────────────────

/**
 * Estimate volume for a single candle using range-based proxy:
 *  - Total vol  = (high - low) * 10000  (normalised pip-range)
 *  - Bull vol   = proportion of candle that was bullish (close > open uses body/wick ratio)
 *  - Bear vol   = remainder
 */
function estimateCandleVolume(c: Candle): { total: number; bull: number; bear: number } {
  const range = c.high - c.low
  if (range === 0) return { total: 0, bull: 0, bear: 0 }
  const total = range * 10000
  // Bullish fraction: how much of the candle closed on the buy side
  const bullFrac = c.close > c.open
    ? (c.close - c.low)  / range
    : (c.open  - c.low)  / range
  return {
    total,
    bull: total * bullFrac,
    bear: total * (1 - bullFrac),
  }
}

/**
 * Distribute a candle's volume across price buckets.
 * Volume is distributed uniformly across all buckets the candle's range touches.
 */
function distributeToBuckets(
  c: Candle,
  buckets: PriceBucket[],
  bucketSize: number,
  priceLow: number,
) {
  const { total, bull, bear } = estimateCandleVolume(c)
  if (total === 0) return

  const loIdx  = Math.max(0, Math.floor((c.low  - priceLow) / bucketSize))
  const hiIdx  = Math.min(buckets.length - 1, Math.floor((c.high - priceLow) / bucketSize))
  const count  = hiIdx - loIdx + 1
  if (count <= 0) return

  const volPerBucket  = total / count
  const bullPerBucket = bull  / count
  const bearPerBucket = bear  / count

  for (let i = loIdx; i <= hiIdx; i++) {
    buckets[i].volume  += volPerBucket
    buckets[i].bullVol += bullPerBucket
    buckets[i].bearVol += bearPerBucket
  }
}

function buildVolumeProfile(candles: Candle[], numBuckets: number): VolumeProfile {
  const priceHigh  = Math.max(...candles.map(c => c.high))
  const priceLow   = Math.min(...candles.map(c => c.low))
  const priceRange = priceHigh - priceLow
  if (priceRange === 0) {
    return { buckets: [], poc: 0, vah: 0, val: 0, totalVol: 0, priceHigh, priceLow, bucketSize: 0 }
  }

  const bucketSize = priceRange / numBuckets

  // Init buckets
  const buckets: PriceBucket[] = Array.from({ length: numBuckets }, (_, i) => ({
    price:   priceLow + (i + 0.5) * bucketSize,
    volume:  0,
    bullVol: 0,
    bearVol: 0,
    isPOC:   false,
    isVA:    false,
  }))

  // Distribute all candles
  for (const c of candles) {
    distributeToBuckets(c, buckets, bucketSize, priceLow)
  }

  const totalVol = buckets.reduce((s, b) => s + b.volume, 0)

  // Find POC (highest volume bucket)
  let pocIdx = 0
  for (let i = 1; i < buckets.length; i++) {
    if (buckets[i].volume > buckets[pocIdx].volume) pocIdx = i
  }
  buckets[pocIdx].isPOC = true
  const poc = buckets[pocIdx].price

  // Value Area = 70% of total volume, expanding outward from POC
  const vaTarget = totalVol * 0.70
  let vaVol = buckets[pocIdx].volume
  let lo = pocIdx, hi = pocIdx

  while (vaVol < vaTarget && (lo > 0 || hi < buckets.length - 1)) {
    const addHigh = hi < buckets.length - 1 ? buckets[hi + 1].volume : 0
    const addLow  = lo > 0                   ? buckets[lo - 1].volume : 0
    if (addHigh >= addLow) { hi++; vaVol += buckets[hi].volume }
    else                   { lo--; vaVol += buckets[lo].volume }
  }

  const vah = buckets[hi].price + bucketSize / 2
  const val = buckets[lo].price - bucketSize / 2

  for (let i = lo; i <= hi; i++) buckets[i].isVA = true

  return { buckets, poc, vah, val, totalVol, priceHigh, priceLow, bucketSize }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VolumeProfilePage() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef         = useRef<HTMLCanvasElement>(null)
  const chartRef          = useRef<IChartApi | null>(null)
  const seriesRef         = useRef<ISeriesApi<any> | null>(null)
  const overlayRefs       = useRef<ISeriesApi<any>[]>([])
  const candlesRef        = useRef<Candle[]>([])
  const animFrameRef      = useRef<number>(0)

  const [activeTimeframe, setActiveTimeframe] = useState(TIMEFRAMES[2])
  const [numBuckets,      setNumBuckets]      = useState(96)
  const [loading,         setLoading]         = useState(true)
  const [profile,         setProfile]         = useState<VolumeProfile | null>(null)
  const [latestPrice,     setLatestPrice]     = useState<number | null>(null)
  const [chartReady,      setChartReady]      = useState(false)
  const [chartHeight,     setChartHeight]     = useState(500)
  const [chartWidth,      setChartWidth]      = useState(800)

  // ── Init chart ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return
    chartRef.current = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: '#09090b' }, textColor: '#71717a' },
      grid:   { vertLines: { color: 'rgba(39,39,42,0.4)' }, horzLines: { color: 'rgba(39,39,42,0.4)' } },
      crosshair:       { mode: 1 },
      rightPriceScale: { borderColor: '#27272a' },
      timeScale:       { borderColor: '#27272a', timeVisible: true },
      localization:    { priceFormatter: (p: number) => p.toFixed(5) },
      width:  chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 500,
    })
    const ro = new ResizeObserver(() => {
      if (!chartContainerRef.current || !chartRef.current) return
      const w = chartContainerRef.current.clientWidth
      const h = chartContainerRef.current.clientHeight
      chartRef.current.applyOptions({ width: w, height: h })
      setChartWidth(w); setChartHeight(h)
    })
    ro.observe(chartContainerRef.current)
    setChartReady(true)
    return () => { ro.disconnect(); chartRef.current?.remove(); chartRef.current = null; setChartReady(false) }
  }, [])

  // ── Draw VP overlay on canvas ────────────────────────────────────────────────
  const drawProfileCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const chart  = chartRef.current
    if (!canvas || !chart || !profile || profile.buckets.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const maxVol   = Math.max(...profile.buckets.map(b => b.volume))
    const barMaxW  = W * 0.25   // VP bars take up left 25% of chart width

    // Get price scale from chart — convert price to pixel Y
    const priceScale = chart.priceScale('right')
    // We use the series coordinate converter
    if (!seriesRef.current) return

    for (const bucket of profile.buckets) {
      const y = seriesRef.current.priceToCoordinate(bucket.price)
      if (y === null || y === undefined) continue

      const bucketPx = Math.max(
        1,
        Math.abs(
          (seriesRef.current.priceToCoordinate(bucket.price + profile.bucketSize / 2) ?? y) -
          (seriesRef.current.priceToCoordinate(bucket.price - profile.bucketSize / 2) ?? y)
        ) - 1,
      )

      const totalW = (bucket.volume / maxVol) * barMaxW
      const bullW  = (bucket.bullVol / bucket.volume) * totalW

      // Bull portion
      ctx.fillStyle = bucket.isPOC ? POC_COLOR
        : bucket.isVA ? BULL_BAR
        : 'rgba(3,177,152,0.3)'
      ctx.fillRect(0, y - bucketPx / 2, bullW, bucketPx)

      // Bear portion
      ctx.fillStyle = bucket.isPOC ? POC_COLOR
        : bucket.isVA ? BEAR_BAR
        : 'rgba(255,47,103,0.3)'
      ctx.fillRect(bullW, y - bucketPx / 2, totalW - bullW, bucketPx)
    }

    // POC line across full width
    if (seriesRef.current) {
      const pocY = seriesRef.current.priceToCoordinate(profile.poc)
      if (pocY !== null && pocY !== undefined) {
        ctx.strokeStyle = POC_COLOR
        ctx.lineWidth   = 1.5
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(0, pocY)
        ctx.lineTo(W, pocY)
        ctx.stroke()
      }

      // VAH line
      const vahY = seriesRef.current.priceToCoordinate(profile.vah)
      if (vahY !== null && vahY !== undefined) {
        ctx.strokeStyle = VAH_COLOR
        ctx.lineWidth   = 1
        ctx.setLineDash([2, 6])
        ctx.beginPath()
        ctx.moveTo(0, vahY)
        ctx.lineTo(W, vahY)
        ctx.stroke()
      }

      // VAL line
      const valY = seriesRef.current.priceToCoordinate(profile.val)
      if (valY !== null && valY !== undefined) {
        ctx.strokeStyle = VAL_COLOR
        ctx.lineWidth   = 1
        ctx.setLineDash([2, 6])
        ctx.beginPath()
        ctx.moveTo(0, valY)
        ctx.lineTo(W, valY)
        ctx.stroke()
      }
      ctx.setLineDash([])
    }
  }, [profile])

  // Continuously redraw canvas overlay on animation frame (handles scroll/zoom)
  useEffect(() => {
    let running = true
    const loop = () => {
      if (!running) return
      drawProfileCanvas()
      animFrameRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => { running = false; cancelAnimationFrame(animFrameRef.current) }
  }, [drawProfileCanvas])

  // ── Fetch candles ────────────────────────────────────────────────────────────
  const fetchCandles = useCallback(async (interval: string) => {
    if (!chartRef.current) return
    setLoading(true)
    try {
      const res  = await fetch(`/api/forex?symbol=${encodeURIComponent(SYMBOL)}&interval=${interval}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      const candles: Candle[] = json.candles.map((c: any) => ({
        time:  Math.floor(new Date(c.time).getTime() / 1000),
        open:  Number(c.open), high: Number(c.high),
        low:   Number(c.low),  close: Number(c.close),
      }))

      candlesRef.current = candles
      if (candles.length > 0) setLatestPrice(candles[candles.length - 1].close)

      // Draw candles
      if (seriesRef.current) {
        try { chartRef.current.removeSeries(seriesRef.current) } catch (_) {}
        seriesRef.current = null
      }
      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: UP_COLOR, downColor: DN_COLOR,
        borderVisible: false, wickUpColor: UP_COLOR, wickDownColor: DN_COLOR,
        priceFormat: { type: 'price', precision: 5, minMove: 0.00001 },
      })
      seriesRef.current.setData(candles.map(c => ({
        time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close,
      })))
      chartRef.current.timeScale().fitContent()

      // Build volume profile
      const vp = buildVolumeProfile(candles, numBuckets)
      setProfile(vp)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [numBuckets])

  useEffect(() => { if (chartReady) fetchCandles(activeTimeframe.interval) }, [activeTimeframe, chartReady])
  useEffect(() => {
    if (candlesRef.current.length > 0) {
      const vp = buildVolumeProfile(candlesRef.current, numBuckets)
      setProfile(vp)
    }
  }, [numBuckets])

  // Sync canvas size to chart container
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width  = chartWidth
      canvasRef.current.height = chartHeight
    }
  }, [chartWidth, chartHeight])

  const isPositive = latestPrice !== null && candlesRef.current.length > 1
    && latestPrice >= candlesRef.current[0].close

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-mono">
      {/* Nav */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#818cf8)' }}>VP</div>
          <span className="text-[11px] text-zinc-500 tracking-widest uppercase">Volume Profile</span>
          <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-600 hidden sm:flex">
            Range-based proxy · {SYMBOL}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {/* Bucket count selector */}
          <div className="flex gap-0.5 bg-zinc-900 rounded-lg p-1">
            {BUCKET_COUNTS.map(n => (
              <button key={n} onClick={() => setNumBuckets(n)}
                className={cn('px-2 py-1 rounded-md text-[10px] font-semibold transition-all',
                  numBuckets === n ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300')}>
                {n}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm"
            onClick={() => fetchCandles(activeTimeframe.interval)}
            className="h-6 px-2 text-[10px] border-zinc-700 bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
            ↻
          </Button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 min-h-0">
        {/* Chart + canvas overlay */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-zinc-800">
          {/* Symbol bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 shrink-0 gap-4 flex-wrap">
            <div className="flex items-baseline gap-3">
              <span className="text-base font-bold">{SYMBOL}</span>
              {latestPrice !== null && (
                <span className="text-base font-semibold tabular-nums">{latestPrice.toFixed(5)}</span>
              )}
            </div>
            <div className="flex gap-0.5 bg-zinc-900 rounded-lg p-1">
              {TIMEFRAMES.map(tf => (
                <button key={tf.label} onClick={() => setActiveTimeframe(tf)}
                  className={cn('px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                    activeTimeframe.label === tf.label ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300')}>
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart area with canvas overlay */}
          <div className="relative flex-1 min-h-0">
            {loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/85 gap-3">
                <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${UP_COLOR} transparent ${UP_COLOR} ${UP_COLOR}` }} />
                <span className="text-[10px] text-zinc-500 tracking-widest">BUILDING VOLUME PROFILE…</span>
              </div>
            )}
            {/* LightweightCharts canvas */}
            <div ref={chartContainerRef} className="w-full h-full" />
            {/* VP overlay canvas — sits on top, pointer-events none so chart stays interactive */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ mixBlendMode: 'normal' }}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 px-5 py-2 border-t border-zinc-800/60 shrink-0 flex-wrap">
            {[
              { color: POC_COLOR, label: 'POC — Point of Control'    },
              { color: VAH_COLOR, label: 'VAH/VAL — Value Area 70%' },
              { color: UP_COLOR,  label: 'Buy volume (estimated)'    },
              { color: DN_COLOR,  label: 'Sell volume (estimated)'   },
            ].map(i => (
              <div key={i.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm" style={{ background: i.color }} />
                <span className="text-[10px] text-zinc-500">{i.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats panel */}
        <div className="w-64 shrink-0 flex flex-col overflow-hidden">
          <Card className="flex flex-col h-full rounded-none border-0 bg-transparent">
            <CardHeader className="px-4 py-3 border-b border-zinc-800 shrink-0">
              <CardTitle className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                Profile Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {profile && (
                <>
                  {/* Key levels */}
                  {[
                    { label: 'POC',        price: profile.poc, color: POC_COLOR, desc: 'Highest volume price'     },
                    { label: 'VAH',        price: profile.vah, color: VAH_COLOR, desc: 'Value Area High (70%)'   },
                    { label: 'VAL',        price: profile.val, color: VAL_COLOR, desc: 'Value Area Low (70%)'    },
                    { label: 'Range High', price: profile.priceHigh, color: '#71717a', desc: 'Session high'      },
                    { label: 'Range Low',  price: profile.priceLow,  color: '#71717a', desc: 'Session low'       },
                  ].map(item => (
                    <div key={item.label} className="flex flex-col gap-0.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold" style={{ color: item.color }}>{item.label}</span>
                        <span className="text-[11px] font-semibold tabular-nums" style={{ color: item.color }}>
                          {item.price.toFixed(5)}
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-600">{item.desc}</span>
                    </div>
                  ))}

                  <Separator className="bg-zinc-800" />

                  {/* Bucket info */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Config</p>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-zinc-500">Buckets</span>
                      <span className="text-[10px] text-zinc-300 tabular-nums">{numBuckets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-zinc-500">Bucket size</span>
                      <span className="text-[10px] text-zinc-300 tabular-nums">{profile.bucketSize.toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-zinc-500">Candles</span>
                      <span className="text-[10px] text-zinc-300 tabular-nums">{candlesRef.current.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-zinc-500">VA width</span>
                      <span className="text-[10px] text-zinc-300 tabular-nums">
                        {((profile.vah - profile.val) / (profile.priceHigh - profile.priceLow) * 100).toFixed(1)}% of range
                      </span>
                    </div>
                  </div>

                  <Separator className="bg-zinc-800" />

                  {/* Current price vs profile */}
                  {latestPrice !== null && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Price Location</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500">vs POC</span>
                        <span className={cn('text-[10px] font-semibold tabular-nums',
                          latestPrice > profile.poc ? 'text-[#03b198]' : 'text-[#ff2f67]')}>
                          {latestPrice > profile.poc ? '▲' : '▼'} {Math.abs(latestPrice - profile.poc).toFixed(5)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-zinc-500">Zone</span>
                        <Badge variant="outline" className={cn('text-[9px] border px-1.5',
                          latestPrice > profile.vah ? 'bg-[#03b198]/10 text-[#03b198] border-[#03b198]/30'
                          : latestPrice < profile.val ? 'bg-[#ff2f67]/10 text-[#ff2f67] border-[#ff2f67]/30'
                          : 'bg-[#818cf8]/10 text-[#818cf8] border-[#818cf8]/30')}>
                          {latestPrice > profile.vah ? 'Above VA' : latestPrice < profile.val ? 'Below VA' : 'Inside VA'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </>
              )}
              {!profile && !loading && (
                <p className="text-[11px] text-zinc-600 text-center mt-8">No data yet</p>
              )}
            </CardContent>
            <div className="px-4 py-2.5 border-t border-zinc-800 shrink-0">
              <p className="text-[9px] text-zinc-700 leading-relaxed">
                Volume estimated from candle range. Not true exchange volume. For analysis only.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}