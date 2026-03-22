import { NextRequest, NextResponse } from "next/server";

// ── Infoway symbol map for commodities ───────────────────────────────────────
// Infoway supports metals directly via their spot codes
const SYMBOL_MAP: Record<string, string> = {
  "Soybeans":               "SOYBN",      // mapped to closest available
  "Corn":                   "CORN",
  "Wheat":                  "WHEAT",
  "Copper":                 "XCUUSD",     // Copper CFD USD/lb — direct Infoway code
  "Crude Oil":              "USOIL",
  "Natural Gas":            "NATGAS",
  "Rare Earth Metals":      "XAUUSD",     // proxy: gold
  "Palm Oil":               "SOYBN",      // proxy
  "Soybeans (SOXX)":        "SOYBN",
  // Metals — all direct Infoway codes from the product list
  "Gold":                   "XAUUSD",
  "Silver":                 "XAGUSD",
  "Platinum":               "XPTUSD",
  "Palladium":              "XPDUSD",
  "Nickel":                 "XNIUSD",
  "Aluminum":               "XALUSD",
  "Lead":                   "XPBUSD",
  "Zinc":                   "ZINCSPOT",
  // Equities — use US stocks
  "Freeport-McMoRan":       "FCX.US",
  "ADM":                    "ADM.US",
  "XOM":                    "XOM.US",
  "HAL":                    "HAL.US",
  "Apple Inc.":             "AAPL.US",
  // Forex
  "BRL/USD":                "USDBRL",
  "CLP/USD":                "USDCLP",
  "AUD/USD":                "AUDUSD",
  "CNY/USD":                "USDCNH",
  "USD/MXN":                "USDMXN",
};

// Infoway interval codes
const INTERVAL_MAP: Record<string, string> = {
  "15min": "15",
  "1h":    "60",
  "4h":    "240",
  "1day":  "1440",
};

const INFOWAY_API_KEY = process.env.INFOWAY_API_KEY ?? "0148c11674d64460a97cdc32d421d20a";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const commodity  = searchParams.get("commodity")  ?? "Copper";
  const interval   = searchParams.get("interval")   ?? "15min";
  const outputsize = parseInt(searchParams.get("outputsize") ?? "10000");

  const symbol      = SYMBOL_MAP[commodity] ?? "XCUUSD";
  const intervalMin = INTERVAL_MAP[interval] ?? "15";

  try {
    // Infoway batch kline endpoint:
    // GET /stock/batch_kline/{interval}/{count}/{symbols}
    const url = `https://data.infoway.io/stock/batch_kline/${intervalMin}/${outputsize}/${encodeURIComponent(symbol)}`;

    const res = await fetch(url, {
      headers: {
        "apiKey":      INFOWAY_API_KEY,
        "User-Agent":  "Mozilla/5.0",
        "Accept":      "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`[commodity-chart] Infoway ${res.status} for ${symbol}`);
      return NextResponse.json(mockData(symbol, outputsize));
    }

    const json = await res.json();

    // Infoway response shape: { data: { [symbol]: [ {t, o, h, l, c, v} ] } }
    const raw: any[] = json?.data?.[symbol] ?? json?.data ?? [];

    if (!Array.isArray(raw) || raw.length === 0) {
      console.warn(`[commodity-chart] No data for ${symbol}, falling back to mock`);
      return NextResponse.json(mockData(symbol, outputsize));
    }

    const candles = raw.map((c: any) => ({
      // Infoway uses unix timestamp in seconds (field: t) or datetime string
      time:  c.t ?? c.time ?? c.datetime,
      open:  parseFloat(c.o ?? c.open),
      high:  parseFloat(c.h ?? c.high),
      low:   parseFloat(c.l ?? c.low),
      close: parseFloat(c.c ?? c.close),
    }));

    return NextResponse.json({ symbol, candles, mock: false });
  } catch (err) {
    console.error("[commodity-chart]", err);
    return NextResponse.json(mockData(symbol, outputsize));
  }
}

// ── Mock data fallback ────────────────────────────────────────────────────────
function mockData(symbol: string, count: number) {
  const now   = Date.now();
  const msGap = 15 * 60 * 1000; // 15min default

  const seeds: Record<string, number> = {
    XCUUSD: 4.25, XAUUSD: 2320, XAGUSD: 27.4, USOIL: 78.5,
    NATGAS: 2.8,  XPTUSD: 920,  XNIUSD: 16800, FCX: 42,
    AUDUSD: 0.652, USDCNH: 7.24,
  };
  let price = seeds[symbol] ?? 100;

  const candles = [];
  for (let i = count - 1; i >= 0; i--) {
    const t     = Math.floor((now - i * msGap) / 1000);
    const drift = (Math.random() - 0.48) * price * 0.003;
    const open  = price;
    const close = price + drift;
    const high  = Math.max(open, close) + Math.random() * price * 0.002;
    const low   = Math.min(open, close) - Math.random() * price * 0.002;
    candles.push({
      time:  t,
      open:  parseFloat(open.toFixed(4)),
      high:  parseFloat(high.toFixed(4)),
      low:   parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
    });
    price = close;
  }
  return { symbol, candles, mock: true };
}