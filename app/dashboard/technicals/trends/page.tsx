'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  UTCTimestamp,
  LineStyle,
} from 'lightweight-charts'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── Constants ────────────────────────────────────────────────────────────────

const SYMBOL  = 'EUR/USD'
const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY!

const TIMEFRAMES = [
  { label: '1m',  interval: '1min',  description: '24h · 1min'  },
  { label: '5m',  interval: '5min',  description: '5d · 5min'   },
  { label: '15m', interval: '15min', description: '30d · 15min' },
  { label: '1H',  interval: '1h',    description: '60d · 1H'    },
  { label: '4H',  interval: '4h',    description: '120d · 4H'   },
  { label: '8H', interval: '8h',   description: '365d · 8H'  },
  { label: '1D',  interval: '1day',  description: '5yr · 1D'    },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type ChartType = 'candlestick' | 'area' | 'line'

interface Candle {
  time:  UTCTimestamp
  open:  number
  high:  number
  low:   number
  close: number
}

interface TrendRow {
  asset:         string
  currentValue:  string
  ytdChange:     string
  quarterChange: string
  weekChange:    string
  dayChange:     string
  hourlyChange:  string
  status:        string
  adx:           number
  supertrendUp:  boolean
}

// ─── Indicator helpers ────────────────────────────────────────────────────────

function tr(c: Candle, prev: Candle) {
  return Math.max(c.high - c.low, Math.abs(c.high - prev.close), Math.abs(c.low - prev.close))
}

function calcATR(candles: Candle[], period = 14): number[] {
  if (candles.length < period + 1) return []
  const atrs: number[] = []
  let sum = 0
  for (let i = 1; i <= period; i++) sum += tr(candles[i], candles[i - 1])
  atrs[period] = sum / period
  for (let i = period + 1; i < candles.length; i++) {
    atrs[i] = (atrs[i - 1] * (period - 1) + tr(candles[i], candles[i - 1])) / period
  }
  return atrs
}

function calcSupertrend(candles: Candle[], period = 10, multiplier = 3) {
  const atrs   = calcATR(candles, period)
  const result: ({ value: number; up: boolean } | null)[] = new Array(candles.length).fill(null)
  let prevUpper = 0, prevLower = 0, prevTrend = true

  for (let i = period; i < candles.length; i++) {
    const hl2  = (candles[i].high + candles[i].low) / 2
    const atr  = atrs[i]
    const upper = hl2 + multiplier * atr
    const lower = hl2 - multiplier * atr

    const finalUpper = (upper < prevUpper || candles[i - 1].close > prevUpper) ? upper : prevUpper
    const finalLower = (lower > prevLower || candles[i - 1].close < prevLower) ? lower : prevLower

    let up: boolean
    if      (prevTrend  && candles[i].close < finalLower) up = false
    else if (!prevTrend && candles[i].close > finalUpper) up = true
    else up = prevTrend

    result[i] = { value: up ? finalLower : finalUpper, up }
    prevUpper = finalUpper
    prevLower = finalLower
    prevTrend = up
  }
  return result
}

function calcLastADX(candles: Candle[], period = 14): number {
  if (candles.length < period * 2) return 0
  const dmPlus: number[] = [], dmMinus: number[] = [], trs: number[] = []

  for (let i = 1; i < candles.length; i++) {
    const up   = candles[i].high - candles[i - 1].high
    const down = candles[i - 1].low - candles[i].low
    dmPlus.push(up > down && up > 0 ? up : 0)
    dmMinus.push(down > up && down > 0 ? down : 0)
    trs.push(tr(candles[i], candles[i - 1]))
  }

  const smooth = (arr: number[], p: number) => {
    let s = arr.slice(0, p).reduce((a, b) => a + b, 0)
    const out = [s]
    for (let i = p; i < arr.length; i++) { s = s - s / p + arr[i]; out.push(s) }
    return out
  }

  const sTR = smooth(trs, period), sDMP = smooth(dmPlus, period), sDMM = smooth(dmMinus, period)
  const dx: number[] = []
  for (let i = 0; i < sTR.length; i++) {
    if (sTR[i] === 0) { dx.push(0); continue }
    const diP = (sDMP[i] / sTR[i]) * 100
    const diM = (sDMM[i] / sTR[i]) * 100
    dx.push(Math.abs(diP - diM) / (diP + diM) * 100)
  }

  const adxSmooth = smooth(dx.slice(dx.length - period), period)
  return adxSmooth[adxSmooth.length - 1] ?? 0
}

function pct(a: number, b: number) {
  return (((b - a) / a) * 100).toFixed(2) + '%'
}

function trendStatus(supertrendUp: boolean, adx: number): string {
  if (adx >= 40) return supertrendUp ? 'Very Bullish' : 'Very Bearish'
  if (adx >= 25) return supertrendUp ? 'Bullish'      : 'Bearish'
  return 'Neutral'
}

// ─── Build trend row from already-fetched candles ─────────────────────────────
// This avoids making extra API calls — reuses data from the chart fetch

function buildTrendRow(asset: string, hourlyCandles: Candle[], dailyCandles: Candle[]): TrendRow {
  const lastClose   = dailyCandles.at(-1)?.close  ?? 0
  const ytdOpen     = dailyCandles[0]?.close       ?? lastClose
  const quarterOpen = dailyCandles.at(-63)?.close  ?? lastClose
  const weekOpen    = dailyCandles.at(-5)?.close   ?? lastClose
  const dayOpen     = dailyCandles.at(-2)?.close   ?? lastClose
  const hourOpen    = hourlyCandles[0]?.close      ?? lastClose

  const st     = calcSupertrend(dailyCandles)
  const lastST = st.filter(Boolean).at(-1)
  const adx    = calcLastADX(dailyCandles)

  return {
    asset,
    currentValue:  lastClose.toFixed(5),
    ytdChange:     pct(ytdOpen,     lastClose),
    quarterChange: pct(quarterOpen, lastClose),
    weekChange:    pct(weekOpen,    lastClose),
    dayChange:     pct(dayOpen,     lastClose),
    hourlyChange:  pct(hourOpen,    lastClose),
    status:        trendStatus(lastST?.up ?? true, adx),
    adx:           Math.round(adx),
    supertrendUp:  lastST?.up ?? true,
  }
}

// ─── Helper classnames ────────────────────────────────────────────────────────

function getChangeClass(change: string) {
  const v = parseFloat(change)
  return v > 0 ? 'text-[#03b198]' : v < 0 ? 'text-[#ff2f67]' : ''
}

function getStatusClass(status: string) {
  switch (status) {
    case 'Very Bullish': return 'text-[#03b198] font-semibold'
    case 'Bullish':      return 'text-[#03b198]'
    case 'Neutral':      return 'text-gray-300'
    case 'Bearish':      return 'text-[#ff2f67]'
    case 'Very Bearish': return 'text-[#ff2f67] font-semibold'
    default:             return ''
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrendsPage() {
  // Shared candle state — fetched once, used by both chart and table
  const [dailyCandles,  setDailyCandles]  = useState<Candle[]>([])
  const [hourlyCandles, setHourlyCandles] = useState<Candle[]>([])
  const [trendRow,      setTrendRow]      = useState<TrendRow | null>(null)

  // When daily + hourly candles are available, build the table row
  useEffect(() => {
    if (dailyCandles.length === 0 || hourlyCandles.length === 0) return
    setTrendRow(buildTrendRow(SYMBOL, hourlyCandles, dailyCandles))
  }, [dailyCandles, hourlyCandles])

  return (
    <div className="min-h-screen p-6 space-y-6">
      <h1 className="text-xl font-bold text-white">Trend Analysis</h1>
      <div className="flex flex-col xl:flex-row gap-6">
        <TrendOverviewTable row={trendRow} />
        <div className="flex-1 min-w-0">
          <TrendChart
            onDailyCandles={setDailyCandles}
            onHourlyCandles={setHourlyCandles}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Trend Overview Table ─────────────────────────────────────────────────────

function TrendOverviewTable({ row }: { row: TrendRow | null }) {
  return (
    <Card className="flex flex-col w-fit h-fit bg-black border-zinc-800">
      <CardHeader className="flex items-center space-y-0 border-b border-zinc-800 py-2 sm:flex-row">
        <div className="grid flex-1 text-left text-sm font-semibold">Trend Overview</div>
        {!row && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
      </CardHeader>
      <CardContent className="w-fit p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-400">Asset</TableHead>
              <TableHead className="text-zinc-400">Price</TableHead>
              <TableHead className="text-zinc-400">YTD</TableHead>
              <TableHead className="text-zinc-400">Quarter</TableHead>
              <TableHead className="text-zinc-400">Week</TableHead>
              <TableHead className="text-zinc-400">Day</TableHead>
              <TableHead className="text-zinc-400">Hourly</TableHead>
              <TableHead className="text-zinc-400">ADX</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!row ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-zinc-500 py-6">
                  Loading data...
                </TableCell>
              </TableRow>
            ) : (
              <TableRow className="border-zinc-800 hover:bg-zinc-900">
                <TableCell className="font-medium font-mono">{row.asset}</TableCell>
                <TableCell className="font-mono">{row.currentValue}</TableCell>
                <TableCell className={`font-mono ${getChangeClass(row.ytdChange)}`}>{row.ytdChange}</TableCell>
                <TableCell className={`font-mono ${getChangeClass(row.quarterChange)}`}>{row.quarterChange}</TableCell>
                <TableCell className={`font-mono ${getChangeClass(row.weekChange)}`}>{row.weekChange}</TableCell>
                <TableCell className={`font-mono ${getChangeClass(row.dayChange)}`}>{row.dayChange}</TableCell>
                <TableCell className={`font-mono ${getChangeClass(row.hourlyChange)}`}>{row.hourlyChange}</TableCell>
                <TableCell className="font-mono">
                  <span className={row.adx >= 25 ? 'text-yellow-400' : 'text-zinc-400'}>{row.adx}</span>
                </TableCell>
                <TableCell className={getStatusClass(row.status)}>{row.status}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ─── Trend Chart ──────────────────────────────────────────────────────────────

interface TrendChartProps {
  onDailyCandles:  (c: Candle[]) => void
  onHourlyCandles: (c: Candle[]) => void
}

function TrendChart({ onDailyCandles, onHourlyCandles }: TrendChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const adxContainerRef   = useRef<HTMLDivElement>(null)
  const chartRef          = useRef<IChartApi | null>(null)
  const adxChartRef       = useRef<IChartApi | null>(null)
  const seriesRef         = useRef<ISeriesApi<any> | null>(null)
  const stUpRef           = useRef<ISeriesApi<any> | null>(null)
  const stDownRef         = useRef<ISeriesApi<any> | null>(null)
  const adxSeriesRef      = useRef<ISeriesApi<any> | null>(null)
  const wsRef             = useRef<WebSocket | null>(null)
  const candlesRef        = useRef<Candle[]>([])

  const [chartReady,      setChartReady]      = useState(false)
  const [chartType,       setChartType]       = useState<ChartType>('candlestick')
  const [activeTimeframe, setActiveTimeframe] = useState(TIMEFRAMES[3])
  const [connected,       setConnected]       = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [latestPrice,     setLatestPrice]     = useState<number | null>(null)
  const [priceChange,     setPriceChange]     = useState<number>(0)
  const [currentADX,      setCurrentADX]      = useState<number>(0)
  const [currentTrend,    setCurrentTrend]    = useState<boolean>(true)

  // ── Init charts ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current || !adxContainerRef.current) return

    const baseOpts = (el: HTMLDivElement, height: number) => ({
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#94a3b8',
      },
      grid:            { vertLines: { color: 'transparent' }, horzLines: { color: 'transparent' } },
      crosshair:       { mode: 1 },
      rightPriceScale: { borderColor: '#1e293b' },
      timeScale:       { borderColor: '#1e293b', timeVisible: true },
      width:           el.clientWidth,
      height,
    })

    chartRef.current = createChart(chartContainerRef.current, {
      ...baseOpts(chartContainerRef.current, 440),
      localization: { priceFormatter: (p: number) => p.toFixed(5) },
    })

    adxChartRef.current = createChart(adxContainerRef.current, {
      ...baseOpts(adxContainerRef.current, 120),
      localization: { priceFormatter: (p: number) => p.toFixed(1) },
    })

    // Sync scrolling between charts
    chartRef.current.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range) adxChartRef.current?.timeScale().setVisibleLogicalRange(range)
    })
    adxChartRef.current.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (range) chartRef.current?.timeScale().setVisibleLogicalRange(range)
    })

    const ro = new ResizeObserver(() => {
      if (chartContainerRef.current && chartRef.current)
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
      if (adxContainerRef.current && adxChartRef.current)
        adxChartRef.current.applyOptions({ width: adxContainerRef.current.clientWidth })
    })
    ro.observe(chartContainerRef.current)
    ro.observe(adxContainerRef.current)

    setChartReady(true)
    return () => {
      ro.disconnect()
      chartRef.current?.remove()
      adxChartRef.current?.remove()
      chartRef.current = null
      adxChartRef.current = null
      setChartReady(false)
    }
  }, [])

  // ── Supertrend overlay ───────────────────────────────────────────────────────
  const drawSupertrend = useCallback((candles: Candle[]) => {
    if (!chartRef.current) return

    if (stUpRef.current)   { try { chartRef.current.removeSeries(stUpRef.current)   } catch (_) {} }
    if (stDownRef.current) { try { chartRef.current.removeSeries(stDownRef.current) } catch (_) {} }

    const st = calcSupertrend(candles)
    const upData:   { time: UTCTimestamp; value: number }[] = []
    const downData: { time: UTCTimestamp; value: number }[] = []

    st.forEach((s, i) => {
      if (!s) return
      if (s.up) upData.push({   time: candles[i].time, value: s.value })
      else      downData.push({ time: candles[i].time, value: s.value })
    })

    stUpRef.current = chartRef.current.addLineSeries({
      color: '#03b198', lineWidth: 2, lineStyle: LineStyle.Solid,
      priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, title: 'ST ↑',
    })
    stUpRef.current.setData(upData)

    stDownRef.current = chartRef.current.addLineSeries({
      color: '#ff2f67', lineWidth: 2, lineStyle: LineStyle.Solid,
      priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, title: 'ST ↓',
    })
    stDownRef.current.setData(downData)

    const lastST = st.filter(Boolean).at(-1)
    if (lastST) setCurrentTrend(lastST.up)
  }, [])

  // ── ADX histogram ────────────────────────────────────────────────────────────
  const drawADX = useCallback((candles: Candle[]) => {
    if (!adxChartRef.current) return
    if (adxSeriesRef.current) { try { adxChartRef.current.removeSeries(adxSeriesRef.current) } catch (_) {} }

    const period = 14
    const dmPlus: number[] = [], dmMinus: number[] = [], trs: number[] = []

    for (let i = 1; i < candles.length; i++) {
      const up   = candles[i].high - candles[i - 1].high
      const down = candles[i - 1].low - candles[i].low
      dmPlus.push(up > down && up > 0 ? up : 0)
      dmMinus.push(down > up && down > 0 ? down : 0)
      trs.push(tr(candles[i], candles[i - 1]))
    }

    const smooth = (arr: number[]) => {
      let s = arr.slice(0, period).reduce((a, b) => a + b, 0)
      const out = [s]
      for (let i = period; i < arr.length; i++) { s = s - s / period + arr[i]; out.push(s) }
      return out
    }

    const sTR = smooth(trs), sDMP = smooth(dmPlus), sDMM = smooth(dmMinus)
    const dx: number[] = []
    for (let i = 0; i < sTR.length; i++) {
      if (sTR[i] === 0) { dx.push(0); continue }
      const diP = (sDMP[i] / sTR[i]) * 100
      const diM = (sDMM[i] / sTR[i]) * 100
      dx.push(Math.abs(diP - diM) / (diP + diM) * 100)
    }

    let adxSmooth = dx.slice(0, period).reduce((a, b) => a + b, 0) / period
    const adxVals = [adxSmooth]
    for (let i = period; i < dx.length; i++) {
      adxSmooth = (adxSmooth * (period - 1) + dx[i]) / period
      adxVals.push(adxSmooth)
    }

    const offset = candles.length - adxVals.length
    const adxData: { time: UTCTimestamp; value: number; color: string }[] = []
    adxVals.forEach((v, i) => {
      const c = candles[i + offset]
      if (!c) return
      adxData.push({ time: c.time, value: v, color: v >= 40 ? '#f59e0b' : v >= 25 ? '#3b82f6' : '#4b5563' })
    })

    adxSeriesRef.current = adxChartRef.current.addHistogramSeries({
      color: '#3b82f6', priceFormat: { type: 'price', precision: 1, minMove: 0.1 },
      priceLineVisible: false, lastValueVisible: true, title: 'ADX',
    })
    adxSeriesRef.current.setData(adxData)

    setCurrentADX(Math.round(adxVals.at(-1) ?? 0))
  }, [])

  // ── Build price series ───────────────────────────────────────────────────────
  const buildSeries = useCallback((type: ChartType, candles?: Candle[]) => {
    if (!chartRef.current) return
    if (seriesRef.current) { try { chartRef.current.removeSeries(seriesRef.current) } catch (_) {}; seriesRef.current = null }

    const priceFormat = { type: 'price' as const, precision: 5, minMove: 0.00001 }

    if (type === 'candlestick') {
      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#03b198', downColor: '#ff2f67', borderVisible: false,
        wickUpColor: '#03b198', wickDownColor: '#ff2f67', priceFormat,
      })
    } else if (type === 'area') {
      seriesRef.current = chartRef.current.addAreaSeries({
        lineColor: '#3b82f6', topColor: 'rgba(59,130,246,0.3)',
        bottomColor: 'rgba(59,130,246,0)', lineWidth: 2, priceFormat,
      })
    } else {
      seriesRef.current = chartRef.current.addLineSeries({ color: '#3b82f6', lineWidth: 2, priceFormat })
    }

    const data = candles ?? candlesRef.current
    if (data.length > 0) {
      const seriesData = type === 'candlestick' ? data : data.map((c) => ({ time: c.time, value: c.close }))
      seriesRef.current.setData(seriesData)
      chartRef.current.timeScale().fitContent()
    }
  }, [])

  // ── Fetch candles — also surfaces daily + hourly for the table ───────────────
  const fetchCandles = useCallback(async (interval: string) => {
    if (!chartRef.current) return
    setLoading(true)
    try {
      // Main chart interval fetch (via cached API route)
      const res  = await fetch(`/api/forex?symbol=${encodeURIComponent(SYMBOL)}&interval=${interval}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      const candles: Candle[] = json.candles.map((c: any) => ({
        time:  Math.floor(new Date(c.time).getTime() / 1000) as UTCTimestamp,
        open:  Number(c.open),
        high:  Number(c.high),
        low:   Number(c.low),
        close: Number(c.close),
      }))

      candlesRef.current = candles
      if (candles.length > 0) {
        setLatestPrice(candles[candles.length - 1].close)
        setPriceChange(candles[candles.length - 1].close - candles[0].close)
      }

      buildSeries(chartType, candles)
      drawSupertrend(candles)
      drawADX(candles)

      // Surface candles to parent for table — reuse cached endpoints
      if (interval === '1day') {
        onDailyCandles(candles)
      } else if (interval === '1h') {
        onHourlyCandles(candles)
      } else {
        // Fetch daily in background for table (hits cache after first load)
        fetch(`/api/forex?symbol=${encodeURIComponent(SYMBOL)}&interval=1day`)
          .then((r) => r.json())
          .then((j) => {
            if (!j.error) onDailyCandles(j.candles.map((c: any) => ({
              time:  Math.floor(new Date(c.time).getTime() / 1000) as UTCTimestamp,
              open:  Number(c.open), high: Number(c.high), low: Number(c.low), close: Number(c.close),
            })))
          })
          .catch(() => {})

        fetch(`/api/forex?symbol=${encodeURIComponent(SYMBOL)}&interval=1h`)
          .then((r) => r.json())
          .then((j) => {
            if (!j.error) onHourlyCandles(j.candles.map((c: any) => ({
              time:  Math.floor(new Date(c.time).getTime() / 1000) as UTCTimestamp,
              open:  Number(c.open), high: Number(c.high), low: Number(c.low), close: Number(c.close),
            })))
          })
          .catch(() => {})
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [chartType, buildSeries, drawSupertrend, drawADX, onDailyCandles, onHourlyCandles])

  // ── WebSocket live ticks ─────────────────────────────────────────────────────
  useEffect(() => {
    wsRef.current = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${API_KEY}`)
    wsRef.current.onopen = () => {
      setConnected(true)
      wsRef.current?.send(JSON.stringify({ action: 'subscribe', params: { symbols: SYMBOL } }))
    }
    wsRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.event !== 'price') return
      const price = parseFloat(msg.price)
      setLatestPrice(price)
      if (seriesRef.current && candlesRef.current.length > 0) {
        const last    = candlesRef.current[candlesRef.current.length - 1]
        const updated = { ...last, close: price, high: Math.max(last.high, price), low: Math.min(last.low, price) }
        candlesRef.current[candlesRef.current.length - 1] = updated
        try {
          if (chartType === 'candlestick') seriesRef.current.update(updated)
          else seriesRef.current.update({ time: last.time, value: price })
        } catch (_) {}
        setPriceChange(price - candlesRef.current[0].close)
      }
    }
    wsRef.current.onclose = () => setConnected(false)
    wsRef.current.onerror = () => setConnected(false)
    return () => wsRef.current?.close()
  }, [chartType])

  useEffect(() => { if (!chartReady) return; fetchCandles(activeTimeframe.interval) }, [activeTimeframe, chartReady])
  useEffect(() => {
    if (!chartReady) return
    buildSeries(chartType)
    if (candlesRef.current.length > 0) { drawSupertrend(candlesRef.current); drawADX(candlesRef.current) }
  }, [chartType, chartReady])

  const isPositive  = priceChange >= 0
  const trendLabel  = trendStatus(currentTrend, currentADX)
  const trendColour = currentTrend ? '#03b198' : '#ff2f67'

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{SYMBOL}</h1>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-sm font-semibold ${isPositive ? 'bg-green-950 text-[#03b198]' : 'bg-red-950 text-[#ff2f67]'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(5)}
            </div>
            <div className="px-2 py-0.5 rounded text-xs font-bold border" style={{ color: trendColour, borderColor: trendColour }}>
              {trendLabel}
            </div>
            <div className={`px-2 py-0.5 rounded text-xs font-semibold ${currentADX >= 40 ? 'bg-yellow-950 text-yellow-400' : currentADX >= 25 ? 'bg-blue-950 text-blue-400' : 'bg-zinc-900 text-zinc-400'}`}>
              ADX {currentADX}
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-[#03b198] animate-pulse' : 'bg-[#ff2f67]'}`} />
              <span className="text-xs text-slate-400">{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
          {latestPrice !== null && (
            <div className="text-3xl font-mono font-bold mt-1">{latestPrice.toFixed(5)}</div>
          )}
        </div>
        <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
          {(['candlestick', 'area', 'line'] as ChartType[]).map((type) => (
            <button key={type} onClick={() => setChartType(type)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all ${chartType === type ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {type === 'candlestick' ? '🕯 Candle' : type === 'area' ? '📈 Area' : '📉 Line'}
            </button>
          ))}
        </div>
      </div>

      {/* Timeframe + legend */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
          {TIMEFRAMES.map((tf) => (
            <button key={tf.label} onClick={() => setActiveTimeframe(tf)} title={tf.description}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTimeframe.label === tf.label ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}>
              {tf.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 inline-block bg-[#03b198]" /> Supertrend ↑</span>
          <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 inline-block bg-[#ff2f67]" /> Supertrend ↓</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 inline-block bg-blue-500 rounded-sm" /> ADX weak</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 inline-block bg-yellow-400 rounded-sm" /> ADX strong</span>
        </div>
      </div>

      {/* Main chart */}
      <div className="relative rounded-t-xl border border-zinc-800 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Loading {activeTimeframe.description}...
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* ADX panel */}
      <div className="relative rounded-b-xl border border-t-0 border-zinc-800 overflow-hidden">
        <div className="absolute top-1 left-2 text-xs text-zinc-500 z-10">ADX (14)</div>
        <div ref={adxContainerRef} className="w-full" />
      </div>
    </div>
  )
}