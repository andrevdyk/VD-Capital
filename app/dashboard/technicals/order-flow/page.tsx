'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  createChart, IChartApi, ISeriesApi,
  ColorType, UTCTimestamp, LineStyle,
  CrosshairMode,
} from 'lightweight-charts'
import { Badge }  from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const SYMBOL  = 'EUR/USD'
const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY!

const UP_COLOR    = '#03b198'
const DN_COLOR    = '#ff2f67'
const NEUT_COLOR  = '#52525b'
const CVD_COLOR   = '#818cf8'

const TIMEFRAMES = [
  { label: '1m',  interval: '1min'  },
  { label: '5m',  interval: '5min'  },
  { label: '15m', interval: '15min' },
  { label: '1H',  interval: '1h'    },
  { label: '4H',  interval: '4h'    },
  { label: '1D',  interval: '1day'  },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candle {
  time:  number
  open:  number
  high:  number
  low:   number
  close: number
}

interface DeltaBar {
  time:     number
  delta:    number    // positive = net buy, negative = net sell
  buyVol:   number
  sellVol:  number
  totalVol: number
  cvd:      number    // cumulative delta at this bar
  open:     number
  high:     number
  low:      number
  close:    number
  bullish:  boolean
}

interface DivergenceSignal {
  time:      number
  type:      'bullish' | 'bearish'
  priceAt:   number
  cvdAt:     number
  label:     string
}

// ─── Order Flow Engine ────────────────────────────────────────────────────────

/**
 * Estimate buy/sell volume from candle structure.
 *
 * Method: "Ease of Movement" delta approximation:
 *   Total volume  = (H - L) * 10000
 *   Buy fraction  = (Close - Low)  / (H - L)   → how much of range closed bullish
 *   Sell fraction = (High - Close) / (H - L)
 *   Delta         = buyVol - sellVol
 *
 * This is the same method used by most retail order flow tools
 * when true bid/ask data isn't available.
 */
function calcDeltaBars(candles: Candle[]): DeltaBar[] {
  let cvd = 0
  return candles.map(c => {
    const range = c.high - c.low
    const total = range > 0 ? range * 10000 : 0
    const buyFrac  = range > 0 ? (c.close - c.low)  / range : 0.5
    const sellFrac = range > 0 ? (c.high  - c.close) / range : 0.5
    const buyVol   = total * buyFrac
    const sellVol  = total * sellFrac
    const delta    = buyVol - sellVol
    cvd += delta
    return {
      time: c.time, delta, buyVol, sellVol, totalVol: total,
      cvd, open: c.open, high: c.high, low: c.low, close: c.close,
      bullish: c.close > c.open,
    }
  })
}

/**
 * Detect CVD divergences:
 *   Bearish divergence: price makes higher high but CVD makes lower high
 *   Bullish divergence: price makes lower low  but CVD makes higher low
 */
function detectDivergences(bars: DeltaBar[], lookback = 20): DivergenceSignal[] {
  const signals: DivergenceSignal[] = []
  if (bars.length < lookback * 2) return signals

  for (let i = lookback; i < bars.length - 3; i++) {
    const window = bars.slice(i - lookback, i + 1)
    const cur    = bars[i]

    // Find previous swing high/low in window
    const prevHighBar = window.slice(0, -1).reduce((a, b) => a.high > b.high ? a : b)
    const prevLowBar  = window.slice(0, -1).reduce((a, b) => a.low  < b.low  ? a : b)

    // Bearish divergence: price higher high, CVD lower high
    if (cur.high > prevHighBar.high && cur.cvd < prevHighBar.cvd && cur.delta < 0) {
      signals.push({
        time:    cur.time,
        type:    'bearish',
        priceAt: cur.high,
        cvdAt:   cur.cvd,
        label:   'Bear Div',
      })
    }

    // Bullish divergence: price lower low, CVD higher low
    if (cur.low < prevLowBar.low && cur.cvd > prevLowBar.cvd && cur.delta > 0) {
      signals.push({
        time:    cur.time,
        type:    'bullish',
        priceAt: cur.low,
        cvdAt:   cur.cvd,
        label:   'Bull Div',
      })
    }
  }

  // Deduplicate — keep one signal per 5-bar window
  const deduped: DivergenceSignal[] = []
  for (const s of signals) {
    const last = deduped[deduped.length - 1]
    if (!last || s.time - last.time > 5 * 60) deduped.push(s)
  }
  return deduped
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderFlowPage() {
  // ── Price chart refs ──────────────────────────────────────────────────────
  const priceContainerRef = useRef<HTMLDivElement>(null)
  const priceChartRef     = useRef<IChartApi | null>(null)
  const priceSeries       = useRef<ISeriesApi<any> | null>(null)
  const divMarkerSeries   = useRef<ISeriesApi<any> | null>(null)

  // ── CVD chart refs ────────────────────────────────────────────────────────
  const cvdContainerRef   = useRef<HTMLDivElement>(null)
  const cvdChartRef       = useRef<IChartApi | null>(null)
  const cvdLineSeries     = useRef<ISeriesApi<any> | null>(null)
  const cvdZeroLine       = useRef<ISeriesApi<any> | null>(null)

  // ── Delta bars chart refs ─────────────────────────────────────────────────
  const deltaContainerRef = useRef<HTMLDivElement>(null)
  const deltaChartRef     = useRef<IChartApi | null>(null)
  const deltaHistSeries   = useRef<ISeriesApi<any> | null>(null)

  const candlesRef = useRef<Candle[]>([])
  const barsRef    = useRef<DeltaBar[]>([])

  const [activeTimeframe, setActiveTimeframe] = useState(TIMEFRAMES[2])
  const [loading,         setLoading]         = useState(true)
  const [latestPrice,     setLatestPrice]     = useState<number | null>(null)
  const [deltaStats,      setDeltaStats]      = useState<{
    latestDelta: number
    cumulativeDelta: number
    bullBars: number
    bearBars: number
    avgDelta: number
  } | null>(null)
  const [divergences,     setDivergences]     = useState<DivergenceSignal[]>([])
  const [chartsReady,     setChartsReady]     = useState(false)

  // ── Sync all three time scales together ──────────────────────────────────
  const syncingRef = useRef(false)
  const setupSync = useCallback(() => {
    const charts = [priceChartRef.current, cvdChartRef.current, deltaChartRef.current].filter(Boolean) as IChartApi[]
    charts.forEach((src, si) => {
      src.timeScale().subscribeVisibleTimeRangeChange(range => {
        if (syncingRef.current || !range) return
        syncingRef.current = true
        charts.forEach((dst, di) => {
          if (di !== si) dst.timeScale().setVisibleRange(range as any)
        })
        syncingRef.current = false
      })
    })
  }, [])

  // ── Init all three charts ─────────────────────────────────────────────────
  useEffect(() => {
    const chartOpts = (container: HTMLDivElement, height: number) => ({
      layout: { background: { type: ColorType.Solid, color: '#09090b' }, textColor: '#71717a' },
      grid:   { vertLines: { color: 'rgba(39,39,42,0.3)' }, horzLines: { color: 'rgba(39,39,42,0.3)' } },
      crosshair:       { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#27272a' },
      timeScale:       { borderColor: '#27272a', timeVisible: true },
      width:  container.clientWidth,
      height,
    })

    if (priceContainerRef.current) {
      priceChartRef.current = createChart(priceContainerRef.current, {
        ...chartOpts(priceContainerRef.current, priceContainerRef.current.clientHeight),
        localization: { priceFormatter: (p: number) => p.toFixed(5) },
      })
    }
    if (cvdContainerRef.current) {
      cvdChartRef.current = createChart(cvdContainerRef.current,
        chartOpts(cvdContainerRef.current, cvdContainerRef.current.clientHeight))
    }
    if (deltaContainerRef.current) {
      deltaChartRef.current = createChart(deltaContainerRef.current,
        chartOpts(deltaContainerRef.current, deltaContainerRef.current.clientHeight))
    }

    // Resize observer for all three
    const ro = new ResizeObserver(() => {
      if (priceContainerRef.current && priceChartRef.current)
        priceChartRef.current.applyOptions({
          width: priceContainerRef.current.clientWidth,
          height: priceContainerRef.current.clientHeight,
        })
      if (cvdContainerRef.current && cvdChartRef.current)
        cvdChartRef.current.applyOptions({
          width: cvdContainerRef.current.clientWidth,
          height: cvdContainerRef.current.clientHeight,
        })
      if (deltaContainerRef.current && deltaChartRef.current)
        deltaChartRef.current.applyOptions({
          width: deltaContainerRef.current.clientWidth,
          height: deltaContainerRef.current.clientHeight,
        })
    })
    if (priceContainerRef.current) ro.observe(priceContainerRef.current)
    if (cvdContainerRef.current)   ro.observe(cvdContainerRef.current)
    if (deltaContainerRef.current) ro.observe(deltaContainerRef.current)

    setChartsReady(true)
    setupSync()

    return () => {
      ro.disconnect()
      priceChartRef.current?.remove(); priceChartRef.current = null
      cvdChartRef.current?.remove();   cvdChartRef.current   = null
      deltaChartRef.current?.remove(); deltaChartRef.current = null
      setChartsReady(false)
    }
  }, [setupSync])

  // ── Build and render all series ───────────────────────────────────────────
  const renderCharts = useCallback((candles: Candle[], bars: DeltaBar[], divs: DivergenceSignal[]) => {
    const pc  = priceChartRef.current
    const cvc = cvdChartRef.current
    const dc  = deltaChartRef.current
    if (!pc || !cvc || !dc) return

    // ── Price chart ──────────────────────────────────────────────────────────
    if (priceSeries.current) { try { pc.removeSeries(priceSeries.current) } catch (_) {} }
    priceSeries.current = pc.addCandlestickSeries({
      upColor: UP_COLOR, downColor: DN_COLOR,
      borderVisible: false, wickUpColor: UP_COLOR, wickDownColor: DN_COLOR,
      priceFormat: { type: 'price', precision: 5, minMove: 0.00001 },
    })
    priceSeries.current.setData(candles.map(c => ({
      time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close,
    })))

    // Divergence markers on price chart
    if (divMarkerSeries.current) { try { pc.removeSeries(divMarkerSeries.current) } catch (_) {} }
    if (divs.length > 0) {
      divMarkerSeries.current = pc.addLineSeries({
        color: 'transparent', lineWidth: 1, priceLineVisible: false,
        lastValueVisible: false, crosshairMarkerVisible: false,
      })
      divMarkerSeries.current.setData(
        candles.map(c => ({ time: c.time as UTCTimestamp, value: c.close }))
      )
      divMarkerSeries.current.setMarkers(
        divs.map(d => ({
          time:     d.time as UTCTimestamp,
          position: d.type === 'bullish' ? 'belowBar' : 'aboveBar',
          color:    d.type === 'bullish' ? UP_COLOR : DN_COLOR,
          shape:    d.type === 'bullish' ? 'arrowUp' : 'arrowDown',
          text:     d.label,
          size:     1,
        }))
      )
    }

    pc.timeScale().fitContent()

    // ── CVD line chart ───────────────────────────────────────────────────────
    if (cvdLineSeries.current)  { try { cvc.removeSeries(cvdLineSeries.current)  } catch (_) {} }
    if (cvdZeroLine.current)    { try { cvc.removeSeries(cvdZeroLine.current)    } catch (_) {} }

    cvdLineSeries.current = cvc.addLineSeries({
      color: CVD_COLOR, lineWidth: 2, lineStyle: LineStyle.Solid,
      priceLineVisible: false, lastValueVisible: true,
      crosshairMarkerVisible: true, title: 'CVD',
    })
    cvdLineSeries.current.setData(bars.map(b => ({
      time: b.time as UTCTimestamp, value: b.cvd,
    })))

    // Zero line
    cvdZeroLine.current = cvc.addLineSeries({
      color: 'rgba(113,113,122,0.4)', lineWidth: 1, lineStyle: LineStyle.Dashed,
      priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
    })
    cvdZeroLine.current.setData([
      { time: bars[0].time as UTCTimestamp, value: 0 },
      { time: bars[bars.length - 1].time as UTCTimestamp, value: 0 },
    ])

    cvc.timeScale().fitContent()

    // ── Delta histogram ──────────────────────────────────────────────────────
    if (deltaHistSeries.current) { try { dc.removeSeries(deltaHistSeries.current) } catch (_) {} }

    deltaHistSeries.current = dc.addHistogramSeries({
      priceFormat:     { type: 'volume' },
      priceScaleId:    'right',
      lastValueVisible: false,
    })
    deltaHistSeries.current.setData(bars.map(b => ({
      time:  b.time as UTCTimestamp,
      value: b.delta,
      color: b.delta > 0 ? UP_COLOR : DN_COLOR,
    })))

    dc.timeScale().fitContent()
  }, [])

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCandles = useCallback(async (interval: string) => {
    if (!chartsReady) return
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

      const bars = calcDeltaBars(candles)
      const divs = detectDivergences(bars)
      barsRef.current = bars

      renderCharts(candles, bars, divs)
      setDivergences(divs)

      // Stats from last 50 bars
      const recent = bars.slice(-50)
      setDeltaStats({
        latestDelta:     bars[bars.length - 1].delta,
        cumulativeDelta: bars[bars.length - 1].cvd,
        bullBars:        recent.filter(b => b.delta > 0).length,
        bearBars:        recent.filter(b => b.delta < 0).length,
        avgDelta:        recent.reduce((s, b) => s + b.delta, 0) / recent.length,
      })

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [chartsReady, renderCharts])

  useEffect(() => { if (chartsReady) fetchCandles(activeTimeframe.interval) }, [activeTimeframe, chartsReady])

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-mono">
      {/* Nav */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#818cf8,#03b198)' }}>OF</div>
          <span className="text-[11px] text-zinc-500 tracking-widest uppercase">Order Flow</span>
          <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-600 hidden sm:flex">
            CVD · Delta · Divergence · {SYMBOL}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 bg-zinc-900 rounded-lg p-1">
            {TIMEFRAMES.map(tf => (
              <button key={tf.label} onClick={() => setActiveTimeframe(tf)}
                className={cn('px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all',
                  activeTimeframe.label === tf.label ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300')}>
                {tf.label}
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

      {/* Main layout — charts left, stats right */}
      <div className="flex flex-1 min-h-0">

        {/* ── Three stacked charts ── */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-zinc-800 relative">
          {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950/85 gap-3">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: `${UP_COLOR} transparent ${UP_COLOR} ${UP_COLOR}` }} />
              <span className="text-[10px] text-zinc-500 tracking-widest">CALCULATING ORDER FLOW…</span>
            </div>
          )}

          {/* Price chart — 50% height */}
          <div className="flex flex-col border-b border-zinc-800/60" style={{ flex: 5 }}>
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-zinc-800/40 shrink-0">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">Price</span>
              <span className="text-[10px] text-zinc-600">{SYMBOL}</span>
              {latestPrice !== null && (
                <span className="text-[10px] text-zinc-300 tabular-nums ml-auto">{latestPrice.toFixed(5)}</span>
              )}
            </div>
            <div ref={priceContainerRef} className="flex-1 min-h-0" />
          </div>

          {/* CVD chart — 30% height */}
          <div className="flex flex-col border-b border-zinc-800/60" style={{ flex: 3 }}>
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-zinc-800/40 shrink-0">
              <div className="w-2 h-2 rounded-sm" style={{ background: CVD_COLOR }} />
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">CVD</span>
              <span className="text-[10px] text-zinc-600">Cumulative Volume Delta</span>
              {deltaStats && (
                <span className={cn('text-[10px] font-semibold tabular-nums ml-auto',
                  deltaStats.cumulativeDelta > 0 ? 'text-[#03b198]' : 'text-[#ff2f67]')}>
                  {deltaStats.cumulativeDelta > 0 ? '+' : ''}{deltaStats.cumulativeDelta.toFixed(0)}
                </span>
              )}
            </div>
            <div ref={cvdContainerRef} className="flex-1 min-h-0" />
          </div>

          {/* Delta histogram — 20% height */}
          <div className="flex flex-col" style={{ flex: 2 }}>
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-zinc-800/40 shrink-0">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">Delta</span>
              <span className="text-[10px] text-zinc-600">Buy − Sell per bar</span>
              {deltaStats && (
                <span className={cn('text-[10px] font-semibold tabular-nums ml-auto',
                  deltaStats.latestDelta > 0 ? 'text-[#03b198]' : 'text-[#ff2f67]')}>
                  {deltaStats.latestDelta > 0 ? '+' : ''}{deltaStats.latestDelta.toFixed(2)}
                </span>
              )}
            </div>
            <div ref={deltaContainerRef} className="flex-1 min-h-0" />
          </div>
        </div>

        {/* ── Stats panel ── */}
        <div className="w-64 shrink-0 flex flex-col overflow-hidden">
          <Card className="flex flex-col h-full rounded-none border-0 bg-transparent">
            <CardHeader className="px-4 py-3 border-b border-zinc-800 shrink-0">
              <CardTitle className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                Flow Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {deltaStats && (
                <>
                  {/* Live delta */}
                  <div className="rounded-lg border border-zinc-800 overflow-hidden">
                    <div className={cn('px-3 py-2 flex justify-between items-center',
                      deltaStats.latestDelta > 0 ? 'bg-[#03b198]/10' : 'bg-[#ff2f67]/10')}>
                      <span className="text-[10px] text-zinc-400 font-semibold">Latest Delta</span>
                      <span className={cn('text-sm font-bold tabular-nums',
                        deltaStats.latestDelta > 0 ? 'text-[#03b198]' : 'text-[#ff2f67]')}>
                        {deltaStats.latestDelta > 0 ? '+' : ''}{deltaStats.latestDelta.toFixed(2)}
                      </span>
                    </div>
                    <div className="px-3 py-2 flex justify-between items-center border-t border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-semibold">Cum. Delta</span>
                      <span className={cn('text-sm font-bold tabular-nums',
                        deltaStats.cumulativeDelta > 0 ? 'text-[#03b198]' : 'text-[#ff2f67]')}>
                        {deltaStats.cumulativeDelta > 0 ? '+' : ''}{deltaStats.cumulativeDelta.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Bull / bear bar ratio */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Last 50 Bars</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#03b198]">▲ Bull bars</span>
                      <span className="text-[10px] font-semibold text-[#03b198] tabular-nums">{deltaStats.bullBars}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#ff2f67]">▼ Bear bars</span>
                      <span className="text-[10px] font-semibold text-[#ff2f67] tabular-nums">{deltaStats.bearBars}</span>
                    </div>
                    {/* Ratio bar */}
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#03b198] rounded-full transition-all duration-500"
                        style={{ width: `${(deltaStats.bullBars / 50) * 100}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500">Avg delta/bar</span>
                      <span className={cn('text-[10px] font-semibold tabular-nums',
                        deltaStats.avgDelta > 0 ? 'text-[#03b198]' : 'text-[#ff2f67]')}>
                        {deltaStats.avgDelta > 0 ? '+' : ''}{deltaStats.avgDelta.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500">Bias</span>
                      <Badge variant="outline" className={cn('text-[9px] border px-1.5',
                        deltaStats.bullBars > deltaStats.bearBars
                          ? 'bg-[#03b198]/10 text-[#03b198] border-[#03b198]/30'
                          : deltaStats.bearBars > deltaStats.bullBars
                          ? 'bg-[#ff2f67]/10 text-[#ff2f67] border-[#ff2f67]/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700')}>
                        {deltaStats.bullBars > deltaStats.bearBars ? '▲ BULLISH'
                          : deltaStats.bearBars > deltaStats.bullBars ? '▼ BEARISH' : '◆ NEUTRAL'}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="bg-zinc-800" />

                  {/* Divergences */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
                      CVD Divergences
                      <span className="ml-2 text-zinc-500 normal-case font-normal">({divergences.length})</span>
                    </p>
                    {divergences.length === 0 && (
                      <p className="text-[10px] text-zinc-700">No divergences detected</p>
                    )}
                    {divergences.slice(-6).reverse().map((d, i) => (
                      <div key={i} className={cn(
                        'rounded px-2 py-1.5 flex justify-between items-center',
                        d.type === 'bullish' ? 'bg-[#03b198]/8' : 'bg-[#ff2f67]/8'
                      )}>
                        <div className="flex flex-col gap-0.5">
                          <span className={cn('text-[9px] font-bold',
                            d.type === 'bullish' ? 'text-[#03b198]' : 'text-[#ff2f67]')}>
                            {d.type === 'bullish' ? '▲' : '▼'} {d.label}
                          </span>
                          <span className="text-[9px] text-zinc-600">
                            {new Date(d.time * 1000).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 tabular-nums">{d.priceAt.toFixed(5)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {!deltaStats && !loading && (
                <p className="text-[11px] text-zinc-600 text-center mt-8">No data yet</p>
              )}
            </CardContent>

            {/* Legend */}
            <div className="px-4 py-3 border-t border-zinc-800 shrink-0 space-y-1.5">
              {[
                { color: CVD_COLOR, label: 'CVD line'              },
                { color: UP_COLOR,  label: 'Positive delta (buys)' },
                { color: DN_COLOR,  label: 'Negative delta (sells)'},
              ].map(i => (
                <div key={i.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: i.color }} />
                  <span className="text-[9px] text-zinc-600">{i.label}</span>
                </div>
              ))}
              <p className="text-[9px] text-zinc-700 leading-relaxed mt-2">
                Volume estimated from candle range. Proxy method — not true exchange data.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}