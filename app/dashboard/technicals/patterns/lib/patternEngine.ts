// ─────────────────────────────────────────────────────────────────────────────
// Institutional-Grade Forex Pattern Detection Engine v3
// ─────────────────────────────────────────────────────────────────────────────
//
// KEY DESIGN DECISIONS:
//  1. All detectors receive the FULL candle array. Indices returned are always
//     into that full array — no slice-based offset arithmetic.
//  2. Every pattern carries a `shapes` array. Each shape is a polyline of
//     {time, value} points that can be drawn directly on a LightweightCharts
//     LineSeries. This lets us draw the ACTUAL pattern geometry (zigzag for
//     H&S, converging trendlines for triangles, flag channel, etc.)
//  3. Detection window is capped at the last 120 candles.
// ─────────────────────────────────────────────────────────────────────────────

export interface Candle {
  time:   number  // unix seconds — this IS the chart x-axis key
  open:   number
  high:   number
  low:    number
  close:  number
  volume?: number
}

export type Direction        = 'bullish' | 'bearish' | 'neutral'
export type VolatilityRegime = 'low' | 'normal' | 'high'

/** A single point on the chart */
export interface ChartPoint { time: number; value: number }

/** One drawable line/polyline on the chart */
export interface PatternShape {
  id:        string           // e.g. "neckline", "left_shoulder"
  points:    ChartPoint[]     // connect-the-dots in order
  style:     'solid' | 'dashed' | 'dotted'
  width:     1 | 2
  label?:    string           // shown as price-axis label on last point
}

export interface KeyLevel { label: string; price: number }

export interface PatternScore {
  total:      number
  trendAlign: number
  momentum:   number
  symmetry:   number
  volConfirm: number
  breakout:   number
  penalties:  number
  breakdown:  string[]
}

export interface DetectedPattern {
  asset:       string
  pattern:     string
  probability: number
  direction:   Direction
  timeframe:   string
  detectedAt:  number       // unix time of the last significant point
  startIdx:    number       // index into FULL candle array
  endIdx:      number       // index into FULL candle array
  keyLevels:   KeyLevel[]
  shapes:      PatternShape[]  // ← draw these on the chart
  score:       PatternScore
  regime:      VolatilityRegime
  confirmed:   boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Indicators
// ─────────────────────────────────────────────────────────────────────────────

export function calcATR(candles: Candle[], period = 14): number {
  if (candles.length < period + 1) return 0.0001
  let sum = 0
  const start = candles.length - period
  for (let i = start; i < candles.length; i++) {
    const h = candles[i].high, l = candles[i].low, pc = candles[i - 1].close
    sum += Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc))
  }
  return sum / period || 0.0001
}

export function calcDualATR(candles: Candle[]) {
  return { atr14: calcATR(candles, 14), atr50: calcATR(candles, 50) }
}

export function classifyRegime(atr14: number, atr50: number): VolatilityRegime {
  if (atr14 < atr50 * 0.7) return 'low'
  if (atr14 > atr50 * 1.3) return 'high'
  return 'normal'
}

function calcEMA(candles: Candle[], period: number): number[] {
  if (candles.length < period) return []
  const k = 2 / (period + 1)
  let prev = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period
  const out = [prev]
  for (let i = period; i < candles.length; i++) {
    prev = candles[i].close * k + prev * (1 - k)
    out.push(prev)
  }
  return out
}

function calcRSI(candles: Candle[], period = 14): number[] {
  if (candles.length < period + 1) return []
  const gains: number[] = [], losses: number[] = []
  for (let i = 1; i < candles.length; i++) {
    const d = candles[i].close - candles[i - 1].close
    gains.push(Math.max(d, 0)); losses.push(Math.max(-d, 0))
  }
  let ag = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
  let al = losses.slice(0, period).reduce((a, b) => a + b, 0) / period
  const out: number[] = []
  for (let i = period; i < gains.length; i++) {
    ag = (ag * (period - 1) + gains[i]) / period
    al = (al * (period - 1) + losses[i]) / period
    out.push(100 - 100 / (1 + (al === 0 ? 9999 : ag / al)))
  }
  return out
}

export interface TrendState {
  direction: 'up' | 'down' | 'sideways'
  ema20: number; ema50: number; ema200: number; slope50: number
}

export function detectTrend(candles: Candle[], atr14: number): TrendState | null {
  if (candles.length < 210) return null
  const e20 = calcEMA(candles, 20), e50 = calcEMA(candles, 50), e200 = calcEMA(candles, 200)
  if (!e20.length || !e50.length || !e200.length) return null
  const ema20 = e20[e20.length - 1], ema50 = e50[e50.length - 1], ema200 = e200[e200.length - 1]
  const slope50 = e50[e50.length - 1] - e50[Math.max(0, e50.length - 6)]
  const slopeOk = Math.abs(slope50) >= atr14 * 0.05
  let direction: 'up' | 'down' | 'sideways' = 'sideways'
  if (ema20 > ema50 && ema50 > ema200 && slope50 > 0 && slopeOk) direction = 'up'
  if (ema20 < ema50 && ema50 < ema200 && slope50 < 0 && slopeOk) direction = 'down'
  return { direction, ema20, ema50, ema200, slope50 }
}

export interface MomentumState {
  rsi: number; isOverbought: boolean; isOversold: boolean
  risingRSI: boolean; fallingRSI: boolean; bullish: boolean; bearish: boolean
}

export function getMomentum(candles: Candle[]): MomentumState | null {
  const r = calcRSI(candles, 14)
  if (r.length < 4) return null
  const rsi = r[r.length - 1], rsi3 = r[r.length - 4]
  return {
    rsi, isOverbought: rsi > 80, isOversold: rsi < 20,
    risingRSI: rsi > rsi3, fallingRSI: rsi < rsi3,
    bullish: rsi > 55, bearish: rsi < 45,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Candle validation
// ─────────────────────────────────────────────────────────────────────────────

export function isValidCandle(c: Candle, prev: Candle | null, atr14: number): boolean {
  if (c.high < Math.max(c.open, c.close)) return false
  if (c.low  > Math.min(c.open, c.close)) return false
  const r = c.high - c.low
  if (r <= 0 || r > atr14 * 8) return false
  if (prev && Math.abs(c.open - prev.close) > atr14 * 3) return false
  if (r < atr14 * 0.2) return false
  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// Swing detection — indices are into the array passed in (always the full arr)
// ─────────────────────────────────────────────────────────────────────────────

export interface SwingPoint { idx: number; price: number; type: 'high' | 'low' }

export function findSwingHighs(candles: Candle[], atr14: number, lookback = 120): SwingPoint[] {
  const start = Math.max(2, candles.length - lookback)
  const out: SwingPoint[] = []
  const minDist = atr14 * 0.8

  for (let i = start; i < candles.length - 2; i++) {
    const c = candles[i]
    if (
      c.high > candles[i - 1].high &&
      c.high > candles[i - 2].high &&
      c.high > candles[i + 1].high &&
      c.high > candles[i + 2].high
    ) {
      const last = out[out.length - 1]
      if (!last || (i - last.idx >= 3 && Math.abs(c.high - last.price) >= minDist)) {
        out.push({ idx: i, price: c.high, type: 'high' })
      }
    }
  }
  return out
}

export function findSwingLows(candles: Candle[], atr14: number, lookback = 120): SwingPoint[] {
  const start = Math.max(2, candles.length - lookback)
  const out: SwingPoint[] = []
  const minDist = atr14 * 0.8

  for (let i = start; i < candles.length - 2; i++) {
    const c = candles[i]
    if (
      c.low < candles[i - 1].low &&
      c.low < candles[i - 2].low &&
      c.low < candles[i + 1].low &&
      c.low < candles[i + 2].low
    ) {
      const last = out[out.length - 1]
      if (!last || (i - last.idx >= 3 && Math.abs(c.low - last.price) >= minDist)) {
        out.push({ idx: i, price: c.low, type: 'low' })
      }
    }
  }
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// Score builder
// ─────────────────────────────────────────────────────────────────────────────

export function buildScore(p: {
  trendAlign: boolean; momentum: boolean; symmetry: boolean
  volConfirm: boolean; breakout: boolean; lowVolNoise: boolean; details: string[]
}): PatternScore {
  const trendAlign = p.trendAlign ? 20 : 0
  const momentum   = p.momentum   ? 15 : 0
  const symmetry   = p.symmetry   ? 20 : 0
  const volConfirm = p.volConfirm ? 15 : 0
  const breakout   = p.breakout   ? 20 : 0
  const penalties  = p.lowVolNoise ? -15 : 0
  const total      = trendAlign + momentum + symmetry + volConfirm + breakout + penalties
  const breakdown  = [...p.details]
  if (trendAlign) breakdown.push('+20 trend aligned')
  if (momentum)   breakdown.push('+15 momentum confirmed')
  if (symmetry)   breakdown.push('+20 pattern symmetry')
  if (volConfirm) breakdown.push('+15 volume confirmed')
  if (breakout)   breakdown.push('+20 breakout confirmed')
  if (penalties)  breakdown.push('-15 low volatility regime')
  return { total, trendAlign, momentum, symmetry, volConfirm, breakout, penalties, breakdown }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shape helpers — use candles[i].time directly (no offset arithmetic)
// ─────────────────────────────────────────────────────────────────────────────

function pt(candles: Candle[], idx: number, value: number): ChartPoint {
  return { time: candles[idx].time, value }
}

// ─────────────────────────────────────────────────────────────────────────────
// HEAD & SHOULDERS
// ─────────────────────────────────────────────────────────────────────────────

export function detectHeadAndShoulders(
  candles: Candle[], tf: string, atr14: number, trend: TrendState | null,
  momentum: MomentumState | null, regime: VolatilityRegime, asset: string
): DetectedPattern | null {
  if (candles.length < 40) return null
  const priceTol = atr14 * 0.25
  const breakTol = atr14 * 0.1
  const highs    = findSwingHighs(candles, atr14)
  if (highs.length < 3) return null

  // Try all triplets of swing highs, most recent first
  for (let i = highs.length - 3; i >= Math.max(0, highs.length - 10); i--) {
    const ls = highs[i], hd = highs[i + 1], rs = highs[i + 2]
    if (!ls || !hd || !rs) continue
    if (hd.idx - ls.idx < 5 || rs.idx - hd.idx < 5) continue
    if (!(hd.price > ls.price && hd.price > rs.price)) continue
    if (Math.abs(ls.price - rs.price) > priceTol) continue

    // Neckline = average of valley lows
    const nkL = Math.min(...candles.slice(ls.idx, hd.idx + 1).map(c => c.low))
    const nkR = Math.min(...candles.slice(hd.idx, rs.idx + 1).map(c => c.low))
    if (Math.abs(nkL - nkR) > atr14) continue
    const neckline = (nkL + nkR) / 2

    const confirmed = candles[candles.length - 1].close < neckline - breakTol
    if (momentum?.isOversold) continue

    const score = buildScore({
      trendAlign:  trend?.direction === 'up',
      momentum:    momentum?.bearish ?? false,
      symmetry:    Math.abs(ls.price - rs.price) < priceTol * 0.5,
      volConfirm:  false, breakout: confirmed,
      lowVolNoise: regime === 'low',
      details:     ['H&S: head dominant, shoulders symmetric'],
    })
    if (score.total < 35) continue

    // Find valley indices for neckline shape
    let nkLIdx = ls.idx, nkRIdx = hd.idx
    for (let j = ls.idx; j <= hd.idx; j++) if (candles[j].low === nkL) nkLIdx = j
    for (let j = hd.idx; j <= rs.idx; j++) if (candles[j].low === nkR) nkRIdx = j

    const shapes: PatternShape[] = [
      // Outline: LS peak → valley → Head peak → valley → RS peak
      {
        id: 'outline', style: 'solid', width: 2, label: 'H&S',
        points: [
          pt(candles, ls.idx,  ls.price),
          pt(candles, nkLIdx,  nkL),
          pt(candles, hd.idx,  hd.price),
          pt(candles, nkRIdx,  nkR),
          pt(candles, rs.idx,  rs.price),
        ],
      },
      // Neckline extended to current candle
      {
        id: 'neckline', style: 'dashed', width: 1, label: 'Neckline',
        points: [
          pt(candles, nkLIdx,           neckline),
          pt(candles, candles.length - 1, neckline),
        ],
      },
    ]

    return {
      asset, pattern: 'Head & Shoulders', probability: Math.min(40 + score.total, 94),
      direction: 'bearish', timeframe: tf, detectedAt: candles[rs.idx].time,
      startIdx: ls.idx, endIdx: rs.idx,
      keyLevels: [
        { label: 'Left Shoulder',  price: ls.price },
        { label: 'Head',           price: hd.price },
        { label: 'Right Shoulder', price: rs.price },
        { label: 'Neckline',       price: neckline  },
      ],
      shapes, score, regime, confirmed,
    }
  }

  // ── Inverse H&S ──
  const lows = findSwingLows(candles, atr14)
  if (lows.length < 3) return null

  for (let i = lows.length - 3; i >= Math.max(0, lows.length - 10); i--) {
    const ls = lows[i], hd = lows[i + 1], rs = lows[i + 2]
    if (!ls || !hd || !rs) continue
    if (hd.idx - ls.idx < 5 || rs.idx - hd.idx < 5) continue
    if (!(hd.price < ls.price && hd.price < rs.price)) continue
    if (Math.abs(ls.price - rs.price) > priceTol) continue

    const nkL = Math.max(...candles.slice(ls.idx, hd.idx + 1).map(c => c.high))
    const nkR = Math.max(...candles.slice(hd.idx, rs.idx + 1).map(c => c.high))
    if (Math.abs(nkL - nkR) > atr14) continue
    const neckline = (nkL + nkR) / 2

    const confirmed = candles[candles.length - 1].close > neckline + breakTol
    if (momentum?.isOverbought) continue

    const score = buildScore({
      trendAlign:  trend?.direction === 'down',
      momentum:    momentum?.bullish ?? false,
      symmetry:    Math.abs(ls.price - rs.price) < priceTol * 0.5,
      volConfirm:  false, breakout: confirmed,
      lowVolNoise: regime === 'low',
      details:     ['Inv. H&S: head dominant, shoulders symmetric'],
    })
    if (score.total < 35) continue

    let nkLIdx = ls.idx, nkRIdx = hd.idx
    for (let j = ls.idx; j <= hd.idx; j++) if (candles[j].high === nkL) nkLIdx = j
    for (let j = hd.idx; j <= rs.idx; j++) if (candles[j].high === nkR) nkRIdx = j

    const shapes: PatternShape[] = [
      {
        id: 'outline', style: 'solid', width: 2, label: 'Inv H&S',
        points: [
          pt(candles, ls.idx,  ls.price),
          pt(candles, nkLIdx,  nkL),
          pt(candles, hd.idx,  hd.price),
          pt(candles, nkRIdx,  nkR),
          pt(candles, rs.idx,  rs.price),
        ],
      },
      {
        id: 'neckline', style: 'dashed', width: 1, label: 'Neckline',
        points: [
          pt(candles, nkLIdx,             neckline),
          pt(candles, candles.length - 1, neckline),
        ],
      },
    ]

    return {
      asset, pattern: 'Inverse H&S', probability: Math.min(40 + score.total, 92),
      direction: 'bullish', timeframe: tf, detectedAt: candles[rs.idx].time,
      startIdx: ls.idx, endIdx: rs.idx,
      keyLevels: [
        { label: 'Left Shoulder',  price: ls.price },
        { label: 'Head',           price: hd.price },
        { label: 'Right Shoulder', price: rs.price },
        { label: 'Neckline',       price: neckline  },
      ],
      shapes, score, regime, confirmed,
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// DOUBLE TOP / DOUBLE BOTTOM
// ─────────────────────────────────────────────────────────────────────────────

export function detectDoubleTop(
  candles: Candle[], tf: string, atr14: number, trend: TrendState | null,
  momentum: MomentumState | null, regime: VolatilityRegime, asset: string
): DetectedPattern | null {
  const priceTol = atr14 * 0.25, breakTol = atr14 * 0.1
  const highs = findSwingHighs(candles, atr14)
  if (highs.length < 2) return null

  for (let i = highs.length - 2; i >= Math.max(0, highs.length - 8); i--) {
    const h1 = highs[i], h2 = highs[i + 1]
    if (!h1 || !h2) continue
    const span = h2.idx - h1.idx
    if (span < 10 || span > 60) continue
    if (Math.abs(h1.price - h2.price) > priceTol) continue

    const mid = candles.slice(h1.idx, h2.idx + 1)
    const neckline = Math.min(...mid.map(c => c.low))
    if (h1.price - neckline < atr14 * 1.5) continue

    let neckIdx = h1.idx
    for (let j = h1.idx; j <= h2.idx; j++) if (candles[j].low === neckline) { neckIdx = j; break }

    const confirmed = candles[candles.length - 1].close < neckline - breakTol
    if (momentum?.isOversold) continue

    const score = buildScore({
      trendAlign: trend?.direction === 'up', momentum: momentum?.bearish ?? false,
      symmetry:   Math.abs(h1.price - h2.price) < priceTol * 0.5,
      volConfirm: false, breakout: confirmed, lowVolNoise: regime === 'low',
      details:    ['Double Top: two equal highs, neckline break'],
    })
    if (score.total < 35) continue

    const shapes: PatternShape[] = [
      // M shape: h1 → valley → h2
      {
        id: 'outline', style: 'solid', width: 2, label: 'Double Top',
        points: [
          pt(candles, h1.idx,   h1.price),
          pt(candles, neckIdx,  neckline),
          pt(candles, h2.idx,   h2.price),
        ],
      },
      // Neckline horizontal
      {
        id: 'neckline', style: 'dashed', width: 1, label: 'Neckline',
        points: [
          pt(candles, h1.idx,             neckline),
          pt(candles, candles.length - 1, neckline),
        ],
      },
    ]

    return {
      asset, pattern: 'Double Top', probability: Math.min(40 + score.total, 91),
      direction: 'bearish', timeframe: tf, detectedAt: candles[h2.idx].time,
      startIdx: h1.idx, endIdx: h2.idx,
      keyLevels: [
        { label: 'Top 1',    price: h1.price },
        { label: 'Top 2',    price: h2.price },
        { label: 'Neckline', price: neckline  },
      ],
      shapes, score, regime, confirmed,
    }
  }
  return null
}

export function detectDoubleBottom(
  candles: Candle[], tf: string, atr14: number, trend: TrendState | null,
  momentum: MomentumState | null, regime: VolatilityRegime, asset: string
): DetectedPattern | null {
  const priceTol = atr14 * 0.25, breakTol = atr14 * 0.1
  const lows = findSwingLows(candles, atr14)
  if (lows.length < 2) return null

  for (let i = lows.length - 2; i >= Math.max(0, lows.length - 8); i--) {
    const l1 = lows[i], l2 = lows[i + 1]
    if (!l1 || !l2) continue
    const span = l2.idx - l1.idx
    if (span < 10 || span > 60) continue
    if (Math.abs(l1.price - l2.price) > priceTol) continue

    const mid = candles.slice(l1.idx, l2.idx + 1)
    const neckline = Math.max(...mid.map(c => c.high))
    if (neckline - l1.price < atr14 * 1.5) continue

    let neckIdx = l1.idx
    for (let j = l1.idx; j <= l2.idx; j++) if (candles[j].high === neckline) { neckIdx = j; break }

    const confirmed = candles[candles.length - 1].close > neckline + breakTol
    if (momentum?.isOverbought) continue

    const score = buildScore({
      trendAlign: trend?.direction === 'down', momentum: momentum?.bullish ?? false,
      symmetry:   Math.abs(l1.price - l2.price) < priceTol * 0.5,
      volConfirm: false, breakout: confirmed, lowVolNoise: regime === 'low',
      details:    ['Double Bottom: two equal lows, neckline break'],
    })
    if (score.total < 35) continue

    const shapes: PatternShape[] = [
      {
        id: 'outline', style: 'solid', width: 2, label: 'Double Bottom',
        points: [
          pt(candles, l1.idx,  l1.price),
          pt(candles, neckIdx, neckline),
          pt(candles, l2.idx,  l2.price),
        ],
      },
      {
        id: 'neckline', style: 'dashed', width: 1, label: 'Neckline',
        points: [
          pt(candles, l1.idx,             neckline),
          pt(candles, candles.length - 1, neckline),
        ],
      },
    ]

    return {
      asset, pattern: 'Double Bottom', probability: Math.min(40 + score.total, 91),
      direction: 'bullish', timeframe: tf, detectedAt: candles[l2.idx].time,
      startIdx: l1.idx, endIdx: l2.idx,
      keyLevels: [
        { label: 'Bottom 1', price: l1.price },
        { label: 'Bottom 2', price: l2.price },
        { label: 'Neckline', price: neckline  },
      ],
      shapes, score, regime, confirmed,
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// BULL / BEAR FLAG  (Autochartist-style strict rules)
//
// BULL FLAG requirements:
//   1. Pole: strong impulsive move UP, >= 4x ATR, in <= 20 candles
//   2. Flag: a tight PARALLEL DESCENDING channel (both upper & lower trendlines
//      slope downward). The channel must NOT slope upward.
//   3. Retracement of the flag <= 50% of the pole
//   4. Channel width <= 35% of the pole height (tight consolidation)
//   5. Flag swing highs must each be LOWER than the previous (descending)
//   6. Flag swing lows  must each be LOWER than the previous (descending)
//   7. Upper & lower trendline slopes must be within 30% of each other (parallel)
//
// BEAR FLAG: mirror of above — descending pole, ascending parallel channel.
// ─────────────────────────────────────────────────────────────────────────────

export function detectFlags(
  candles: Candle[], tf: string, atr14: number, trend: TrendState | null,
  momentum: MomentumState | null, regime: VolatilityRegime, asset: string
): DetectedPattern | null {
  if (candles.length < 40) return null

  const winStart = Math.max(0, candles.length - 120)

  for (let ps = winStart; ps < candles.length - 25; ps++) {

    // ── 1. Find a valid pole (5–20 candles, impulse >= 4x ATR) ──────────────
    for (let poleLen = 5; poleLen <= 20; poleLen++) {
      const pe = ps + poleLen
      if (pe >= candles.length - 10) continue

      // Pole defined as: low of ps candle → high of pe candle (bull)
      //                  high of ps candle → low of pe candle (bear)
      const poleBottom = Math.min(...candles.slice(ps, pe + 1).map(c => c.low))
      const poleTop    = Math.max(...candles.slice(ps, pe + 1).map(c => c.high))
      const poleHeight = poleTop - poleBottom

      if (poleHeight < atr14 * 4) continue

      // Determine direction by net close move
      const netMove = candles[pe].close - candles[ps].open
      const isBull  = netMove > atr14 * 3     // bull: clear upward net move
      const isBear  = netMove < -atr14 * 3    // bear: clear downward net move
      if (!isBull && !isBear) continue

      // The pole must be mostly impulsive — at least 60% of candles in pole
      // direction (bull: close > open; bear: close < open)
      const poleCandles  = candles.slice(ps, pe + 1)
      const dirCount     = isBull
        ? poleCandles.filter(c => c.close > c.open).length
        : poleCandles.filter(c => c.close < c.open).length
      if (dirCount < poleLen * 0.6) continue

      // ── 2. Find the flag consolidation (5–20 candles after pole) ──────────
      for (let flagLen = 5; flagLen <= 20 && pe + flagLen < candles.length; flagLen++) {
        const flagStart = pe          // flag starts right after pole ends
        const flagEnd   = pe + flagLen - 1
        const flagSlice = candles.slice(flagStart, flagEnd + 1)

        if (flagSlice.length < 5) continue

        // Collect flag swing highs and lows (simple: candle highs & lows)
        const flagHighs = flagSlice.map(c => c.high)
        const flagLows  = flagSlice.map(c => c.low)
        const flagH     = Math.max(...flagHighs)
        const flagL     = Math.min(...flagLows)

        // Channel width must be tight: <= 35% of pole height
        const channelWidth = flagH - flagL
        if (channelWidth > poleHeight * 0.35) continue

        // Retracement <= 50% of pole
        const retracement = isBull
          ? poleTop - flagL       // how far price pulled back from pole top
          : flagH - poleBottom    // how far price pulled back from pole bottom
        if (retracement > poleHeight * 0.5) continue

        // ── 3. Enforce DESCENDING channel for bull flag ───────────────────
        // Fit linear regression to flag highs and lows separately
        const n = flagSlice.length
        const xs = Array.from({ length: n }, (_, i) => i)

        function linReg(ys: number[]): { slope: number; intercept: number } {
          const xMean = (n - 1) / 2
          const yMean = ys.reduce((a, b) => a + b, 0) / n
          let num = 0, den = 0
          for (let i = 0; i < n; i++) {
            num += (xs[i] - xMean) * (ys[i] - yMean)
            den += (xs[i] - xMean) ** 2
          }
          const slope = den === 0 ? 0 : num / den
          return { slope, intercept: yMean - slope * xMean }
        }

        const upperReg = linReg(flagHighs)
        const lowerReg = linReg(flagLows)

        // For BULL flag: both slopes MUST be negative (descending channel)
        // For BEAR flag: both slopes MUST be positive (ascending channel)
        if (isBull) {
          if (upperReg.slope >= 0) continue   // upper trendline not descending
          if (lowerReg.slope >= 0) continue   // lower trendline not descending
        } else {
          if (upperReg.slope <= 0) continue   // upper trendline not ascending
          if (lowerReg.slope <= 0) continue   // lower trendline not ascending
        }

        // ── 4. Enforce PARALLEL channel ──────────────────────────────────
        // Slopes must be within 30% of each other in magnitude
        const slopeRatio = Math.abs(upperReg.slope) > 0
          ? Math.abs(lowerReg.slope) / Math.abs(upperReg.slope)
          : 1
        if (slopeRatio < 0.5 || slopeRatio > 2.0) continue  // not parallel enough

        // ── 5. At least 2 descending swing highs AND 2 descending swing lows
        // (ensures there is an actual channel, not a single-bar dip)
        let descHighs = 0, descLows = 0
        for (let j = 1; j < flagSlice.length; j++) {
          if (isBull) {
            if (flagSlice[j].high < flagSlice[j - 1].high) descHighs++
            if (flagSlice[j].low  < flagSlice[j - 1].low)  descLows++
          } else {
            if (flagSlice[j].high > flagSlice[j - 1].high) descHighs++
            if (flagSlice[j].low  > flagSlice[j - 1].low)  descLows++
          }
        }
        if (descHighs < 2 || descLows < 2) continue

        // ── 6. Breakout confirmation ──────────────────────────────────────
        const nextIdx   = pe + flagLen
        const lastFlagIdx = flagEnd
        const breakoutCandle = nextIdx < candles.length ? candles[nextIdx] : null

        // Project upper/lower trendline to the last flag candle
        const upperAtEnd = upperReg.intercept + upperReg.slope * (n - 1)
        const lowerAtEnd = lowerReg.intercept + lowerReg.slope * (n - 1)

        const confirmed = breakoutCandle
          ? isBull
            ? breakoutCandle.close > upperAtEnd && Math.abs(breakoutCandle.close - breakoutCandle.open) >= atr14 * 0.5
            : breakoutCandle.close < lowerAtEnd && Math.abs(breakoutCandle.close - breakoutCandle.open) >= atr14 * 0.5
          : false

        if (isBull  && momentum?.isOverbought) continue
        if (!isBull && momentum?.isOversold)   continue

        const score = buildScore({
          trendAlign:  isBull ? trend?.direction === 'up' : trend?.direction === 'down',
          momentum:    isBull ? (momentum?.bullish ?? false) : (momentum?.bearish ?? false),
          symmetry:    slopeRatio > 0.7 && slopeRatio < 1.4,  // tight parallel
          volConfirm:  false,
          breakout:    confirmed,
          lowVolNoise: regime === 'low',
          details: [
            `${isBull ? 'Bull' : 'Bear'} Flag: pole=${poleHeight.toFixed(5)}, ` +
            `retrace=${(retracement / poleHeight * 100).toFixed(0)}%, ` +
            `channel=${channelWidth.toFixed(5)}, parallelRatio=${slopeRatio.toFixed(2)}`,
          ],
        })
        if (score.total < 35) continue

        // ── Build shapes ──────────────────────────────────────────────────
        // Pole: single line from pole bottom to pole top (bull) or top to bottom (bear)
        const poleStartTime = candles[ps].time
        const poleEndTime   = candles[pe].time

        // Flag channel: use regression lines projected from flagStart to flagEnd
        const upperFlagPoints: ChartPoint[] = flagSlice.map((c, i) => ({
          time:  c.time,
          value: upperReg.intercept + upperReg.slope * i,
        }))
        const lowerFlagPoints: ChartPoint[] = flagSlice.map((c, i) => ({
          time:  c.time,
          value: lowerReg.intercept + lowerReg.slope * i,
        }))

        const shapes: PatternShape[] = [
          // Pole — single diagonal line (bottom→top for bull, top→bottom for bear)
          {
            id: 'pole', style: 'solid', width: 2,
            label: isBull ? 'Bull Flag' : 'Bear Flag',
            points: [
              { time: poleStartTime, value: isBull ? poleBottom : poleTop },
              { time: poleEndTime,   value: isBull ? poleTop    : poleBottom },
            ],
          },
          // Upper flag channel trendline (regression line through flag highs)
          {
            id: 'flag_upper', style: 'solid', width: 1,
            label: 'Flag High',
            points: upperFlagPoints,
          },
          // Lower flag channel trendline (regression line through flag lows)
          {
            id: 'flag_lower', style: 'solid', width: 1,
            label: 'Flag Low',
            points: lowerFlagPoints,
          },
          // Breakout target line (horizontal at pole top/bottom, from flag start)
          {
            id: 'breakout', style: 'dashed', width: 1,
            label: 'Breakout',
            points: [
              { time: candles[flagStart].time,   value: isBull ? poleTop    : poleBottom },
              { time: candles[lastFlagIdx].time, value: isBull ? poleTop    : poleBottom },
            ],
          },
        ]

        return {
          asset,
          pattern:     isBull ? 'Bull Flag' : 'Bear Flag',
          probability: Math.min(40 + score.total, 88),
          direction:   isBull ? 'bullish' : 'bearish',
          timeframe: tf,
          detectedAt: candles[lastFlagIdx].time,
          startIdx:   ps,
          endIdx:     lastFlagIdx,
          keyLevels: [
            { label: 'Pole Bottom',  price: poleBottom },
            { label: 'Pole Top',     price: poleTop    },
            { label: 'Flag High',    price: flagH       },
            { label: 'Flag Low',     price: flagL       },
            { label: 'Breakout Tgt', price: isBull ? poleTop : poleBottom },
          ],
          shapes, score, regime, confirmed,
        }
      }
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// TRIANGLES
// ─────────────────────────────────────────────────────────────────────────────

export function detectTriangles(
  candles: Candle[], tf: string, atr14: number, trend: TrendState | null,
  momentum: MomentumState | null, regime: VolatilityRegime, asset: string
): DetectedPattern | null {
  if (candles.length < 40) return null
  const levelTol = atr14 * 0.2
  const breakTol = atr14 * 0.1
  const highs    = findSwingHighs(candles, atr14)
  const lows     = findSwingLows(candles, atr14)
  if (highs.length < 3 || lows.length < 2) return null

  const rh = highs.slice(-3)   // last 3 swing highs  [oldest … newest]
  const rl = lows.slice(-3)    // last 2-3 swing lows
  if (rh.length < 3 || rl.length < 2) return null

  const [h1, h2, h3] = rh
  const l1 = rl[rl.length - 2], l2 = rl[rl.length - 1]

  const startIdx = Math.min(h1.idx, l1.idx)
  const endIdx   = Math.max(h3.idx, l2.idx)
  const latest   = candles[candles.length - 1].close

  // ── Ascending Triangle ─────────────────────────────────────────────────────
  const flatRes = Math.abs(h1.price - h2.price) <= levelTol && Math.abs(h2.price - h3.price) <= levelTol
  const risingLows = l2.price > l1.price
  if (flatRes && risingLows) {
    const resistance = (h1.price + h2.price + h3.price) / 3
    const confirmed  = latest > resistance + breakTol
    const score = buildScore({
      trendAlign: trend?.direction === 'up', momentum: momentum?.bullish ?? false,
      symmetry: true, volConfirm: false, breakout: confirmed, lowVolNoise: regime === 'low',
      details: ['Ascending Triangle: flat resistance x3, rising lows'],
    })
    if (score.total >= 35) {
      const shapes: PatternShape[] = [
        // Flat resistance line: h1 → h2 → h3 → current
        {
          id: 'resistance', style: 'solid', width: 2, label: 'Resistance',
          points: [
            pt(candles, h1.idx, h1.price),
            pt(candles, h2.idx, h2.price),
            pt(candles, h3.idx, h3.price),
            pt(candles, candles.length - 1, resistance),
          ],
        },
        // Rising support line: l1 → l2 → projected
        {
          id: 'support', style: 'solid', width: 2, label: 'Support',
          points: [
            pt(candles, l1.idx, l1.price),
            pt(candles, l2.idx, l2.price),
            pt(candles, h3.idx, l2.price + (l2.price - l1.price) * ((h3.idx - l2.idx) / Math.max(1, l2.idx - l1.idx))),
          ],
        },
        // Breakout level
        { id: 'breakout', style: 'dashed', width: 1, label: 'Breakout',
          points: [pt(candles, h3.idx, resistance), pt(candles, candles.length - 1, resistance)] },
      ]
      return {
        asset, pattern: 'Ascending Triangle', probability: Math.min(40 + score.total, 86),
        direction: 'bullish', timeframe: tf, detectedAt: candles[endIdx].time,
        startIdx, endIdx,
        keyLevels: [
          { label: 'Resistance', price: resistance },
          { label: 'Support 1',  price: l1.price   },
          { label: 'Support 2',  price: l2.price   },
        ],
        shapes, score, regime, confirmed,
      }
    }
  }

  // ── Descending Triangle ────────────────────────────────────────────────────
  const flatSup      = Math.abs(l1.price - l2.price) <= levelTol
  const fallingHighs = h1.price > h2.price && h2.price > h3.price
  if (flatSup && fallingHighs) {
    const support   = (l1.price + l2.price) / 2
    const confirmed = latest < support - breakTol
    const score = buildScore({
      trendAlign: trend?.direction === 'down', momentum: momentum?.bearish ?? false,
      symmetry: true, volConfirm: false, breakout: confirmed, lowVolNoise: regime === 'low',
      details: ['Descending Triangle: flat support, falling highs'],
    })
    if (score.total >= 35) {
      const shapes: PatternShape[] = [
        // Falling resistance: h1 → h2 → h3 → projected
        {
          id: 'resistance', style: 'solid', width: 2, label: 'Resistance',
          points: [
            pt(candles, h1.idx, h1.price),
            pt(candles, h2.idx, h2.price),
            pt(candles, h3.idx, h3.price),
          ],
        },
        // Flat support
        {
          id: 'support', style: 'solid', width: 2, label: 'Support',
          points: [
            pt(candles, l1.idx,             support),
            pt(candles, candles.length - 1, support),
          ],
        },
        { id: 'breakdown', style: 'dashed', width: 1, label: 'Breakdown',
          points: [pt(candles, l2.idx, support), pt(candles, candles.length - 1, support)] },
      ]
      return {
        asset, pattern: 'Descending Triangle', probability: Math.min(40 + score.total, 85),
        direction: 'bearish', timeframe: tf, detectedAt: candles[endIdx].time,
        startIdx, endIdx,
        keyLevels: [
          { label: 'Support',     price: support  },
          { label: 'Resistance 1',price: h1.price },
          { label: 'Resistance 2',price: h3.price },
        ],
        shapes, score, regime, confirmed,
      }
    }
  }

  // ── Symmetrical Triangle ───────────────────────────────────────────────────
  const descHighs  = h1.price > h2.price && h2.price > h3.price
  const ascLows    = l2.price > l1.price
  if (descHighs && ascLows) {
    const apex      = (h3.price + l2.price) / 2
    const confirmed = Math.abs(latest - apex) > breakTol
    const dir: Direction = trend?.direction === 'up' ? 'bullish'
      : trend?.direction === 'down' ? 'bearish' : 'neutral'
    const score = buildScore({
      trendAlign: trend?.direction !== 'sideways',
      momentum:   (dir === 'bullish' ? momentum?.bullish : momentum?.bearish) ?? false,
      symmetry:   true, volConfirm: false, breakout: confirmed, lowVolNoise: regime === 'low',
      details:    ['Symmetrical Triangle: descending highs + ascending lows'],
    })
    if (score.total >= 35) {
      const shapes: PatternShape[] = [
        // Upper trendline: h1 → h2 → h3
        {
          id: 'upper', style: 'solid', width: 2, label: 'Upper',
          points: [
            pt(candles, h1.idx, h1.price),
            pt(candles, h2.idx, h2.price),
            pt(candles, h3.idx, h3.price),
          ],
        },
        // Lower trendline: l1 → l2
        {
          id: 'lower', style: 'solid', width: 2, label: 'Lower',
          points: [
            pt(candles, l1.idx, l1.price),
            pt(candles, l2.idx, l2.price),
          ],
        },
        // Apex dotted
        { id: 'apex', style: 'dotted', width: 1, label: 'Apex',
          points: [pt(candles, h3.idx, apex), pt(candles, candles.length - 1, apex)] },
      ]
      return {
        asset, pattern: 'Symmetrical Triangle', probability: Math.min(40 + score.total, 82),
        direction: dir, timeframe: tf, detectedAt: candles[endIdx].time,
        startIdx, endIdx,
        keyLevels: [
          { label: 'Upper Trend', price: h3.price },
          { label: 'Lower Trend', price: l2.price },
          { label: 'Apex',        price: apex      },
        ],
        shapes, score, regime, confirmed,
      }
    }
  }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// LIQUIDITY SWEEP
// ─────────────────────────────────────────────────────────────────────────────

export function detectLiquiditySweep(
  candles: Candle[], tf: string, atr14: number,
  momentum: MomentumState | null, regime: VolatilityRegime, asset: string
): DetectedPattern | null {
  if (candles.length < 20) return null
  const highs = findSwingHighs(candles, atr14)
  const lows  = findSwingLows(candles, atr14)
  const last  = candles[candles.length - 1]

  if (highs.length >= 2) {
    const prev     = highs[highs.length - 2]
    const upWick   = last.high - Math.max(last.open, last.close)
    const body     = Math.abs(last.close - last.open)
    if (last.high > prev.price && last.close < prev.price && upWick >= body * 1.5) {
      const score = buildScore({
        trendAlign: false, momentum: momentum?.bearish ?? false,
        symmetry: true, volConfirm: false, breakout: true, lowVolNoise: regime === 'low',
        details: ['Buy-side sweep: wick above swing high, closed below'],
      })
      if (score.total >= 35) {
        const shapes: PatternShape[] = [
          { id: 'swept_level', style: 'dashed', width: 1, label: 'Swept',
            points: [pt(candles, prev.idx, prev.price), pt(candles, candles.length - 1, prev.price)] },
          { id: 'sweep_wick', style: 'solid', width: 2, label: 'Sweep',
            points: [pt(candles, candles.length - 1, prev.price), pt(candles, candles.length - 1, last.high)] },
        ]
        return {
          asset, pattern: 'Buy-Side Sweep', probability: Math.min(40 + score.total, 82),
          direction: 'bearish', timeframe: tf, detectedAt: last.time,
          startIdx: prev.idx, endIdx: candles.length - 1,
          keyLevels: [
            { label: 'Swept Level', price: prev.price },
            { label: 'Sweep High',  price: last.high  },
          ],
          shapes, score, regime, confirmed: true,
        }
      }
    }
  }

  if (lows.length >= 2) {
    const prev    = lows[lows.length - 2]
    const dnWick  = Math.min(last.open, last.close) - last.low
    const body    = Math.abs(last.close - last.open)
    if (last.low < prev.price && last.close > prev.price && dnWick >= body * 1.5) {
      const score = buildScore({
        trendAlign: false, momentum: momentum?.bullish ?? false,
        symmetry: true, volConfirm: false, breakout: true, lowVolNoise: regime === 'low',
        details: ['Sell-side sweep: wick below swing low, closed above'],
      })
      if (score.total >= 35) {
        const shapes: PatternShape[] = [
          { id: 'swept_level', style: 'dashed', width: 1, label: 'Swept',
            points: [pt(candles, prev.idx, prev.price), pt(candles, candles.length - 1, prev.price)] },
          { id: 'sweep_wick', style: 'solid', width: 2, label: 'Sweep',
            points: [pt(candles, candles.length - 1, prev.price), pt(candles, candles.length - 1, last.low)] },
        ]
        return {
          asset, pattern: 'Sell-Side Sweep', probability: Math.min(40 + score.total, 82),
          direction: 'bullish', timeframe: tf, detectedAt: last.time,
          startIdx: prev.idx, endIdx: candles.length - 1,
          keyLevels: [
            { label: 'Swept Level', price: prev.price },
            { label: 'Sweep Low',   price: last.low   },
          ],
          shapes, score, regime, confirmed: true,
        }
      }
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGULFING
// ─────────────────────────────────────────────────────────────────────────────

export function detectEngulfing(
  candles: Candle[], tf: string, atr14: number,
  trend: TrendState | null, momentum: MomentumState | null,
  regime: VolatilityRegime, asset: string
): DetectedPattern | null {
  if (candles.length < 5) return null
  const c = candles[candles.length - 1], cp = candles[candles.length - 2]
  const body = Math.abs(c.close - c.open), bodyP = Math.abs(cp.close - cp.open)
  if (body < atr14 * 0.3) return null

  if (c.close > c.open && c.open < cp.close && c.close > cp.open && body > bodyP) {
    if (momentum?.isOverbought) return null
    const score = buildScore({
      trendAlign: trend?.direction === 'down', momentum: momentum?.bullish ?? false,
      symmetry: body > bodyP * 1.2, volConfirm: false, breakout: true, lowVolNoise: regime === 'low',
      details: ['Bullish engulfing'],
    })
    if (score.total < 35) return null
    const shapes: PatternShape[] = [
      { id: 'box_top',    style: 'solid', width: 1, label: 'Engulf',
        points: [pt(candles, candles.length - 2, c.high), pt(candles, candles.length - 1, c.high)] },
      { id: 'box_bottom', style: 'solid', width: 1, label: '',
        points: [pt(candles, candles.length - 2, c.low), pt(candles, candles.length - 1, c.low)] },
    ]
    return {
      asset, pattern: 'Bullish Engulfing', probability: Math.min(40 + score.total, 80),
      direction: 'bullish', timeframe: tf, detectedAt: c.time,
      startIdx: candles.length - 2, endIdx: candles.length - 1,
      keyLevels: [{ label: 'Engulf High', price: c.high }, { label: 'Engulf Low', price: c.low }],
      shapes, score, regime, confirmed: true,
    }
  }

  if (c.close < c.open && c.open > cp.close && c.close < cp.open && body > bodyP) {
    if (momentum?.isOversold) return null
    const score = buildScore({
      trendAlign: trend?.direction === 'up', momentum: momentum?.bearish ?? false,
      symmetry: body > bodyP * 1.2, volConfirm: false, breakout: true, lowVolNoise: regime === 'low',
      details: ['Bearish engulfing'],
    })
    if (score.total < 35) return null
    const shapes: PatternShape[] = [
      { id: 'box_top',    style: 'solid', width: 1, label: 'Engulf',
        points: [pt(candles, candles.length - 2, c.high), pt(candles, candles.length - 1, c.high)] },
      { id: 'box_bottom', style: 'solid', width: 1, label: '',
        points: [pt(candles, candles.length - 2, c.low), pt(candles, candles.length - 1, c.low)] },
    ]
    return {
      asset, pattern: 'Bearish Engulfing', probability: Math.min(40 + score.total, 80),
      direction: 'bearish', timeframe: tf, detectedAt: c.time,
      startIdx: candles.length - 2, endIdx: candles.length - 1,
      keyLevels: [{ label: 'Engulf High', price: c.high }, { label: 'Engulf Low', price: c.low }],
      shapes, score, regime, confirmed: true,
    }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// DOJI
// ─────────────────────────────────────────────────────────────────────────────

export function detectDoji(
  candles: Candle[], tf: string, atr14: number,
  trend: TrendState | null, regime: VolatilityRegime, asset: string
): DetectedPattern | null {
  if (candles.length < 3) return null
  const c = candles[candles.length - 1]
  const body = Math.abs(c.close - c.open), range = c.high - c.low
  const uw = c.high - Math.max(c.open, c.close), lw = Math.min(c.open, c.close) - c.low
  if (range < atr14 * 0.2 || body > range * 0.1 || uw < body || lw < body) return null

  const dir: Direction = trend?.direction === 'up' ? 'bearish'
    : trend?.direction === 'down' ? 'bullish' : 'neutral'

  const score = buildScore({
    trendAlign: trend?.direction !== 'sideways', momentum: false,
    symmetry: Math.abs(uw - lw) < atr14 * 0.3, volConfirm: false, breakout: false,
    lowVolNoise: regime === 'low', details: ['Doji candle'],
  })
  if (score.total < 20) return null

  const i = candles.length - 1
  const shapes: PatternShape[] = [
    { id: 'cross', style: 'solid', width: 2, label: 'Doji',
      points: [pt(candles, i, c.high), pt(candles, i, c.low)] },
  ]

  return {
    asset, pattern: 'Doji', probability: Math.min(30 + score.total, 72),
    direction: dir, timeframe: tf, detectedAt: c.time,
    startIdx: i, endIdx: i,
    keyLevels: [{ label: 'High', price: c.high }, { label: 'Low', price: c.low }],
    shapes, score, regime, confirmed: false,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RUNNER — cap at last 120 candles for detection
// ─────────────────────────────────────────────────────────────────────────────

export function runPatternEngine(
  allCandles: Candle[], tf: string, asset: string
): DetectedPattern[] {
  if (allCandles.length < 30) return []

  // Use full array for indicators (ATR, EMA, RSI need history)
  // but swing detection is capped internally to last 120
  const { atr14, atr50 } = calcDualATR(allCandles)
  const regime   = classifyRegime(atr14, atr50)
  const trend    = detectTrend(allCandles, atr14)
  const momentum = getMomentum(allCandles)

  // Strip invalid candles (keep original indices intact by filtering in place)
  const candles = allCandles.filter((c, i) =>
    i === 0 || isValidCandle(c, allCandles[i - 1], atr14)
  )
  if (candles.length < 30) return []

  const results: DetectedPattern[] = []
  const push = (p: DetectedPattern | null) => { if (p) results.push(p) }

  push(detectHeadAndShoulders(candles, tf, atr14, trend, momentum, regime, asset))
  push(detectDoubleTop(candles, tf, atr14, trend, momentum, regime, asset))
  push(detectDoubleBottom(candles, tf, atr14, trend, momentum, regime, asset))
  push(detectFlags(candles, tf, atr14, trend, momentum, regime, asset))
  push(detectTriangles(candles, tf, atr14, trend, momentum, regime, asset))
  push(detectLiquiditySweep(candles, tf, atr14, momentum, regime, asset))
  push(detectEngulfing(candles, tf, atr14, trend, momentum, regime, asset))
  push(detectDoji(candles, tf, atr14, trend, regime, asset))

  const seen = new Set<string>()
  return results
    .sort((a, b) => b.score.total - a.score.total)
    .filter(p => { if (seen.has(p.pattern)) return false; seen.add(p.pattern); return true })
}