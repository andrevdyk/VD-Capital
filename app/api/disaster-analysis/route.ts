import { NextRequest, NextResponse } from "next/server";

// Twelve Data symbol mapping for commodities/assets
const SYMBOL_MAP: Record<string, string> = {
  // Commodities
  "Soybeans":           "SOYBN",
  "Corn":               "CORN",
  "Wheat":              "WHEAT",
  "Copper":             "COPPER",
  "Crude Oil":          "WTI",
  "Natural Gas":        "NATGAS",
  "Lithium":            "LIT",       // ETF proxy
  "Nickel":             "NICKEL",
  "Rare Earth Metals":  "REMX",      // ETF proxy
  "Palm Oil":           "PALM",
  "Barley":             "WHEAT",     // proxy
  // Equities
  "Freeport-McMoRan":   "FCX",
  "ADM":                "ADM",
  "XOM":                "XOM",
  "HAL":                "HAL",
  "Apple Inc.":         "AAPL",
  // ETFs
  "Semiconductors (SOXX)": "SOXX",
  "Renewable Energy ETF":  "ICLN",
  // Forex
  "BRL/USD":            "USD/BRL",
  "CLP/USD":            "USD/CLP",
  "AUD/USD":            "AUD/USD",
  "CNY/USD":            "USD/CNY",
  "USD/MXN":            "USD/MXN",
};

const TWELVE_API_KEY = process.env.TWELVE_DATA_API_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const commodity = searchParams.get("commodity") ?? "Copper";
  const interval  = searchParams.get("interval")  ?? "15min";
  const outputsize = searchParams.get("outputsize") ?? "96"; // 24h of 15min candles

  const symbol = SYMBOL_MAP[commodity] ?? commodity;

  if (!TWELVE_API_KEY) {
    // Return mock data if no API key configured
    return NextResponse.json(mockData(symbol, interval, parseInt(outputsize)));
  }

  try {
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVE_API_KEY}`;
    const res  = await fetch(url, { next: { revalidate: 60 } });
    const json = await res.json();

    if (json.status === "error") {
      console.warn(`[commodity-chart] Twelve Data error for ${symbol}:`, json.message);
      // Fall back to mock data
      return NextResponse.json(mockData(symbol, interval, parseInt(outputsize)));
    }

    const candles = (json.values ?? [])
      .reverse()
      .map((v: any) => ({
        time:  v.datetime,
        open:  parseFloat(v.open),
        high:  parseFloat(v.high),
        low:   parseFloat(v.low),
        close: parseFloat(v.close),
      }));

    return NextResponse.json({ symbol, candles });
  } catch (err) {
    console.error("[commodity-chart]", err);
    return NextResponse.json(mockData(symbol, interval, parseInt(outputsize)));
  }
}

// ── Mock data generator (used when no API key or symbol unavailable) ─────────
function mockData(symbol: string, interval: string, count: number) {
  const intervalMs: Record<string, number> = {
    "1min": 60_000, "5min": 300_000, "15min": 900_000,
    "1h": 3_600_000, "4h": 14_400_000, "1day": 86_400_000,
  };
  const ms   = intervalMs[interval] ?? 900_000;
  const now  = Date.now();

  // Seed price based on symbol
  const seeds: Record<string, number> = {
    COPPER: 4.2, WTI: 78, NATGAS: 2.8, SOYBN: 12.4, CORN: 4.8,
    WHEAT: 5.6, FCX: 42, ADM: 58, XOM: 112, AAPL: 187, SOXX: 198,
    "USD/BRL": 4.95, "AUD/USD": 0.652, "USD/CNY": 7.24,
  };
  let price = seeds[symbol] ?? 100;

  const candles = [];
  for (let i = count - 1; i >= 0; i--) {
    const t     = new Date(now - i * ms);
    const drift = (Math.random() - 0.48) * price * 0.003;
    const open  = price;
    const close = price + drift;
    const high  = Math.max(open, close) + Math.random() * price * 0.002;
    const low   = Math.min(open, close) - Math.random() * price * 0.002;
    candles.push({
      time:  t.toISOString().replace("T", " ").slice(0, 19),
      open:  parseFloat(open.toFixed(4)),
      high:  parseFloat(high.toFixed(4)),
      low:   parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
    });
    price = close;
  }

  return { symbol, candles, mock: true };
}