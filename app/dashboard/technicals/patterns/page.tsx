'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  createChart, IChartApi, ISeriesApi,
  ColorType, UTCTimestamp, LineStyle,
} from 'lightweight-charts'
import { Badge }   from '@/components/ui/badge'
import { Button }  from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  runPatternEngine,
  type Candle,
  type DetectedPattern,
  type Direction,
  type PatternShape,
  type RRLevels,
} from './lib/patternEngine'

// ─── Colours ──────────────────────────────────────────────────────────────────

const UP_COLOR   = '#03b198'
const DOWN_COLOR = '#ff2f67'
const BULL_COLOR = '#03b198'
const BEAR_COLOR = '#ff2f67'
const NEUT_COLOR = '#3b82f6'

const TIMEFRAMES = [
  { label: '1m',  interval: '1min',  description: '24h · 1min'   },
  { label: '5m',  interval: '5min',  description: '5d · 5min'    },
  { label: '15m', interval: '15min', description: '30d · 15min'  },
  { label: '1H',  interval: '1h',    description: '60d · 1h'     },
  { label: '4H',  interval: '4h',    description: '120d · 4h'    },
  { label: '8H', interval: '8h',   description: '365d · 8h'   },
  { label: '1D',  interval: '1day',  description: '5yr · daily'  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const dirColor = (d: Direction) =>
  d === 'bullish' ? BULL_COLOR : d === 'bearish' ? BEAR_COLOR : NEUT_COLOR

const dirBadge = (d: Direction) =>
  d === 'bullish'
    ? 'bg-[#03b198]/10 text-[#03b198] border-[#03b198]/30'
    : d === 'bearish'
    ? 'bg-[#ff2f67]/10 text-[#ff2f67] border-[#ff2f67]/30'
    : 'bg-blue-500/10 text-blue-400 border-blue-500/30'

const probCn = (p: number) =>
  p >= 80 ? 'text-[#03b198]' : p >= 65 ? 'text-yellow-400' : 'text-zinc-400'

const regimeBadge = (r: DetectedPattern['regime']) =>
  r === 'normal' ? 'bg-zinc-800 text-zinc-400'
  : r === 'high'  ? 'bg-amber-900/40 text-amber-400'
  : 'bg-zinc-900 text-zinc-600'

const lwStyle = (s: PatternShape['style']): LineStyle =>
  s === 'dashed' ? LineStyle.Dashed
  : s === 'dotted' ? LineStyle.Dotted
  : LineStyle.Solid

// ─────────────────────────────────────────────────────────────────────────────
// Dedup helper — LightweightCharts requires strictly ascending unique timestamps
// ─────────────────────────────────────────────────────────────────────────────

function dedupPoints(raw: { time: number; value: number }[]) {
  const seen = new Set<number>()
  return raw
    .filter(pt => { if (seen.has(pt.time)) return false; seen.add(pt.time); return true })
    .sort((a, b) => a.time - b.time)
    .map(pt => ({ time: pt.time as UTCTimestamp, value: pt.value }))
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart overlay renderer
// Draws pattern shapes (polylines) + RR zone boxes for flags.
// ─────────────────────────────────────────────────────────────────────────────

function renderRRZone(
  chart: IChartApi,
  rr:    RRLevels,
  refs:  React.MutableRefObject<ISeriesApi<any>[]>,
) {
  const { entry, sl, tp, isBull, fromTime, toTime } = rr

  // ── Risk zone (entry → SL) — red fill ────────────────────────────────────
  const riskColor     = 'rgba(255,47,103,0.18)'
  const riskBorder    = 'rgba(255,47,103,0.7)'
  const rewardColor   = 'rgba(3,177,152,0.18)'
  const rewardBorder  = 'rgba(3,177,152,0.7)'

  // Each "zone" needs an AreaSeries whose topColor/bottomColor create the fill.
  // We draw the TOP price as the area value and set bottomColor = transparent
  // so it fills down; then we add a floor line to cap it.

  // Risk zone top/bottom
  const riskTop = isBull ? entry : sl
  const riskBot = isBull ? sl    : entry

  // Reward zone top/bottom
  const rewardTop = isBull ? tp    : entry
  const rewardBot = isBull ? entry : tp

  // ── Risk fill ─────────────────────────────────────────────────────────────
  const riskFill = chart.addAreaSeries({
    topColor:              riskColor,
    bottomColor:           riskColor,
    lineColor:             riskBorder,
    lineWidth:             1,
    priceLineVisible:      false,
    lastValueVisible:      false,
    crosshairMarkerVisible: false,
  })
  riskFill.setData(dedupPoints([
    { time: fromTime, value: riskTop },
    { time: toTime,   value: riskTop },
  ]))
  refs.current.push(riskFill)

  // Risk floor line
  const riskFloor = chart.addLineSeries({
    color:                 riskBorder,
    lineWidth:             1,
    lineStyle:             LineStyle.Dashed,
    priceLineVisible:      false,
    lastValueVisible:      true,
    crosshairMarkerVisible: false,
    title:                 'SL',
  })
  riskFloor.setData(dedupPoints([
    { time: fromTime, value: riskBot },
    { time: toTime,   value: riskBot },
  ]))
  refs.current.push(riskFloor)

  // ── Reward fill ───────────────────────────────────────────────────────────
  const rewardFill = chart.addAreaSeries({
    topColor:              rewardColor,
    bottomColor:           rewardColor,
    lineColor:             rewardBorder,
    lineWidth:             1,
    priceLineVisible:      false,
    lastValueVisible:      false,
    crosshairMarkerVisible: false,
  })
  rewardFill.setData(dedupPoints([
    { time: fromTime, value: rewardTop },
    { time: toTime,   value: rewardTop },
  ]))
  refs.current.push(rewardFill)

  // Reward floor / ceiling line
  const rewardFloor = chart.addLineSeries({
    color:                 rewardBorder,
    lineWidth:             1,
    lineStyle:             LineStyle.Dashed,
    priceLineVisible:      false,
    lastValueVisible:      true,
    crosshairMarkerVisible: false,
    title:                 'TP',
  })
  rewardFloor.setData(dedupPoints([
    { time: fromTime, value: rewardBot },
    { time: toTime,   value: rewardBot },
  ]))
  refs.current.push(rewardFloor)

  // Entry line
  const entryLine = chart.addLineSeries({
    color:                 'rgba(255,255,255,0.6)',
    lineWidth:             1,
    lineStyle:             LineStyle.Solid,
    priceLineVisible:      false,
    lastValueVisible:      true,
    crosshairMarkerVisible: false,
    title:                 'Entry',
  })
  entryLine.setData(dedupPoints([
    { time: fromTime, value: entry },
    { time: toTime,   value: entry },
  ]))
  refs.current.push(entryLine)
}

function renderOverlays(
  chart:    IChartApi,
  patterns: DetectedPattern[],
  refs:     React.MutableRefObject<ISeriesApi<any>[]>,
) {
  refs.current.forEach(s => { try { chart.removeSeries(s) } catch (_) {} })
  refs.current = []

  patterns.forEach(p => {
    const color = dirColor(p.direction)

    // ── Pattern shape polylines ──────────────────────────────────────────────
    p.shapes.forEach(shape => {
      if (shape.points.length < 2) return

      const series = chart.addLineSeries({
        color,
        lineWidth:             shape.width,
        lineStyle:             lwStyle(shape.style),
        priceLineVisible:      false,
        lastValueVisible:      !!shape.label,
        crosshairMarkerVisible: false,
        title:                 shape.label ?? '',
      })

      const pts = dedupPoints(shape.points)
      if (pts.length < 2) return
      series.setData(pts)
      refs.current.push(series)
    })

    // ── RR zone (flags only) ─────────────────────────────────────────────────
    if (p.rr) renderRRZone(chart, p.rr, refs)
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

const SYMBOL  = 'EUR/USD'
const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY!

export default function PatternRecognitionPage() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef          = useRef<IChartApi | null>(null)
  const seriesRef         = useRef<ISeriesApi<any> | null>(null)
  const overlayRefs       = useRef<ISeriesApi<any>[]>([])
  const wsRef             = useRef<WebSocket | null>(null)
  const candlesRef        = useRef<Candle[]>([])

  const [chartReady,      setChartReady]      = useState(false)
  const [activeTimeframe, setActiveTimeframe] = useState(TIMEFRAMES[3])
  const [connected,       setConnected]       = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [latestPrice,     setLatestPrice]     = useState<number | null>(null)
  const [priceChange,     setPriceChange]     = useState(0)
  const [patterns,        setPatterns]        = useState<DetectedPattern[]>([])
  const [scanTime,        setScanTime]        = useState('')
  const [selectedIdx,     setSelectedIdx]     = useState<number | null>(null)
  const [candleCount,     setCandleCount]     = useState(0)

  // ── Chart init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return
    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#09090b' },
        textColor:  '#71717a',
      },
      grid: {
        vertLines: { color: 'rgba(39,39,42,0.4)' },
        horzLines: { color: 'rgba(39,39,42,0.4)' },
      },
      crosshair:       { mode: 1 },
      rightPriceScale: { borderColor: '#27272a' },
      timeScale:       { borderColor: '#27272a', timeVisible: true },
      localization:    { priceFormatter: (p: number) => p.toFixed(5) },
      width:  chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 500,
    })
    const ro = new ResizeObserver(() => {
      if (chartContainerRef.current && chartRef.current)
        chartRef.current.applyOptions({
          width:  chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
    })
    ro.observe(chartContainerRef.current)
    setChartReady(true)
    return () => {
      ro.disconnect()
      chartRef.current?.remove()
      chartRef.current = null
      setChartReady(false)
    }
  }, [])

  // ── Build candle series ─────────────────────────────────────────────────────
  const buildSeries = useCallback((candles: Candle[]) => {
    if (!chartRef.current) return
    if (seriesRef.current) {
      try { chartRef.current.removeSeries(seriesRef.current) } catch (_) {}
      seriesRef.current = null
    }
    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor:       UP_COLOR,
      downColor:     DOWN_COLOR,
      borderVisible: false,
      wickUpColor:   UP_COLOR,
      wickDownColor: DOWN_COLOR,
      priceFormat:   { type: 'price', precision: 5, minMove: 0.00001 },
    })
    seriesRef.current.setData(
      candles.map(c => ({
        time:  c.time as UTCTimestamp,
        open:  c.open, high: c.high, low: c.low, close: c.close,
      }))
    )
    chartRef.current.timeScale().fitContent()
  }, [])

  // ── Fetch ───────────────────────────────────────────────────────────────────
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
      setCandleCount(candles.length)
      if (candles.length > 0) {
        setLatestPrice(candles[candles.length - 1].close)
        setPriceChange(candles[candles.length - 1].close - candles[0].close)
      }

      buildSeries(candles)

      const detected = runPatternEngine(candles, activeTimeframe.label, SYMBOL)
      setPatterns(detected)
      setScanTime(new Date().toLocaleTimeString())
      setSelectedIdx(null)

      if (chartRef.current)
        renderOverlays(chartRef.current, detected, overlayRefs)

    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [buildSeries, activeTimeframe.label])

  // ── WebSocket ───────────────────────────────────────────────────────────────
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
          seriesRef.current.update({
            time: last.time as UTCTimestamp,
            open: updated.open, high: updated.high, low: updated.low, close: updated.close,
          })
        } catch (_) {}
        setPriceChange(price - candlesRef.current[0].close)
      }
    }
    wsRef.current.onclose = () => setConnected(false)
    wsRef.current.onerror = () => setConnected(false)
    return () => wsRef.current?.close()
  }, [])

  useEffect(() => {
    if (chartReady) fetchCandles(activeTimeframe.interval)
  }, [activeTimeframe, chartReady])

  // ── Row click → zoom to pattern (time-based, with price-scale padding) ──────
  const handleRowClick = useCallback((idx: number) => {
    setSelectedIdx(prev => prev === idx ? null : idx)
    const p = patterns[idx]
    if (!p || !chartRef.current || candlesRef.current.length === 0) return

    const allCandles = candlesRef.current

    // 1. Collect every time referenced by this pattern's shape points.
    //    Matching by time avoids any index-mismatch with filtered arrays.
    const shapeTimes      = p.shapes.flatMap(s => s.points.map(pt => pt.time))
    const allPatternTimes = [p.detectedAt, ...shapeTimes].filter(Boolean)
    const patternStart    = Math.min(...allPatternTimes)
    const patternEnd      = Math.max(...allPatternTimes)

    // Find bracket indices in the raw candle array
    const startIdx = allCandles.findIndex(c => c.time >= patternStart)
    const endIdx   = [...allCandles].reverse().findIndex(c => c.time <= patternEnd)
    const endIdxFwd = endIdx === -1 ? -1 : allCandles.length - 1 - endIdx
    if (startIdx === -1 || endIdxFwd === -1) return

    // 5-candle margin so the pattern never sits flush at the chart edge
    const margin  = 5
    const fromIdx = Math.max(0, startIdx - margin)
    const toIdx   = Math.min(allCandles.length - 1, endIdxFwd + margin)

    const fromCandle = allCandles[fromIdx]
    const toCandle   = allCandles[toIdx]
    if (!fromCandle || !toCandle) return

    // 2. Set the time axis window
    chartRef.current.timeScale().setVisibleRange({
      from: fromCandle.time as UTCTimestamp,
      to:   toCandle.time   as UTCTimestamp,
    })

    // 3. Compute the price range of the visible window + overlay shape prices,
    //    then apply scaleMargins so the extreme prices sit 5% from each edge.
    const visibleCandles = allCandles.slice(fromIdx, toIdx + 1)
    const shapePrices    = p.shapes.flatMap(s => s.points.map(pt => pt.value))
    const priceHigh      = Math.max(...visibleCandles.map(c => c.high), ...shapePrices)
    const priceLow       = Math.min(...visibleCandles.map(c => c.low),  ...shapePrices)
    const priceRange     = priceHigh - priceLow
    if (priceRange <= 0) return

    // Apply 5% top + bottom margins — LightweightCharts will then auto-scale
    // so the highest/lowest price sits exactly 5% from the chart edge.
    chartRef.current.priceScale('right').applyOptions({
      autoScale:    true,
      scaleMargins: { top: 0.05, bottom: 0.05 },
    })
  }, [patterns])

  const isPositive = priceChange >= 0

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-mono">

        {/* Nav */}
        <header className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white select-none"
              style={{ background: `linear-gradient(135deg,${BULL_COLOR},${BEAR_COLOR})` }}
            >PR</div>
            <span className="text-[11px] text-zinc-500 tracking-widest uppercase">Pattern Recognition</span>
            <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-600 hidden sm:flex">
              Institutional v3 · 120-candle window
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            {candleCount > 0 && (
              <span className="text-[10px] text-zinc-600 hidden sm:inline">{candleCount} candles loaded</span>
            )}
            <div className="flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full', connected ? 'bg-[#03b198] animate-pulse' : 'bg-[#ff2f67]')} />
              <span className="text-[10px] text-zinc-500 tracking-widest">{connected ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 min-h-0">

          {/* ── Chart ── */}
          <div className="flex flex-col flex-1 min-w-0 border-r border-zinc-800">

            {/* Symbol + timeframes */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 shrink-0 gap-4 flex-wrap">
              <div className="flex items-baseline gap-3">
                <span className="text-base font-bold">{SYMBOL}</span>
                {latestPrice !== null && (
                  <span className="text-base font-semibold tabular-nums">{latestPrice.toFixed(5)}</span>
                )}
                <Badge variant="outline" className={cn(
                  'text-[11px] font-semibold border px-2',
                  isPositive
                    ? 'bg-[#03b198]/10 text-[#03b198] border-[#03b198]/30'
                    : 'bg-[#ff2f67]/10 text-[#ff2f67] border-[#ff2f67]/30'
                )}>
                  {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(5)}
                </Badge>
                <span className="text-[10px] text-zinc-600 hidden lg:inline">{activeTimeframe.description}</span>
              </div>

              <div className="flex gap-0.5 bg-zinc-900 rounded-lg p-1">
                {TIMEFRAMES.map(tf => (
                  <button key={tf.label} onClick={() => setActiveTimeframe(tf)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                      activeTimeframe.label === tf.label ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                    )}>
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart area */}
            <div className="relative flex-1 min-h-0">
              {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/85 gap-3">
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: `${BULL_COLOR} transparent ${BULL_COLOR} ${BULL_COLOR}` }} />
                  <span className="text-[10px] text-zinc-500 tracking-widest">LOADING {activeTimeframe.label}…</span>
                </div>
              )}
              <div ref={chartContainerRef} className="w-full h-full" />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 px-5 py-2 border-t border-zinc-800/60 shrink-0 flex-wrap">
              {[
                { color: BULL_COLOR, label: 'Bullish pattern' },
                { color: BEAR_COLOR, label: 'Bearish pattern' },
                { color: NEUT_COLOR, label: 'Neutral pattern'  },
              ].map(i => (
                <div key={i.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ background: i.color }} />
                  <span className="text-[10px] text-zinc-500">{i.label}</span>
                </div>
              ))}
              <span className="text-[10px] text-zinc-600 ml-auto hidden sm:inline">Click row → zoom to pattern</span>
            </div>
          </div>

          {/* ── Pattern table ── */}
          <div className="flex flex-col w-[380px] shrink-0 overflow-hidden">
            <Card className="flex flex-col h-full rounded-none border-0 bg-transparent">
              <CardHeader className="px-5 py-3 border-b border-zinc-800 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    Detected Patterns
                  </CardTitle>
                  <Button variant="outline" size="sm"
                    onClick={() => fetchCandles(activeTimeframe.interval)}
                    className="h-6 px-2 text-[10px] border-zinc-700 bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                    ↻ Rescan
                  </Button>
                </div>
                {scanTime && <p className="text-[10px] text-zinc-600 mt-0.5">Last scan: {scanTime}</p>}
              </CardHeader>

              <CardContent className="flex-1 p-0 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase h-8 px-4">Asset</TableHead>
                      <TableHead className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase h-8 px-2">Pattern</TableHead>
                      <TableHead className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase h-8 px-4 text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patterns.length === 0 && !loading && (
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableCell colSpan={3} className="text-center py-10">
                          <div className="flex flex-col items-center gap-2 text-zinc-600">
                            <span className="text-xl">🔍</span>
                            <span className="text-[11px]">No patterns passed quality gate</span>
                            <span className="text-[10px] text-zinc-700">Min score 35 · 120-candle window</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {patterns.map((p, i) => (
                      <TableRow key={i} onClick={() => handleRowClick(i)}
                        className={cn(
                          'border-zinc-800/60 cursor-pointer transition-colors',
                          selectedIdx === i ? 'bg-zinc-800/50' : 'hover:bg-zinc-900/60'
                        )}>
                        {/* Asset + regime */}
                        <TableCell className="px-4 py-3">
                          <div className="text-[12px] font-semibold text-zinc-100">{p.asset}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[9px] text-zinc-600">{p.timeframe}</span>
                            <Badge variant="outline" className={cn('text-[8px] border-0 px-1 py-0 h-4', regimeBadge(p.regime))}>
                              {p.regime}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Pattern + direction + confirmed */}
                        <TableCell className="px-2 py-3">
                          <div className="flex items-center gap-1 mb-1 flex-wrap">
                            <Badge variant="outline"
                              className={cn('text-[9px] font-bold border px-1.5 py-0', dirBadge(p.direction))}>
                              {p.direction === 'bullish' ? '▲' : p.direction === 'bearish' ? '▼' : '◆'}{' '}
                              {p.direction.toUpperCase()}
                            </Badge>
                            {p.confirmed && (
                              <Badge variant="outline"
                                className="text-[8px] border-emerald-800 bg-emerald-950/50 text-emerald-400 px-1 py-0">
                                ✓ CONF
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-300">{p.pattern}</div>
                        </TableCell>

                        {/* Score */}
                        <TableCell className="px-4 py-3 text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                <div className={cn('text-sm font-bold tabular-nums', probCn(p.probability))}>
                                  {p.probability}%
                                </div>
                                <div className="text-[9px] text-zinc-600 tabular-nums">{p.score.total}/90</div>
                                <div className="w-10 h-1 bg-zinc-800 rounded-full overflow-hidden mt-1.5 ml-auto">
                                  <div className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(p.score.total / 90) * 100}%`, background: dirColor(p.direction) }} />
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left"
                              className="bg-zinc-900 border-zinc-700 text-zinc-300 text-[10px] max-w-[200px]">
                              <div className="space-y-0.5">
                                {p.score.breakdown.map((line, j) => <div key={j}>{line}</div>)}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Expanded detail */}
                {selectedIdx !== null && patterns[selectedIdx] && (
                  <>
                    <Separator className="bg-zinc-800" />
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Key Levels</p>
                        <span className="text-[10px] text-zinc-600">{patterns[selectedIdx].pattern}</span>
                      </div>
                      <div className="space-y-1.5">
                        {patterns[selectedIdx].keyLevels.map((kl, j) => (
                          <div key={j} className="flex justify-between items-center">
                            <span className="text-[11px] text-zinc-500">{kl.label}</span>
                            <span className="text-[11px] font-semibold tabular-nums"
                              style={{ color: dirColor(patterns[selectedIdx].direction) }}>
                              {kl.price.toFixed(5)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* RR summary for flags */}
                      {patterns[selectedIdx].rr && (() => {
                        const rr = patterns[selectedIdx].rr!
                        return (
                          <>
                            <Separator className="bg-zinc-800/60 my-3" />
                            <p className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase mb-2">Risk / Reward</p>
                            <div className="rounded-md border border-zinc-800 overflow-hidden mb-1">
                              {/* Reward bar */}
                              <div className="flex justify-between items-center px-3 py-1.5 bg-[#03b198]/10 border-b border-zinc-800">
                                <span className="text-[10px] text-[#03b198] font-semibold">Take Profit</span>
                                <span className="text-[11px] text-[#03b198] font-bold tabular-nums">{rr.tp.toFixed(5)}</span>
                              </div>
                              {/* Entry */}
                              <div className="flex justify-between items-center px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
                                <span className="text-[10px] text-zinc-400 font-semibold">Entry</span>
                                <span className="text-[11px] text-zinc-300 font-bold tabular-nums">{rr.entry.toFixed(5)}</span>
                              </div>
                              {/* SL */}
                              <div className="flex justify-between items-center px-3 py-1.5 bg-[#ff2f67]/10">
                                <span className="text-[10px] text-[#ff2f67] font-semibold">Stop Loss</span>
                                <span className="text-[11px] text-[#ff2f67] font-bold tabular-nums">{rr.sl.toFixed(5)}</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-center px-1 mt-2">
                              <span className="text-[10px] text-zinc-600">Risk / Reward Ratio</span>
                              <span className={cn(
                                "text-[12px] font-bold tabular-nums",
                                rr.ratio >= 2 ? "text-[#03b198]" : rr.ratio >= 1 ? "text-yellow-400" : "text-[#ff2f67]"
                              )}>
                                1 : {rr.ratio.toFixed(2)}
                              </span>
                            </div>
                          </>
                        )
                      })()}

                      <Separator className="bg-zinc-800/60 my-3" />
                      <p className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase mb-2">Score Breakdown</p>
                      <div className="space-y-1">
                        {[
                          { label: 'Trend Align', val: patterns[selectedIdx].score.trendAlign },
                          { label: 'Momentum',    val: patterns[selectedIdx].score.momentum    },
                          { label: 'Symmetry',    val: patterns[selectedIdx].score.symmetry    },
                          { label: 'Vol Confirm', val: patterns[selectedIdx].score.volConfirm  },
                          { label: 'Breakout',    val: patterns[selectedIdx].score.breakout    },
                          { label: 'Penalties',   val: patterns[selectedIdx].score.penalties   },
                        ].map(item => (
                          <div key={item.label} className="flex justify-between items-center">
                            <span className="text-[10px] text-zinc-600">{item.label}</span>
                            <span className={cn('text-[10px] font-semibold tabular-nums',
                              item.val > 0 ? 'text-[#03b198]' : item.val < 0 ? 'text-[#ff2f67]' : 'text-zinc-700')}>
                              {item.val > 0 ? '+' : ''}{item.val}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center border-t border-zinc-800 pt-1 mt-1">
                          <span className="text-[10px] font-bold text-zinc-400">Total</span>
                          <span className="text-[10px] font-bold text-zinc-300">
                            {patterns[selectedIdx].score.total}/90
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>

              <div className="px-4 py-2.5 border-t border-zinc-800 shrink-0">
                <p className="text-[9px] text-zinc-700 leading-relaxed">
                  Institutional rule-based engine. Patterns filtered by trend, momentum, regime and quality gate (min 35/90). Not financial advice.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}