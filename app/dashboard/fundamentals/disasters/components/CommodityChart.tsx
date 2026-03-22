"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  UTCTimestamp,
  LineStyle,
} from "lightweight-charts";
import { Disaster } from "../types/disaster";
import { ALERT_CONFIG } from "../lib/disasters";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Candle {
  time:  UTCTimestamp;
  open:  number;
  high:  number;
  low:   number;
  close: number;
}

interface CommodityChartProps {
  disaster: Disaster;
}

const TIMEFRAMES = [
  { label: "15m", interval: "15min", outputsize: "96"  },
  { label: "1H",  interval: "1h",    outputsize: "120" },
  { label: "4H",  interval: "4h",    outputsize: "120" },
  { label: "1D",  interval: "1day",  outputsize: "180" },
];

export function CommodityChart({ disaster }: CommodityChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef     = useRef<IChartApi | null>(null);
  const seriesRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const extraRefs    = useRef<ISeriesApi<any>[]>([]);
  const candlesRef   = useRef<Candle[]>([]);

  const [loading,    setLoading]    = useState(true);
  const [isMock,     setIsMock]     = useState(false);
  const [tf,         setTf]         = useState(TIMEFRAMES[0]);
  const [lastPrice,  setLastPrice]  = useState<number | null>(null);
  const [startPrice, setStartPrice] = useState<number | null>(null);

  const ac       = ALERT_CONFIG[disaster.alert];
  const isUp     = disaster.direction === "UP";
  const predColor = isUp ? "#10b981" : "#ef4444";

  // ── Draw prediction box ───────────────────────────────────────────────────
  const drawPredictionBox = useCallback(
    (candles: Candle[], currentPrice: number) => {
      if (!chartRef.current || candles.length < 2) return;

      // Remove old extra series
      extraRefs.current.forEach((s) => {
        try { chartRef.current?.removeSeries(s); } catch { /* ignore */ }
      });
      extraRefs.current = [];

      const firstTime = candles[0].time;
      const lastTime  = candles[candles.length - 1].time;

      // Project forward: add ~20% more time beyond last candle
      const intervalSec = lastTime - candles[candles.length - 2].time;
      const futureTime  = (lastTime + intervalSec * 8) as UTCTimestamp;

      const targetPrice = parseFloat(
        (currentPrice * (1 + (isUp ? disaster.magnitude : -disaster.magnitude) / 100)).toFixed(6)
      );
      const boxTop    = Math.max(currentPrice, targetPrice) * 1.001;
      const boxBottom = Math.min(currentPrice, targetPrice) * 0.999;

      const fillColor  = isUp ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)";
      const lineColor  = isUp ? "rgba(16,185,129,0.85)" : "rgba(239,68,68,0.85)";
      const lineColorD = isUp ? "rgba(16,185,129,0.40)" : "rgba(239,68,68,0.40)";

      // Fill area
      const fillSeries = chartRef.current.addAreaSeries({
        topColor:             fillColor,
        bottomColor:          fillColor,
        lineColor:            "transparent",
        priceLineVisible:     false,
        lastValueVisible:     false,
        crosshairMarkerVisible: false,
      });
      fillSeries.setData([
        { time: lastTime,   value: boxTop },
        { time: futureTime, value: boxTop },
      ]);
      extraRefs.current.push(fillSeries);

      // Start price horizontal line (entry)
      const startLine = chartRef.current.addLineSeries({
        color:                 lineColor,
        lineWidth:             2,
        lineStyle:             LineStyle.Solid,
        priceLineVisible:      false,
        lastValueVisible:      true,
        crosshairMarkerVisible: false,
        title:                 `Entry ${currentPrice.toFixed(4)}`,
      });
      startLine.setData([
        { time: firstTime,  value: currentPrice },
        { time: futureTime, value: currentPrice },
      ]);
      extraRefs.current.push(startLine);

      // Target price line (dashed)
      const targetLine = chartRef.current.addLineSeries({
        color:                 lineColor,
        lineWidth:             2,
        lineStyle:             LineStyle.Dashed,
        priceLineVisible:      false,
        lastValueVisible:      true,
        crosshairMarkerVisible: false,
        title:                 `Target ${targetPrice.toFixed(4)}`,
      });
      targetLine.setData([
        { time: lastTime,   value: targetPrice },
        { time: futureTime, value: targetPrice },
      ]);
      extraRefs.current.push(targetLine);

      // Vertical line at "now"
      const nowLine = chartRef.current.addLineSeries({
        color:                 lineColorD,
        lineWidth:             1,
        lineStyle:             LineStyle.Dotted,
        priceLineVisible:      false,
        lastValueVisible:      false,
        crosshairMarkerVisible: false,
      });
      nowLine.setData([
        { time: lastTime, value: boxBottom * 0.998 },
        { time: lastTime, value: boxTop   * 1.002  },
      ]);
      extraRefs.current.push(nowLine);

      chartRef.current.timeScale().fitContent();
    },
    [disaster.magnitude, isUp]
  );

  // ── Init chart ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // lightweight-charts only accepts hex or rgba() — not hsl() or CSS vars.
    const bgColor     = "#09090b";   // zinc-950  (matches shadcn dark background)
    const mutedColor  = "#71717a";   // zinc-500  (muted foreground)
    const borderColor = "#27272a";   // zinc-800  (border)

    chartRef.current = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor:  mutedColor,
      },
      grid: {
        vertLines: { color: borderColor },
        horzLines: { color: borderColor },
      },
      crosshair:       { mode: 1 },
      rightPriceScale: { borderColor: borderColor },
      timeScale:       { borderColor: borderColor, timeVisible: true },
      width:  containerRef.current.clientWidth,
      height: 300,
    });

    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor:    "#10b981",
      downColor:  "#ef4444",
      borderVisible: false,
      wickUpColor:   "#10b981",
      wickDownColor: "#ef4444",
    });

    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
    };
  }, []);

  // ── Fetch candles ─────────────────────────────────────────────────────────
  const fetchCandles = useCallback(async () => {
    if (!chartRef.current || !seriesRef.current) return;
    setLoading(true);
    try {
      const res  = await fetch(
        `/api/commodity-chart?commodity=${encodeURIComponent(disaster.primary)}&interval=${tf.interval}&outputsize=${tf.outputsize}`
      );
      const json = await res.json();
      setIsMock(!!json.mock);

      const candles: Candle[] = json.candles.map((c: any) => ({
        time:  Math.floor(new Date(c.time).getTime() / 1000) as UTCTimestamp,
        open:  c.open,
        high:  c.high,
        low:   c.low,
        close: c.close,
      }));

      candlesRef.current = candles;
      seriesRef.current.setData(candles);

      const current = candles[candles.length - 1]?.close ?? null;
      const start   = candles[0]?.close ?? null;
      setLastPrice(current);
      setStartPrice(start);

      if (current !== null) drawPredictionBox(candles, current);
    } catch (err) {
      console.error("[CommodityChart]", err);
    } finally {
      setLoading(false);
    }
  }, [disaster.primary, tf, drawPredictionBox]);

  useEffect(() => { fetchCandles(); }, [fetchCandles]);

  const pctChange = lastPrice && startPrice
    ? ((lastPrice - startPrice) / startPrice) * 100
    : null;
  const targetPrice = lastPrice
    ? lastPrice * (1 + (isUp ? disaster.magnitude : -disaster.magnitude) / 100)
    : null;

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      {/* Chart header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-mono font-bold tracking-widest text-muted-foreground">
              {disaster.primary.toUpperCase()} · 15MIN CHART
            </p>
            {lastPrice !== null && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-black font-mono text-foreground">
                  {lastPrice.toFixed(lastPrice < 10 ? 4 : 2)}
                </span>
                {pctChange !== null && (
                  <span
                    className={cn(
                      "text-xs font-mono font-bold",
                      pctChange >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(2)}%
                  </span>
                )}
              </div>
            )}
          </div>
          {isMock && (
            <Badge variant="outline" className="text-[9px] border-yellow-500/40 text-yellow-400">
              SIMULATED DATA
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Prediction pill */}
          {targetPrice !== null && (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold"
              style={{
                background: isUp ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)",
                borderColor: isUp ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)",
                color: predColor,
              }}
            >
              {isUp ? "▲" : "▼"}
              Target {targetPrice.toFixed(targetPrice < 10 ? 4 : 2)}
              <span className="opacity-60 font-normal ml-1">
                ({isUp ? "+" : "-"}{disaster.magnitude.toFixed(1)}%)
              </span>
            </div>
          )}

          {/* Timeframe buttons */}
          <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
            {TIMEFRAMES.map((t) => (
              <button
                key={t.label}
                onClick={() => setTf(t)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all",
                  tf.label === t.label
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading {disaster.primary} chart...
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-4 py-2 border-t border-border text-[10px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5" style={{ background: predColor }} />
          Entry price
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: predColor }} />
          ML target ({isUp ? "+" : "-"}{disaster.magnitude.toFixed(1)}%)
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm opacity-60"
            style={{ background: isUp ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)" }}
          />
          Prediction zone
        </span>
        <span className="ml-auto opacity-50">Powered by Twelve Data</span>
      </div>
    </div>
  );
}