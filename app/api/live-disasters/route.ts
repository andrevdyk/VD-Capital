import { NextResponse } from "next/server";
import {
  fetchUSGSEarthquakes,
  fetchNASAFIRMS,
  fetchGDACS,
  fetchNOAAStorms,
} from "@/app/dashboard/fundamentals/disasters/lib/fetchDisasters";
import { Disaster } from "@/app/dashboard/fundamentals/disasters/types/disaster";

// Cache result in memory between requests — refresh every 5 minutes
let cache: { data: Disaster[]; fetchedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const dynamic    = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Return cached data if fresh
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
      return NextResponse.json({
        disasters:  cache.data,
        fetchedAt:  cache.fetchedAt,
        cached:     true,
        sources:    summariseSources(cache.data),
      });
    }

    // Fetch all sources in parallel
    const [earthquakes, wildfires, gdacs, storms] = await Promise.allSettled([
      fetchUSGSEarthquakes(),
      fetchNASAFIRMS(),
      fetchGDACS(),
      fetchNOAAStorms(),
    ]);

    const all: Disaster[] = [
      ...(earthquakes.status === "fulfilled" ? earthquakes.value : []),
      ...(wildfires.status  === "fulfilled" ? wildfires.value  : []),
      ...(gdacs.status      === "fulfilled" ? gdacs.value      : []),
      ...(storms.status     === "fulfilled" ? storms.value     : []),
    ];

    // Deduplicate by proximity (within ~2° lat/lng) and type
    const deduped = deduplicateByProximity(all);

    // Sort: CRITICAL first, then by magnitude descending
    const sorted = deduped.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      const sd = severityOrder[a.severity] - severityOrder[b.severity];
      if (sd !== 0) return sd;
      return b.magnitude - a.magnitude;
    });

    // Log any failed sources
    if (earthquakes.status === "rejected") console.error("[live-disasters] USGS failed:", earthquakes.reason);
    if (wildfires.status   === "rejected") console.error("[live-disasters] FIRMS failed:", wildfires.reason);
    if (gdacs.status       === "rejected") console.error("[live-disasters] GDACS failed:", gdacs.reason);
    if (storms.status      === "rejected") console.error("[live-disasters] NOAA failed:", storms.reason);

    // If all sources failed, return a clear error rather than empty array
    if (sorted.length === 0) {
      return NextResponse.json(
        { error: "All data sources returned empty. Check API connectivity.", disasters: [], fetchedAt: Date.now(), sources: {} },
        { status: 503 }
      );
    }

    cache = { data: sorted, fetchedAt: Date.now() };

    return NextResponse.json({
      disasters:  sorted,
      fetchedAt:  Date.now(),
      cached:     false,
      sources:    summariseSources(sorted),
    });
  } catch (err) {
    console.error("[live-disasters]", err);
    return NextResponse.json({ error: "Internal server error", disasters: [] }, { status: 500 });
  }
}

function deduplicateByProximity(disasters: Disaster[]): Disaster[] {
  const result: Disaster[] = [];
  for (const d of disasters) {
    const isDup = result.some(
      (r) =>
        r.type === d.type &&
        Math.abs(r.lat - d.lat) < 2.5 &&
        Math.abs(r.lng - d.lng) < 2.5
    );
    if (!isDup) result.push(d);
  }
  return result;
}

function summariseSources(disasters: Disaster[]) {
  return disasters.reduce((acc, d) => {
    acc[d.source] = (acc[d.source] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}