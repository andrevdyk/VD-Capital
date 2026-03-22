import { Disaster, DisasterType, AlertLevel, IndirectAsset } from "../types/disaster";

// ── Commodity impact mapping ──────────────────────────────────────────────────
// Maps geographic regions + disaster types to commodity impacts

const REGION_COMMODITY_MAP: Record<string, { primary: string; symbol: string; pct: number; indirect: IndirectAsset[] }> = {
  // Earthquakes by region
  "chile":        { primary: "Copper",      symbol: "HG1!",  pct: 28, indirect: [{ asset: "Lithium", impact: "+5.8%", direction: "up", category: "commodity" }, { asset: "CLP/USD", impact: "-2.4%", direction: "down", category: "forex" }, { asset: "FCX", impact: "+4.7%", direction: "up", category: "equity" }] },
  "peru":         { primary: "Copper",      symbol: "HG1!",  pct: 12, indirect: [{ asset: "Silver",  impact: "+3.1%", direction: "up", category: "commodity" }, { asset: "PEN/USD", impact: "-1.8%", direction: "down", category: "forex" }] },
  "indonesia":    { primary: "Nickel",      symbol: "GC1!",  pct: 24, indirect: [{ asset: "Palm Oil", impact: "+2.8%", direction: "up", category: "commodity" }, { asset: "IDR/USD", impact: "-1.5%", direction: "down", category: "forex" }] },
  "japan":        { primary: "Electronics", symbol: "SOXX",  pct: 15, indirect: [{ asset: "JPY/USD", impact: "-1.2%", direction: "down", category: "forex" }, { asset: "Semiconductors", impact: "+3.4%", direction: "up", category: "index" }] },
  "turkey":       { primary: "Wheat",       symbol: "ZS1!",  pct: 8,  indirect: [{ asset: "EUR/USD", impact: "-0.9%", direction: "down", category: "forex" }, { asset: "Gold", impact: "+1.8%", direction: "up", category: "commodity" }] },
  "morocco":      { primary: "Phosphates",  symbol: "GC1!",  pct: 18, indirect: [{ asset: "Fertilizer", impact: "+4.2%", direction: "up", category: "commodity" }, { asset: "MAD/USD", impact: "-1.1%", direction: "down", category: "forex" }] },
  "new zealand":  { primary: "Dairy",       symbol: "GC1!",  pct: 6,  indirect: [{ asset: "AUD/USD", impact: "-0.7%", direction: "down", category: "forex" }, { asset: "NZD/USD", impact: "-1.3%", direction: "down", category: "forex" }] },
  "iran":         { primary: "Crude Oil",   symbol: "CL1!",  pct: 4,  indirect: [{ asset: "Natural Gas", impact: "+3.2%", direction: "up", category: "energy" }, { asset: "Gold", impact: "+2.1%", direction: "up", category: "commodity" }] },
  "california":   { primary: "Tech Supply", symbol: "NAS100",pct: 3,  indirect: [{ asset: "AAPL", impact: "-1.4%", direction: "down", category: "equity" }, { asset: "Natural Gas", impact: "+2.8%", direction: "up", category: "energy" }] },
  "alaska":       { primary: "Crude Oil",   symbol: "CL1!",  pct: 5,  indirect: [{ asset: "Natural Gas", impact: "+2.1%", direction: "up", category: "energy" }, { asset: "XOM", impact: "+1.8%", direction: "up", category: "equity" }] },
  // Wildfires by region
  "brazil":       { primary: "Soybeans",    symbol: "ZS1!",  pct: 22, indirect: [{ asset: "Corn", impact: "+4.2%", direction: "up", category: "commodity" }, { asset: "BRL/USD", impact: "-1.8%", direction: "down", category: "forex" }, { asset: "ADM", impact: "+3.1%", direction: "up", category: "equity" }] },
  "canada":       { primary: "Lumber",      symbol: "GC1!",  pct: 18, indirect: [{ asset: "Wheat", impact: "+2.9%", direction: "up", category: "commodity" }, { asset: "CAD/USD", impact: "-1.1%", direction: "down", category: "forex" }] },
  "australia":    { primary: "Wheat",       symbol: "ZS1!",  pct: 9,  indirect: [{ asset: "Barley", impact: "+3.2%", direction: "up", category: "commodity" }, { asset: "AUD/USD", impact: "-0.9%", direction: "down", category: "forex" }] },
  "russia":       { primary: "Wheat",       symbol: "ZS1!",  pct: 14, indirect: [{ asset: "Corn", impact: "+3.8%", direction: "up", category: "commodity" }, { asset: "Natural Gas", impact: "+2.4%", direction: "up", category: "energy" }] },
  "usa":          { primary: "Natural Gas",  symbol: "NG1!",  pct: 8,  indirect: [{ asset: "Lumber", impact: "+5.1%", direction: "up", category: "commodity" }, { asset: "XOM", impact: "+2.3%", direction: "up", category: "equity" }] },
  // Hurricanes
  "gulf":         { primary: "Crude Oil",   symbol: "CL1!",  pct: 18, indirect: [{ asset: "Natural Gas", impact: "+8.3%", direction: "up", category: "energy" }, { asset: "XOM", impact: "+2.9%", direction: "up", category: "equity" }, { asset: "HAL", impact: "+3.4%", direction: "up", category: "equity" }] },
  "caribbean":    { primary: "Sugar",       symbol: "GC1!",  pct: 7,  indirect: [{ asset: "Coffee", impact: "+2.1%", direction: "up", category: "commodity" }, { asset: "USD/BRL", impact: "+1.4%", direction: "up", category: "forex" }] },
  "florida":      { primary: "Orange Juice",symbol: "GC1!",  pct: 11, indirect: [{ asset: "Sugar", impact: "+1.8%", direction: "up", category: "commodity" }, { asset: "Insurance ETF", impact: "-4.2%", direction: "down", category: "index" }] },
  "philippines":  { primary: "Rice",        symbol: "GC1!",  pct: 8,  indirect: [{ asset: "PHP/USD", impact: "-1.6%", direction: "down", category: "forex" }, { asset: "Sugar", impact: "+1.9%", direction: "up", category: "commodity" }] },
  "china":        { primary: "Rare Earth Metals", symbol: "GC1!", pct: 31, indirect: [{ asset: "SOXX ETF", impact: "+3.7%", direction: "up", category: "index" }, { asset: "CNY/USD", impact: "-1.2%", direction: "down", category: "forex" }, { asset: "AAPL", impact: "-1.8%", direction: "down", category: "equity" }] },
  // Default fallback
  "default":      { primary: "Gold",        symbol: "GC1!",  pct: 2,  indirect: [{ asset: "USD Index", impact: "-0.5%", direction: "down", category: "index" }, { asset: "VIX", impact: "+3.1%", direction: "up", category: "index" }] },
};

function getRegionImpact(location: string, type: DisasterType) {
  const loc = location.toLowerCase();
  for (const [region, impact] of Object.entries(REGION_COMMODITY_MAP)) {
    if (loc.includes(region)) return impact;
  }
  // Type-based fallback
  if (type === "HURRICANE") return REGION_COMMODITY_MAP["gulf"];
  if (type === "WILDFIRE")  return REGION_COMMODITY_MAP["usa"];
  return REGION_COMMODITY_MAP["default"];
}

function magnitudeToAlert(mag: number): AlertLevel {
  if (mag >= 7.0) return "red";
  if (mag >= 5.5) return "orange";
  return "yellow";
}

function alertFromSeverity(severity: string): AlertLevel {
  if (severity === "Red")    return "red";
  if (severity === "Orange") return "orange";
  return "yellow";
}

function makeAIModels(magnitude: number, confidence: number) {
  const base = magnitude;
  return [
    { name: "AI ALPHA", probability: Math.min(99, Math.round(confidence * 100 + (Math.random() * 4 - 2))), prediction: parseFloat((base + (Math.random() * 0.8 - 0.4)).toFixed(1)) },
    { name: "AI BETA",  probability: Math.min(99, Math.round(confidence * 100 + (Math.random() * 4 - 2))), prediction: parseFloat((base + (Math.random() * 0.8 - 0.4)).toFixed(1)) },
    { name: "AI GAMMA", probability: Math.min(99, Math.round(confidence * 100 + (Math.random() * 4 - 2))), prediction: parseFloat((base + (Math.random() * 0.8 - 0.4)).toFixed(1)) },
  ];
}

// ── 1. USGS Earthquakes ───────────────────────────────────────────────────────
export async function fetchUSGSEarthquakes(): Promise<Disaster[]> {
  try {
    // M4.5+ earthquakes in the last 7 days
    const url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5&orderby=magnitude&limit=20&starttime=" +
      new Date(Date.now() - 7 * 86400000).toISOString();

    const res  = await fetch(url, { next: { revalidate: 300 } });
    const json = await res.json();

    return (json.features as any[])
      .filter((f) => f.properties.mag >= 4.5)
      .slice(0, 8)
      .map((f, i): Disaster => {
        const props    = f.properties;
        const coords   = f.geometry.coordinates;
        const mag      = props.mag as number;
        const place    = props.place as string ?? "Unknown";
        const alert    = magnitudeToAlert(mag);
        const impact   = getRegionImpact(place, "EARTHQUAKE");
        const confidence = Math.min(0.97, 0.6 + (mag - 4.5) * 0.08);
        const priceMag   = parseFloat((mag * 1.4 + Math.random() * 1.5).toFixed(1));

        return {
          id:            1000 + i,
          type:          "EARTHQUAKE",
          severity:      mag >= 7 ? "CRITICAL" : mag >= 6 ? "HIGH" : "MEDIUM",
          alert,
          location:      place,
          lat:           coords[1],
          lng:           coords[0],
          date:          new Date(props.time).toISOString().split("T")[0],
          source:        "USGS",
          isLive:        (Date.now() - props.time) < 3600000, // within 1hr
          primary:       impact.primary,
          primarySymbol: impact.symbol,
          primary_pct:   impact.pct,
          direction:     "UP",
          magnitude:     priceMag,
          confidence,
          description:   `M${mag.toFixed(1)} earthquake ${place}. Depth: ${coords[2].toFixed(0)}km. ${mag >= 6 ? "Potential infrastructure and supply chain disruption." : "Monitor for aftershocks and supply chain impact."}`,
          ai_models:     makeAIModels(priceMag, confidence),
          indirect:      impact.indirect,
        };
      });
  } catch (err) {
    console.error("[USGS]", err);
    return [];
  }
}

// ── 2. NASA FIRMS Wildfires ───────────────────────────────────────────────────
export async function fetchNASAFIRMS(): Promise<Disaster[]> {
  try {
    const MAP_KEY = process.env.NASA_FIRMS_KEY ?? "d5a5491640586a0f92787b20a58b864e";

    // Get active fire areas (clusters) for last 24h — world, VIIRS sensor
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/VIIRS_SNPP_NRT/world/1`;
    const res  = await fetch(url, { next: { revalidate: 600 } });
    const csv  = await res.text();

    if (!csv || csv.startsWith("<!") || csv.includes("Invalid")) {
      console.warn("[NASA FIRMS] Invalid response");
      return [];
    }

    // Parse CSV — columns: latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight
    const lines  = csv.trim().split("\n").slice(1); // skip header
    if (!lines.length) return [];

    // Cluster fires by ~2° grid to avoid thousands of individual points
    const clusters = new Map<string, { lats: number[]; lngs: number[]; frp: number[]; confidence: string; date: string }>();

    for (const line of lines) {
      const cols = line.split(",");
      if (cols.length < 10) continue;
      const lat  = parseFloat(cols[0]);
      const lng  = parseFloat(cols[1]);
      const frp  = parseFloat(cols[12]) || 0;
      const conf = cols[9]?.trim() ?? "nominal";
      const date = cols[5]?.trim() ?? new Date().toISOString().split("T")[0];

      // Grid key: round to nearest 3 degrees
      const key = `${Math.round(lat / 3) * 3},${Math.round(lng / 3) * 3}`;
      if (!clusters.has(key)) clusters.set(key, { lats: [], lngs: [], frp: [], confidence: conf, date });
      const c = clusters.get(key)!;
      c.lats.push(lat); c.lngs.push(lng); c.frp.push(frp);
    }

    // Sort clusters by total fire radiative power, take top 6
    const sorted = Array.from(clusters.entries())
      .map(([, v]) => ({
        lat:  v.lats.reduce((a: number, b: number) => a + b, 0) / v.lats.length,
        lng:  v.lngs.reduce((a: number, b: number) => a + b, 0) / v.lngs.length,
        frp:  v.frp.reduce((a: number, b: number) => a + b, 0),
        count: v.lats.length,
        confidence: v.confidence,
        date: v.date,
      }))
      .filter((c) => c.confidence !== "low" && c.frp > 50)
      .sort((a, b) => b.frp - a.frp)
      .slice(0, 6);

    return sorted.map((cluster, i): Disaster => {
      const location = reverseGeoLabel(cluster.lat, cluster.lng);
      const impact   = getRegionImpact(location, "WILDFIRE");
      const severity = cluster.frp > 5000 ? "CRITICAL" : cluster.frp > 1000 ? "HIGH" : "MEDIUM";
      const alert: AlertLevel = cluster.frp > 5000 ? "red" : cluster.frp > 1000 ? "orange" : "yellow";
      const confidence = cluster.confidence === "high" ? 0.88 : cluster.confidence === "nominal" ? 0.74 : 0.61;
      const priceMag   = parseFloat((Math.log10(cluster.frp) * 2.1 + Math.random()).toFixed(1));

      return {
        id:            2000 + i,
        type:          "WILDFIRE",
        severity,
        alert,
        location,
        lat:           cluster.lat,
        lng:           cluster.lng,
        date:          cluster.date,
        source:        "NASA FIRMS",
        isLive:        true,
        primary:       impact.primary,
        primarySymbol: impact.symbol,
        primary_pct:   impact.pct,
        direction:     "UP",
        magnitude:     priceMag,
        confidence,
        description:   `Active wildfire cluster detected via VIIRS satellite. ${cluster.count} hotspots, total fire radiative power: ${cluster.frp.toFixed(0)} MW. ${severity === "CRITICAL" ? "Extreme fire conditions threatening key agricultural/energy infrastructure." : "Monitor spread toward commodity-producing regions."}`,
        ai_models:     makeAIModels(priceMag, confidence),
        indirect:      impact.indirect,
      };
    });
  } catch (err) {
    console.error("[NASA FIRMS]", err);
    return [];
  }
}

// ── 3. GDACS — Floods, Cyclones, Volcanoes ────────────────────────────────────
export async function fetchGDACS(): Promise<Disaster[]> {
  try {
    const res  = await fetch("https://www.gdacs.org/xml/rss.xml", { next: { revalidate: 600 } });
    const text = await res.text();

    // Parse RSS XML manually (no xml2js needed)
    const items: Disaster[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;
    let idCounter = 3000;

    while ((match = itemRegex.exec(text)) !== null && items.length < 8) {
      const block = match[1];
      const get   = (tag: string) => {
        const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`));
        return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
      };

      const title    = get("title");
      const pubDate  = get("pubDate");
      const lat      = parseFloat(get("geo:lat")  || get("gdacs:latitude")  || "0");
      const lng      = parseFloat(get("geo:long") || get("gdacs:longitude") || "0");
      const severity = get("gdacs:alertlevel") || "Green";
      const eventType = get("gdacs:eventtype")?.toUpperCase() || "";
      const country  = get("gdacs:country") || get("gdacs:affectedcountries") || "Unknown";

      if (!lat || !lng || lat === 0) continue;

      let type: DisasterType;
      if      (eventType.includes("FL"))   type = "FLOOD";
      else if (eventType.includes("TC"))   type = "HURRICANE";
      else if (eventType.includes("DR"))   type = "DROUGHT";
      else if (eventType.includes("VO"))   type = "WILDFIRE"; // volcano → treat as supply shock
      else if (eventType.includes("EQ"))   type = "EARTHQUAKE";
      else continue;

      const alert  = alertFromSeverity(severity);
      const impact = getRegionImpact(country + " " + title, type);
      const confidence = alert === "red" ? 0.87 : alert === "orange" ? 0.74 : 0.61;
      const priceMag   = alert === "red" ? parseFloat((7 + Math.random() * 4).toFixed(1))
                       : alert === "orange" ? parseFloat((4 + Math.random() * 3).toFixed(1))
                       : parseFloat((2 + Math.random() * 2).toFixed(1));

      const date = pubDate ? new Date(pubDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

      items.push({
        id:            idCounter++,
        type,
        severity:      alert === "red" ? "CRITICAL" : alert === "orange" ? "HIGH" : "MEDIUM",
        alert,
        location:      title || country,
        lat,
        lng,
        date,
        source:        "GDACS",
        isLive:        true,
        primary:       impact.primary,
        primarySymbol: impact.symbol,
        primary_pct:   impact.pct,
        direction:     "UP",
        magnitude:     priceMag,
        confidence,
        description:   `${title}. GDACS alert level: ${severity}. Affected region: ${country}. Monitor commodity supply chains from this area.`,
        ai_models:     makeAIModels(priceMag, confidence),
        indirect:      impact.indirect,
      });
    }

    return items;
  } catch (err) {
    console.error("[GDACS]", err);
    return [];
  }
}

// ── 4. NOAA Active Storms ─────────────────────────────────────────────────────
export async function fetchNOAAStorms(): Promise<Disaster[]> {
  try {
    // NOAA NWS active alerts — tropical storm + hurricane only
    const res  = await fetch("https://api.weather.gov/alerts/active?event=Tropical%20Storm%20Warning,Hurricane%20Warning,Hurricane%20Watch", {
      headers: { "User-Agent": "CrisisAlpha/1.0 (1vdcapital1@gmail.com)" },
      next:    { revalidate: 300 },
    });

    if (!res.ok) return [];
    const json = await res.json();

    return (json.features as any[] ?? [])
      .slice(0, 4)
      .map((f, i): Disaster => {
        const props    = f.properties;
        const coords   = f.geometry?.coordinates?.[0]?.[0] ?? [0, 0];
        const impact   = getRegionImpact(props.areaDesc ?? "gulf", "HURRICANE");
        const severity = props.severity === "Extreme" ? "CRITICAL" : "HIGH";
        const alert: AlertLevel = props.severity === "Extreme" ? "red" : "orange";
        const confidence = 0.83;
        const priceMag   = parseFloat((6 + Math.random() * 4).toFixed(1));

        return {
          id:            4000 + i,
          type:          "HURRICANE",
          severity,
          alert,
          location:      props.headline ?? props.areaDesc ?? "Gulf Region",
          lat:           Array.isArray(coords) ? coords[1] ?? 25 : 25,
          lng:           Array.isArray(coords) ? coords[0] ?? -90 : -90,
          date:          new Date(props.onset ?? Date.now()).toISOString().split("T")[0],
          source:        "NOAA",
          isLive:        true,
          primary:       impact.primary,
          primarySymbol: impact.symbol,
          primary_pct:   impact.pct,
          direction:     "UP",
          magnitude:     priceMag,
          confidence,
          description:   props.description?.slice(0, 300) ?? "Active tropical storm warning. Monitor oil and gas infrastructure in affected region.",
          ai_models:     makeAIModels(priceMag, confidence),
          indirect:      impact.indirect,
        };
      });
  } catch (err) {
    console.error("[NOAA]", err);
    return [];
  }
}

// ── Rough reverse geocoding from lat/lng ──────────────────────────────────────
function reverseGeoLabel(lat: number, lng: number): string {
  if (lat > 49 && lat < 72  && lng > -140 && lng < -50)  return "Canada";
  if (lat > 24 && lat < 49  && lng > -125 && lng < -65)  return "USA";
  if (lat > 14 && lat < 32  && lng > -118 && lng < -85)  return "Mexico";
  if (lat > -5  && lat < 14  && lng > -85  && lng < -60)  return "Central America";
  if (lat > -35 && lat < 5  && lng > -80  && lng < -35)  return "Brazil";
  if (lat > -56 && lat < -17 && lng > -76 && lng < -65)  return "Chile";
  if (lat > -56 && lat < -22 && lng > -66 && lng < -55)  return "Argentina";
  if (lat > 35  && lat < 72  && lng > -10 && lng < 40)   return "Europe";
  if (lat > 10  && lat < 37  && lng > -18 && lng < 40)   return "North Africa";
  if (lat > -35 && lat < 10  && lng > 10  && lng < 50)   return "Sub-Saharan Africa";
  if (lat > 12  && lat < 42  && lng > 35  && lng < 60)   return "Middle East";
  if (lat > 55  && lat < 78  && lng > 30  && lng < 180)  return "Russia";
  if (lat > 18  && lat < 55  && lng > 60  && lng < 140)  return "China";
  if (lat > 8   && lat < 37  && lng > 68  && lng < 97)   return "India";
  if (lat > -10 && lat < 28  && lng > 95  && lng < 141)  return "Southeast Asia";
  if (lat > 28  && lat < 46  && lng > 129 && lng < 146)  return "Japan";
  if (lat > -47 && lat < -10 && lng > 113 && lng < 154)  return "Australia";
  return `${lat.toFixed(1)}°, ${lng.toFixed(1)}°`;
}