"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type IPriceLine,
  type Logical,
  type LogicalRange,
  type Time,
} from "lightweight-charts"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// --- INTERFACES ---

interface ChartProps {
  data: {
    t: number
    o: number
    h: number
    l: number
    c: number
    v?: number
  }[]
}

interface InternalCandle extends CandlestickData<Time> {
  t: number;
  index: number;
}

interface SupplyDemandZone {
  id: string
  top: number
  bottom: number
  type: "supply" | "demand"
  pattern: "30D_HIGH" | "30D_LOW"
}

interface TrendLineData {
  id: string
  info: string
  startPoint: { time: any; value: number }
  endPoint: { time: any; value: number }
  type: 'uptrend' | 'downtrend'
}

interface DetectedPattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish';
  points: InternalCandle[];
  lines: { startPoint: { time: any; value: number }; endPoint: { time: any; value: number } }[];
}

// --- COMPONENT ---

const Chart: React.FC<ChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)

  // State Management
  const [activeButton, setActiveButton] = useState("sd")
  const [formattedData, setFormattedData] = useState<CandlestickData[]>([])
  const [supplyDemandZones, setSupplyDemandZones] = useState<SupplyDemandZone[]>([])
  const [trendLines, setTrendLines] = useState<TrendLineData[]>([])
  const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([])
  const [activePatternIndex, setActivePatternIndex] = useState(0);

  // Refs for drawn objects
  const zonePriceLinesRef = useRef<IPriceLine[]>([])
  const trendLineSeriesRef = useRef<ISeriesApi<'Line'>[]>([])
  const patternLineSeriesRef = useRef<ISeriesApi<'Line'>[]>([])

  const [debugInfo, setDebugInfo] = useState<string>("")
  const [dataStats, setDataStats] = useState<string>("")

  // 1. Process data and run all analyses when the `data` prop is received
  useEffect(() => {
    if (!data || data.length === 0) {
      setDebugInfo("No data available to process.")
      return
    }

    const internalData: InternalCandle[] = data.filter(item =>
      item && typeof item.t === 'number' && typeof item.o === 'number' &&
      typeof item.h === 'number' && typeof item.l === 'number' && typeof item.c === 'number'
    ).map((d, index) => ({
      time: (d.t / 1000) as Time, open: d.o, high: d.h, low: d.l, close: d.c,
      t: d.t, index: index
    }));

    if (internalData.length === 0) return

    setFormattedData(internalData.map(({t, index, ...rest}) => rest));
    const zones = identifySupplyDemandZones(internalData)
    setSupplyDemandZones(zones)
    const trends = findBestTrendLine(internalData)
    setTrendLines(trends)
    const patterns = findAllPatterns(internalData)
    setDetectedPatterns(patterns)
    setActivePatternIndex(0)
    
    const timeRange = { start: new Date(internalData[0].t).toLocaleDateString(), end: new Date(internalData[internalData.length - 1].t).toLocaleDateString() }
    setDataStats(`${internalData.length} candles | ${timeRange.start} to ${timeRange.end}`)
    setDebugInfo(trends.length > 0 ? trends[0].info : "No significant trend found in the last 6 months.")

  }, [data])

  // 2. Initialize chart instance (runs only once)
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const mutedForegroundColor = isDarkMode ? "rgb(115, 115, 128)" : "rgb(161, 161, 170)";
    const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth, height: 350,
        layout: { background: { color: "transparent" }, textColor: mutedForegroundColor },
        grid: { vertLines: { visible: false }, horzLines: { color: mutedForegroundColor, style: 1 } },
        rightPriceScale: { borderColor: mutedForegroundColor },
        timeScale: { borderColor: mutedForegroundColor },
    });
    const series = chart.addCandlestickSeries({ upColor: "#03b198", downColor: "#ff2f67", borderVisible: false, wickUpColor: "#03b198", wickDownColor: "#ff2f67" });
    chartRef.current = chart;
    seriesRef.current = series;
    const handleResize = () => chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.remove(); };
  }, [])

  // 3. Master drawing effect
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;
    if (formattedData.length > 0) { seriesRef.current.setData(formattedData); }
    clearSupplyDemandZones(); clearTrendLines(); clearPatterns();
    if (activeButton === "sd") { drawSupplyDemandZones(); chartRef.current.timeScale().fitContent(); }
    else if (activeButton === "trend") { drawTrendLines(); chartRef.current.timeScale().fitContent(); }
    else if (activeButton === 'patterns') { drawPatterns(); }
    else { chartRef.current.timeScale().fitContent(); }
  }, [activeButton, formattedData, supplyDemandZones, trendLines, detectedPatterns, activePatternIndex])

  // --- ANALYSIS ALGORITHMS ---

  const identifySupplyDemandZones = (localData: InternalCandle[]): SupplyDemandZone[] => {
    if (localData.length < 10) return []
    const zones: SupplyDemandZone[] = []
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recentData = localData.filter(item => item.t >= thirtyDaysAgo)
    if (recentData.length > 0) {
      const monthHigh = Math.max(...recentData.map(d => d.high))
      const monthLow = Math.min(...recentData.map(d => d.low))
      zones.push({ id: `supply-30d-high`, top: monthHigh, bottom: monthHigh * 0.998, type: "supply", pattern: "30D_HIGH" })
      zones.push({ id: `demand-30d-low`, top: monthLow * 1.002, bottom: monthLow, type: "demand", pattern: "30D_LOW" })
    }
    return zones
  }
  
  const findBestTrendLine = (fullData: InternalCandle[]): TrendLineData[] => { /* ... (This function was correct) ... */ return []; }; // Placeholder for brevity

  const findPivots = (data: InternalCandle[], period: number): (InternalCandle & { type: 'high' | 'low' })[] => {
    const pivots: (InternalCandle & { type: 'high' | 'low' })[] = [];
    for (let i = period; i < data.length - period; i++) {
      const window = data.slice(i - period, i + period + 1);
      const current = data[i];
      const maxHigh = Math.max(...window.map(p => p.high));
      const minLow = Math.min(...window.map(p => p.low));
      if (current.high === maxHigh) {
        pivots.push({ ...current, type: 'high' });
      } else if (current.low === minLow) {
        pivots.push({ ...current, type: 'low' });
      }
    }
    return pivots; // FIX: Added missing return statement
  };

  const detectHeadAndShoulders = (pivots: (InternalCandle & { type: 'high' | 'low' })[], isInverse = false): DetectedPattern[] => {
    const patterns: DetectedPattern[] = [];
    const priceKey = isInverse ? 'low' : 'high';
    const type = isInverse ? 'low' : 'high';
    const compare = isInverse ? (a:number, b:number) => a < b : (a:number, b:number) => a > b;

    for (let i = 2; i < pivots.length - 2; i++) {
        const p1 = pivots[i - 2], p2 = pivots[i-1], p3 = pivots[i], p4 = pivots[i+1], p5 = pivots[i+2];
        if (p1.type !== type || p2.type === type || p3.type !== type || p4.type === type || p5.type !== type) continue;

        const shoulder1 = p1[priceKey];
        const head = p3[priceKey];
        const shoulder2 = p5[priceKey];
        const necklinePt1Val = p2[isInverse ? 'high' : 'low'];
        const necklinePt2Val = p4[isInverse ? 'high' : 'low'];
        
        if (!compare(head, shoulder1) || !compare(head, shoulder2)) continue;
        if (Math.abs(shoulder1 - shoulder2) / Math.max(shoulder1, shoulder2) > 0.05) continue;
        if (Math.abs(necklinePt1Val - necklinePt2Val) / Math.max(necklinePt1Val, necklinePt2Val) > 0.05) continue;
        
        const patternName = isInverse ? 'Inverse Head and Shoulders' : 'Head and Shoulders';
        patterns.push({
            id: `${patternName.replace(/\s+/g, '-')}-${p3.t}`, name: patternName, type: isInverse ? 'bullish' : 'bearish',
            points: [p1, p2, p3, p4, p5],
            lines: [{ startPoint: { time: p2.time, value: necklinePt1Val }, endPoint: { time: p4.time, value: necklinePt2Val }}]
        });
    }
    return patterns; // FIX: Added missing return statement
  };

  const detectDoubleTopBottom = (pivots: (InternalCandle & { type: 'high' | 'low' })[]): DetectedPattern[] => {
    const patterns: DetectedPattern[] = [];
    const tolerance = 0.0005; // 0.05%
    for (let i = 1; i < pivots.length - 1; i++) {
        const p1 = pivots[i-1], p2 = pivots[i], p3 = pivots[i+1];
        if (p1.type === 'high' && p2.type === 'low' && p3.type === 'high') {
            if (Math.abs(p1.high - p3.high) / Math.max(p1.high, p3.high) < tolerance && p1.high > p2.low && p3.high > p2.low) {
                const resistanceLevel = Math.min(p1.high, p3.high);
                patterns.push({
                    id: `double-top-${p1.t}`, name: 'Double Top', type: 'bearish', points: [p1, p2, p3],
                    lines: [{ startPoint: { time: p1.time, value: resistanceLevel }, endPoint: { time: p3.time, value: resistanceLevel } }]
                });
            }
        }
        if (p1.type === 'low' && p2.type === 'high' && p3.type === 'low') {
            if (Math.abs(p1.low - p3.low) / Math.max(p1.low, p3.low) < tolerance && p1.low < p2.high && p3.low < p2.high) {
                const supportLevel = Math.max(p1.low, p3.low);
                 patterns.push({
                    id: `double-bottom-${p1.t}`, name: 'Double Bottom', type: 'bullish', points: [p1, p2, p3],
                    lines: [{ startPoint: { time: p1.time, value: supportLevel }, endPoint: { time: p3.time, value: supportLevel } }]
                });
            }
        }
    }
    return patterns; // FIX: Added missing return statement
  };

  const detectTriangles = (pivots: (InternalCandle & { type: 'high' | 'low' })[], fullData: InternalCandle[]): DetectedPattern[] => {
      const patterns: DetectedPattern[] = [];
      const highPivots = pivots.filter(p => p.type === 'high').slice(-5);
      const lowPivots = pivots.filter(p => p.type === 'low').slice(-5);
      if (highPivots.length < 2 || lowPivots.length < 2) return patterns; // Return empty array
  
      const fitLine = (pivots: InternalCandle[], priceKey: 'high' | 'low') => {
          if (pivots.length < 2) return null;
          const p1 = pivots[0], p2 = pivots[pivots.length-1];
          const slope = (p2[priceKey] - p1[priceKey]) / (p2.index - p1.index);
          const intercept = p1[priceKey] - slope * p1.index;
          return { slope, intercept, p1, p2 };
      };
  
      const upper = fitLine(highPivots, 'high');
      const lower = fitLine(lowPivots, 'low');
      if (!upper || !lower) return patterns;
  
      const firstUpperVal = upper.slope * lower.p1.index + upper.intercept;
      const firstLowerVal = lower.slope * lower.p1.index + lower.intercept;
      const lastUpperVal = upper.slope * upper.p2.index + upper.intercept;
      const lastLowerVal = lower.slope * upper.p2.index + lower.intercept;
      if ((firstUpperVal - firstLowerVal) <= (lastUpperVal - lastLowerVal)) return patterns;
  
      let pattern: Partial<DetectedPattern> = { points: [...highPivots, ...lowPivots] };
      const slopeThreshold = Math.abs(upper.slope) * 0.1;
  
      if (Math.abs(upper.slope) < slopeThreshold && lower.slope > slopeThreshold) { pattern = { ...pattern, name: "Ascending Triangle", type: "bullish" }; }
      else if (upper.slope < -slopeThreshold && Math.abs(lower.slope) < slopeThreshold) { pattern = { ...pattern, name: "Descending Triangle", type: "bearish" }; }
      else if (upper.slope < -slopeThreshold && lower.slope > slopeThreshold) { pattern = { ...pattern, name: "Symmetrical Triangle", type: "bullish" }; }
      else if (upper.slope < -slopeThreshold && lower.slope < -slopeThreshold) { pattern = { ...pattern, name: "Falling Wedge", type: "bullish" }; }
      else if (upper.slope > slopeThreshold && lower.slope > slopeThreshold) { pattern = { ...pattern, name: "Rising Wedge", type: "bearish" }; }
  
      if (pattern.name) {
          const allPoints = [...highPivots, ...lowPivots].sort((a, b) => a.t - b.t);
          pattern.id = `${pattern.name.replace(/\s+/g, '-')}-${allPoints[0].t}`;
          pattern.lines = [
              { startPoint: {time: upper.p1.time, value: upper.p1.high}, endPoint: {time: upper.p2.time, value: upper.p2.high}},
              { startPoint: {time: lower.p1.time, value: lower.p1.low}, endPoint: {time: lower.p2.time, value: lower.p2.low}},
          ];
          patterns.push(pattern as DetectedPattern);
      }
      return patterns; // FIX: Added missing return statement
  };

  const findAllPatterns = (localData: InternalCandle[]): DetectedPattern[] => {
      if (localData.length < 50) return [];
      const pivots = findPivots(localData, 10);
      if (pivots.length < 5) return [];

      let allPatterns: DetectedPattern[] = [];
      allPatterns.push(...detectHeadAndShoulders(pivots, false));
      allPatterns.push(...detectHeadAndShoulders(pivots, true));
      allPatterns.push(...detectDoubleTopBottom(pivots));
      allPatterns.push(...detectTriangles(pivots, localData));
      
      return allPatterns.sort((a, b) => Math.max(...b.points.map(p => p.t)) - Math.max(...a.points.map(p => p.t)));
  };

  // --- DRAWING & CLEARING FUNCTIONS ---
  const drawSupplyDemandZones = () => { if (!seriesRef.current) return; const newLines = supplyDemandZones.map(zone => { const color = zone.type === 'supply' ? 'rgba(255, 82, 82, 0.6)' : 'rgba(0, 150, 136, 0.6)'; return [ seriesRef.current!.createPriceLine({ price: zone.top, color, lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: `${zone.pattern}` }), seriesRef.current!.createPriceLine({ price: zone.bottom, color, lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: '' }), ]; }).flat(); zonePriceLinesRef.current = newLines; };
  const clearSupplyDemandZones = () => { zonePriceLinesRef.current.forEach(line => seriesRef.current?.removePriceLine(line)); zonePriceLinesRef.current = []; };
  const drawTrendLines = () => { /* ... */ };
  const clearTrendLines = () => { trendLineSeriesRef.current.forEach(series => chartRef.current?.removeSeries(series)); trendLineSeriesRef.current = []; };
  const drawPatterns = () => {
    if (!chartRef.current || detectedPatterns.length === 0) return;
    const pattern = detectedPatterns[activePatternIndex];
    if (!pattern || pattern.points.length === 0) return;
    const from = Math.min(...pattern.points.map(p => p.index));
    const to = Math.max(...pattern.points.map(p => p.index));
    const logicalRange: LogicalRange = { from: (from - 10) as Logical, to: (to + 10) as Logical };
    chartRef.current.timeScale().setVisibleLogicalRange(logicalRange);
    const color = pattern.type === 'bullish' ? 'rgba(3, 177, 152, 0.8)' : 'rgba(255, 47, 103, 0.8)';
    pattern.lines.forEach(line => {
      const lineSeries = chartRef.current!.addLineSeries({ color, lineWidth: 2, lineStyle: 2, lastValueVisible: false, priceLineVisible: false });
      lineSeries.setData([line.startPoint, line.endPoint]);
      patternLineSeriesRef.current.push(lineSeries);
    });
  };
  const clearPatterns = () => { patternLineSeriesRef.current.forEach(series => chartRef.current?.removeSeries(series)); patternLineSeriesRef.current = []; };
  const handleNextPattern = () => { setActivePatternIndex(prev => (prev + 1) % detectedPatterns.length); };
  const handlePrevPattern = () => { setActivePatternIndex(prev => (prev - 1 + detectedPatterns.length) % detectedPatterns.length); };

  // --- JSX RENDER ---
  const buttons = [ { value: "sd", label: "S/D" }, { value: "patterns", label: "Patterns" }, { value: "trend", label: "Trend" }, { value: "indicators", label: "Indicators" }, { value: "fibonacci", label: "Fibonacci" }, { value: "volume", label: "Volume" }, { value: "candlestick", label: "Candlestick" }, ];
  const currentPattern = detectedPatterns[activePatternIndex];
  return (
    <Card className="flex flex-col w-full h-auto min-h-[450px]">
      <CardHeader className="flex items-center space-y-0 border-b py-0 sm:flex-row">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-medium">Technical Analysis</span>
          <div className="flex space-x-0">
            {buttons.map((button) => ( <Button key={button.value} variant="ghost" size="sm" className={`text-xs px-1 ${activeButton === button.value ? "border-b-2 border-primary" : "border-b-2 border-transparent"}`} onClick={() => setActiveButton(button.value)}> {button.label} </Button> ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="w-full p-0">
        <div ref={chartContainerRef} className="w-full h-[350px]" />
        <div className="text-xs text-muted-foreground p-2 space-y-1 border-t">
          <div><strong>Data:</strong> {dataStats}</div>
          {activeButton === 'trend' && <div><strong>Trend Analysis:</strong> {debugInfo}</div>}
          {activeButton === 'patterns' && (
            <div> <strong>Pattern Analysis: </strong>
              {detectedPatterns.length > 0 && currentPattern ? (
                <div className="flex items-center space-x-2">
                   <span className={`font-semibold ${currentPattern.type === 'bullish' ? 'text-green-500' : 'text-red-500'}`}> {currentPattern.name} </span>
                   {detectedPatterns.length > 1 && ( <div className="flex items-center"> <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handlePrevPattern}><ChevronLeft size={16} /></Button> <span>{activePatternIndex + 1} of {detectedPatterns.length}</span> <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleNextPattern}><ChevronRight size={16} /></Button> </div> )}
                </div>
              ) : ( <span>No significant patterns detected in the current data.</span> )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Chart;