"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart, IChartApi, ISeriesApi,
  ColorType, UTCTimestamp, LineStyle,
} from "lightweight-charts";
import { Disaster } from "../types/disaster";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Candle { time: UTCTimestamp; open: number; high: number; low: number; close: number; }

const CHART_COLORS = {
  bg: "#09090b", muted: "#52525b", border: "#1f1f23",
  up: "#10b981", down: "#ef4444",
};

const TIMEFRAMES = [
  { label: "15m", interval: "15min", outputsize: "2880" }, // 30 days × 96 candles/day
  { label: "1H",  interval: "1h",    outputsize: "1440" }, // 60 days × 24 candles/day
  { label: "4H",  interval: "4h",    outputsize: "720"  }, // 120 days × 6 candles/day
  { label: "1D",  interval: "1day",  outputsize: "365"  }, // 1 year daily
];

export function CommodityChart({ disaster }: { disaster: Disaster }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const extraRefs    = useRef<ISeriesApi<any>[]>([]);
  const candlesRef   = useRef<Candle[]>([]);

  const [loading,     setLoading]    = useState(true);
  const [isMock,      setIsMock]     = useState(false);
  const [tf,          setTf]         = useState(TIMEFRAMES[0]);
  const [lastPrice,   setLastPrice]  = useState<number | null>(null);
  const [startPrice,  setStartPrice] = useState<number | null>(null);
  const [eventPrice,  setEventPrice] = useState<number | null>(null); // price at disaster event date

  const isUp      = disaster.direction === "UP";
  const predColor = isUp ? CHART_COLORS.up : CHART_COLORS.down;
  const predFill  = isUp ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)";

  const drawPredBox = useCallback((candles: Candle[]) => {
    if (!chartRef.current || candles.length < 2) return;
    extraRefs.current.forEach((s) => { try { chartRef.current?.removeSeries(s); } catch {} });
    extraRefs.current = [];

    // ── Find the candle closest to the disaster event date ────────────────────
    // Convert disaster.date (YYYY-MM-DD) to a unix timestamp (start of that day UTC)
    const eventTs = Math.floor(new Date(disaster.date + "T00:00:00Z").getTime() / 1000) as UTCTimestamp;

    // Find the candle whose time is closest to the event timestamp
    let eventCandle = candles[0];
    let minDiff     = Math.abs(candles[0].time - eventTs);
    for (const candle of candles) {
      const diff = Math.abs(candle.time - eventTs);
      if (diff < minDiff) { minDiff = diff; eventCandle = candle; }
    }

    const entryPrice = eventCandle.close;
    const entryTime  = eventCandle.time;

    const last    = candles[candles.length - 1].time;
    const prev    = candles[candles.length - 2].time;
    const gap     = last - prev;
    const future  = (last + gap * 12) as UTCTimestamp;

    // Target is calculated FROM the event-date price, not the current price
    const target  = parseFloat((entryPrice * (1 + (isUp ? disaster.magnitude : -disaster.magnitude) / 100)).toFixed(6));
    const top     = Math.max(entryPrice, target) * 1.001;
    const bottom  = Math.min(entryPrice, target) * 0.999;

    const decimals = entryPrice < 10 ? 4 : 2;

    // Filled prediction zone — from event date forward
    const fill = chartRef.current.addAreaSeries({
      topColor: predFill, bottomColor: predFill, lineColor: "transparent",
      priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
    });
    fill.setData([{ time: entryTime, value: top }, { time: future, value: top }]);
    extraRefs.current.push(fill);

    // Entry line — horizontal from event date candle to future
    const entry = chartRef.current.addLineSeries({
      color: predColor, lineWidth: 2, lineStyle: LineStyle.Solid,
      priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: false,
      title: `Entry ${entryPrice.toFixed(decimals)}`,
    });
    entry.setData([{ time: entryTime, value: entryPrice }, { time: future, value: entryPrice }]);
    extraRefs.current.push(entry);

    // Target line — dashed, from event date forward
    const tgt = chartRef.current.addLineSeries({
      color: predColor, lineWidth: 2, lineStyle: LineStyle.Dashed,
      priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: false,
      title: `Target ${target.toFixed(decimals)}`,
    });
    tgt.setData([{ time: entryTime, value: target }, { time: future, value: target }]);
    extraRefs.current.push(tgt);

    // Vertical marker at event date
    const marker = chartRef.current.addLineSeries({
      color: predColor + "66", lineWidth: 1, lineStyle: LineStyle.Dotted,
      priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false,
    });
    marker.setData([
      { time: entryTime,          value: bottom },
      { time: (entryTime + 1) as UTCTimestamp, value: top   },
    ]);
    extraRefs.current.push(marker);

    chartRef.current.timeScale().fitContent();
  }, [disaster.magnitude, disaster.date, isUp, predColor, predFill]);

  // Init chart — hex colors only, no hsl()
  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = createChart(containerRef.current, {
      layout:          { background: { type: ColorType.Solid, color: CHART_COLORS.bg }, textColor: CHART_COLORS.muted },
      grid:            { vertLines: { color: CHART_COLORS.border }, horzLines: { color: CHART_COLORS.border } },
      crosshair:       { mode: 1 },
      rightPriceScale: { borderColor: CHART_COLORS.border },
      timeScale:       { borderColor: CHART_COLORS.border, timeVisible: true },
      width:  containerRef.current.clientWidth,
      height: 420,
    });
    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: CHART_COLORS.up, downColor: CHART_COLORS.down,
      borderVisible: false, wickUpColor: CHART_COLORS.up, wickDownColor: CHART_COLORS.down,
    });
    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current)
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);
    return () => { ro.disconnect(); chartRef.current?.remove(); chartRef.current = null; };
  }, []);

  const fetchCandles = useCallback(async () => {
    if (!seriesRef.current) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/commodity-chart?commodity=${encodeURIComponent(disaster.primary)}&interval=${tf.interval}&outputsize=${tf.outputsize}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setIsMock(!!json.mock);

      const candles: Candle[] = (json.candles as any[])
        .map((c) => ({
          time:  (typeof c.time === "number" ? c.time : Math.floor(new Date(c.time).getTime() / 1000)) as UTCTimestamp,
          open:  Number(c.open), high: Number(c.high), low: Number(c.low), close: Number(c.close),
        }))
        .sort((a, b) => a.time - b.time)
        .filter((c, i, arr) => i === 0 || c.time > arr[i - 1].time);

      if (!candles.length) throw new Error("empty");
      candlesRef.current = candles;
      seriesRef.current?.setData(candles);
      const cur      = candles[candles.length - 1].close;
      setLastPrice(cur);
      setStartPrice(candles[0].close);

      // Find the candle closest to the disaster event date for header display
      const eventTs = Math.floor(new Date(disaster.date + "T00:00:00Z").getTime() / 1000);
      let evCandle  = candles[0];
      let minDiff   = Math.abs(candles[0].time - eventTs);
      for (const candle of candles) {
        const diff = Math.abs(candle.time - eventTs);
        if (diff < minDiff) { minDiff = diff; evCandle = candle; }
      }
      setEventPrice(evCandle.close);

      drawPredBox(candles);
    } catch (e) {
      console.error("[CommodityChart]", e);
    } finally { setLoading(false); }
  }, [disaster.primary, tf, drawPredBox]);

  useEffect(() => { fetchCandles(); }, [fetchCandles]);

  const pct      = lastPrice && startPrice ? ((lastPrice - startPrice) / startPrice) * 100 : null;
  // Target is always calculated from the event-date price, not today's price
  const target   = eventPrice ? eventPrice * (1 + (isUp ? disaster.magnitude : -disaster.magnitude) / 100) : null;
  const decimals = lastPrice && lastPrice < 10 ? 4 : 2;

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground">
              {disaster.primary.toUpperCase()} · {tf.label} · {disaster.primarySymbol}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {lastPrice != null
                ? <span className="text-xl font-black font-mono">{lastPrice.toFixed(decimals)}</span>
                : <span className="text-xl font-black font-mono text-muted-foreground">—</span>}
              {pct != null && (
                <span className={cn("text-xs font-mono font-bold", pct >= 0 ? "text-emerald-400" : "text-red-400")}>
                  {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%
                </span>
              )}
              {isMock && <Badge variant="outline" className="text-[9px] border-yellow-500/30 text-yellow-500">SIMULATED</Badge>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {eventPrice != null && target != null && (
            <div className="flex flex-col items-end gap-0.5">
              {/* Entry — price at disaster event date */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: predColor + "33", color: predColor }}>
                <span className="opacity-50">Entry</span>
                <span className="font-bold">{eventPrice.toFixed(decimals)}</span>
                <span className="opacity-40 text-[9px]">{disaster.date}</span>
              </div>
              {/* Target — calculated from entry price */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold"
                style={{ background: predFill, borderColor: predColor + "55", color: predColor }}>
                {isUp ? "▲" : "▼"} Target {target.toFixed(decimals)}
                <span className="opacity-60 font-normal ml-1">({isUp ? "+" : "-"}{disaster.magnitude.toFixed(1)}%)</span>
              </div>
            </div>
          )}
          <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
            {TIMEFRAMES.map((t) => (
              <button key={t.label} onClick={() => setTf(t)}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all",
                  tf.label === t.label ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              Fetching {disaster.primary} via Infoway...
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-4 py-2 border-t border-border text-[10px] font-mono text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5" style={{ background: predColor }} />Entry</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-5 border-t-2 border-dashed" style={{ borderColor: predColor }} />ML Target ({isUp ? "+" : "-"}{disaster.magnitude.toFixed(1)}%)</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: predFill, border: `1px solid ${predColor}55` }} />Prediction Zone</span>
        <span className="ml-auto opacity-40">Infoway Markets</span>
      </div>
    </div>
  );
}