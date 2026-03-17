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

const SYMBOL  = 'EUR/USD'
const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY!

const TIMEFRAMES = [
  { label: '1m',  interval: '1min',  description: '24h · 1min candles'    },
  { label: '5m',  interval: '5min',  description: '5 days · 5min candles' },
  { label: '15m', interval: '15min', description: '30 days · 15min'       },
  { label: '1H',  interval: '1h',    description: '60 days · 1h'          },
  { label: '4H',  interval: '4h',    description: '120 days · 4h'         },
  { label: '12H', interval: '12h',   description: '365 days · 12h'        },
  { label: '1D',  interval: '1day',  description: '5 years · daily'       },
]

type ChartType = 'candlestick' | 'area' | 'line'

interface Candle {
  time:  UTCTimestamp
  open:  number
  high:  number
  low:   number
  close: number
}

interface Zone {
  type:     'supply' | 'demand'
  top:      number
  bottom:   number
  time:     UTCTimestamp
  strength: number
}

function detectZones(candles: Candle[]): Zone[] {
  if (candles.length < 20) return []

  const zones:   Zone[] = []
  const lookback = 5

  let atrSum = 0
  for (let i = 1; i < Math.min(15, candles.length); i++) {
    const high      = candles[i].high
    const low       = candles[i].low
    const prevClose = candles[i - 1].close
    atrSum += Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose))
  }
  const atr = atrSum / 14

  for (let i = lookback; i < candles.length - lookback; i++) {
    const c           = candles[i]
    const window      = candles.slice(i - lookback, i + lookback + 1)
    const isSwingHigh = window.every((w) => w.high <= c.high)
    const isSwingLow  = window.every((w) => w.low  >= c.low)

    if (isSwingHigh) {
      zones.push({ type: 'supply', top: c.high + atr * 0.2, bottom: c.high - atr * 0.5, time: c.time, strength: lookback * 2 })
    }
    if (isSwingLow) {
      zones.push({ type: 'demand', top: c.low + atr * 0.5, bottom: c.low - atr * 0.2, time: c.time, strength: lookback * 2 })
    }
  }

  return [
    ...zones.filter((z) => z.type === 'supply').slice(-1),
    ...zones.filter((z) => z.type === 'demand').slice(-1),
  ]
}

export default function ForexChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef          = useRef<IChartApi | null>(null)
  const seriesRef         = useRef<ISeriesApi<any> | null>(null)
  const zoneSeriesRefs    = useRef<ISeriesApi<any>[]>([])
  const wsRef             = useRef<WebSocket | null>(null)
  const candlesRef        = useRef<Candle[]>([])

  const [chartReady,      setChartReady]      = useState(false)
  const [chartType,       setChartType]       = useState<ChartType>('candlestick')
  const [activeTimeframe, setActiveTimeframe] = useState(TIMEFRAMES[3])
  const [connected,       setConnected]       = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [latestPrice,     setLatestPrice]     = useState<number | null>(null)
  const [priceChange,     setPriceChange]     = useState<number>(0)
  const [zones,           setZones]           = useState<Zone[]>([])

  // ── Init chart ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'transparent' },
        horzLines: { color: 'transparent' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#1e293b' },
      timeScale:       { borderColor: '#1e293b', timeVisible: true },
      localization: {
        priceFormatter: (price: number) => price.toFixed(5),
      },
      width:  chartContainerRef.current.clientWidth,
      height: 500,
    })

    const ro = new ResizeObserver(() => {
      if (chartContainerRef.current && chartRef.current)
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth })
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

  // ── Draw zones ──────────────────────────────────────────────────────────────
  const drawZones = useCallback((detectedZones: Zone[], candles: Candle[]) => {
    if (!chartRef.current || candles.length === 0) return

    zoneSeriesRefs.current.forEach((s) => { try { chartRef.current?.removeSeries(s) } catch (_) {} })
    zoneSeriesRefs.current = []

    const firstTime = candles[0].time
    const lastTime  = candles[candles.length - 1].time

    detectedZones.forEach((zone) => {
      const isSupply = zone.type === 'supply'
      const border   = isSupply ? 'rgba(218,71,106,0.9)'  : 'rgba(19,176,151,0.9)'
      const fill     = isSupply ? 'rgba(218,71,106,0.08)' : 'rgba(19,176,151,0.08)'

      const topLine = chartRef.current!.addLineSeries({ color: border, lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false })
      topLine.setData([{ time: firstTime, value: zone.top }, { time: lastTime, value: zone.top }])

      const bottomLine = chartRef.current!.addLineSeries({ color: border, lineWidth: 1, lineStyle: LineStyle.Dashed, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false })
      bottomLine.setData([{ time: firstTime, value: zone.bottom }, { time: lastTime, value: zone.bottom }])

      const fillSeries = chartRef.current!.addAreaSeries({ topColor: fill, bottomColor: fill, lineColor: 'transparent', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false })
      fillSeries.setData([{ time: firstTime, value: zone.top }, { time: lastTime, value: zone.top }])

      const mid = (zone.top + zone.bottom) / 2
      const labelSeries = chartRef.current!.addLineSeries({ color: 'transparent', lineWidth: 1, priceLineVisible: true, lastValueVisible: true, title: isSupply ? '⬆ Supply' : '⬇ Demand', crosshairMarkerVisible: false })
      labelSeries.applyOptions({ priceLineColor: border, priceLineWidth: 1, priceLineStyle: LineStyle.Dotted })
      labelSeries.setData([{ time: firstTime, value: mid }, { time: lastTime, value: mid }])

      zoneSeriesRefs.current.push(topLine, bottomLine, fillSeries, labelSeries)
    })
  }, [])

  // ── Build price series ───────────────────────────────────────────────────────
  const buildSeries = useCallback((type: ChartType, candles?: Candle[]) => {
    if (!chartRef.current) return

    if (seriesRef.current) {
      try { chartRef.current.removeSeries(seriesRef.current) } catch (_) {}
      seriesRef.current = null
    }

    const priceFormat = { type: 'price' as const, precision: 5, minMove: 0.00001 }

    if (type === 'candlestick') {
      seriesRef.current = chartRef.current.addCandlestickSeries({ upColor: '#03b198', downColor: '#ff2f67', borderVisible: false, wickUpColor: '#03b198', wickDownColor: '#ff2f67', priceFormat })
    } else if (type === 'area') {
      seriesRef.current = chartRef.current.addAreaSeries({ lineColor: '#3b82f6', topColor: 'rgba(59,130,246,0.3)', bottomColor: 'rgba(59,130,246,0)', lineWidth: 2, priceFormat })
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

  // ── Fetch candles ────────────────────────────────────────────────────────────
  const fetchCandles = useCallback(async (interval: string) => {
    if (!chartRef.current) return
    setLoading(true)
    try {
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

      const detected = detectZones(candles)
      setZones(detected)
      buildSeries(chartType, candles)
      drawZones(detected, candles)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [chartType, buildSeries, drawZones])

  // ── WebSocket ────────────────────────────────────────────────────────────────
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
  useEffect(() => { if (!chartReady) return; buildSeries(chartType); if (zones.length > 0) drawZones(zones, candlesRef.current) }, [chartType, chartReady])

  const isPositive = priceChange >= 0

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{SYMBOL}</h1>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-sm font-semibold ${isPositive ? 'bg-green-950 text-[#03b198]' : 'bg-red-950 text-[#ff2f67]'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(5)}
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
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
          {TIMEFRAMES.map((tf) => (
            <button key={tf.label} onClick={() => setActiveTimeframe(tf)} title={tf.description}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${activeTimeframe.label === tf.label ? 'bg-zinc-700 text-primary' : 'text-zinc-400 hover:text-primary'}`}>
              {tf.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#ff2f67]/40 border border-[#ff2f67]" />
            <span className="text-xs text-slate-400">Supply Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#03b198]/40 border border-[#03b198]" />
            <span className="text-xs text-slate-400">Demand Zone</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Loading {activeTimeframe.description}...
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* Zone cards */}
      {zones.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {zones.map((zone, i) => {
            const isSupply = zone.type === 'supply'
            return (
              <div key={i} className={`rounded-lg border p-3 ${isSupply ? 'border-[#ff2f67] bg-[#ff2f67]/10' : 'border-[#03b198] bg-[#03b198]/10'}`}>
                <div className={`text-xs font-bold tracking-widest mb-2 ${isSupply ? 'text-[#ff2f67]' : 'text-[#03b198]'}`}>
                  {isSupply ? '⬆ SUPPLY ZONE' : '⬇ DEMAND ZONE'}
                </div>
                <div className="flex justify-between text-xs text-slate-300 font-mono"><span>Top</span><span>{zone.top.toFixed(5)}</span></div>
                <div className="flex justify-between text-xs text-slate-300 font-mono mt-1"><span>Bottom</span><span>{zone.bottom.toFixed(5)}</span></div>
                <div className="flex justify-between text-xs text-slate-500 font-mono mt-1"><span>Mid</span><span>{((zone.top + zone.bottom) / 2).toFixed(5)}</span></div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-600 mt-3 text-right">
        Powered by Twelve Data · Cached in Supabase · {activeTimeframe.description}
      </p>
    </div>
  )
}