"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Disaster, TabFilter } from "./types/disaster";
import { ALERT_CONFIG, TYPE_ICONS, TYPE_LABELS } from "./lib/disasters";
import { DisasterCard }       from "./components/DisasterCard";
import { IndirectImpacts }    from "./components/IndirectImpacts";
import { AIAnalysisPanel }    from "./components/AIAnalysisPanel";
import { AIPredictionsPanel } from "./components/AIPredictionsPanel";
import { CommodityChart }     from "./components/CommodityChart";
import { Badge }  from "@/components/ui/badge";
import { cn }     from "@/lib/utils";
import { RefreshCw, WifiOff } from "lucide-react";
import "leaflet/dist/leaflet.css";

const LeafletMap = dynamic(
  () => import("./components/LeafletMap").then((m) => m.LeafletMap),
  {
    ssr:     false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-background text-muted-foreground text-xs font-mono">
        Loading map...
      </div>
    ),
  }
);

const OLLAMA_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL ?? "llama3.1:8b";
const TAB_ORDER: TabFilter[] = ["ALL","WAR","WILDFIRE","EARTHQUAKE","HURRICANE","DROUGHT","FLOOD"];
const REFRESH_MS  = 5 * 60 * 1000;

export default function DisasterMarketPage() {
  const [disasters,   setDisasters]   = useState<Disaster[]>([]);
  const [selected,    setSelected]    = useState<Disaster | null>(null);
  const [activeTab,   setActiveTab]   = useState<TabFilter>("ALL");
  const [analysis,    setAnalysis]    = useState<string>("");
  const [aiLoading,   setAiLoading]   = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchedAt,   setFetchedAt]   = useState<number | null>(null);
  const [sources,     setSources]     = useState<Record<string, number>>({});
  const [dataError,   setDataError]   = useState<string | null>(null);
  const abortRef   = useRef<AbortController | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevSelId  = useRef<number | null>(null);

  // ── Live data ───────────────────────────────────────────────────────────────
  const fetchDisasters = useCallback(async (silent = false) => {
    if (!silent) setDataLoading(true);
    setDataError(null);
    try {
      const res  = await fetch("/api/live-disasters");
      const json = await res.json();
      if (json.error && !json.disasters?.length) { setDataError(json.error); return; }
      const incoming: Disaster[] = json.disasters ?? [];
      setDisasters(incoming);
      setFetchedAt(json.fetchedAt);
      setSources(json.sources ?? {});
      setSelected((prev) => {
        if (prev) {
          const still = incoming.find((d) => d.id === prev.id);
          if (still) return still;
        }
        return incoming.find((d) => d.alert === "red") ?? incoming[0] ?? null;
      });
    } catch (err) {
      console.error("[page]", err);
      setDataError("Failed to reach /api/live-disasters");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisasters();
    refreshRef.current = setInterval(() => fetchDisasters(true), REFRESH_MS);
    return () => { if (refreshRef.current) clearInterval(refreshRef.current); };
  }, [fetchDisasters]);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    activeTab === "ALL" ? disasters : disasters.filter((d) => d.type === activeTab),
  [activeTab, disasters]);

  useEffect(() => {
    if (selected && !filtered.find((d) => d.id === selected.id))
      setSelected(filtered[0] ?? null);
  }, [activeTab]); // eslint-disable-line

  // ── AI analysis ─────────────────────────────────────────────────────────────
  const fetchAnalysis = useCallback(async (disaster: Disaster) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setAiLoading(true);
    setAnalysis("");
    try {
      const res = await fetch("/api/disaster-analysis", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(disaster),
        signal:  abortRef.current.signal,
      });
      if (!res.ok) {
        const t = await res.text();
        try       { setAnalysis(`⚠️ ${JSON.parse(t).error}`); }
        catch (_) { setAnalysis(`⚠️ Server error ${res.status}.\n\nCheck:\n1. Ollama is running: ollama serve\n2. Model is pulled: ollama pull ${OLLAMA_MODEL}\n3. /api/disaster-analysis/route.ts is at root app/api/ level`); }
        return;
      }
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnalysis((p) => p + decoder.decode(value, { stream: true }));
      }
    } catch (e: any) {
      if (e?.name !== "AbortError")
        setAnalysis(`⚠️ Cannot reach Ollama.\n\nRun these in your terminal:\n  ollama serve\n  ollama pull ${OLLAMA_MODEL}`);
    } finally { setAiLoading(false); }
  }, []);

  const handleSelect = useCallback((d: Disaster) => {
    setSelected(d);
    fetchAnalysis(d);
  }, [fetchAnalysis]);

  // Trigger AI when selection first resolves from live data load
  useEffect(() => {
    if (selected && selected.id !== prevSelId.current) {
      prevSelId.current = selected.id;
      fetchAnalysis(selected);
    }
  }, [selected?.id]); // eslint-disable-line

  const ac   = selected ? ALERT_CONFIG[selected.alert] : ALERT_CONFIG["orange"];
  const isUp = selected ? selected.direction === "UP" : true;

  const criticalCount = disasters.filter((d) => d.alert === "red").length;
  const highCount     = disasters.filter((d) => d.alert === "orange").length;
  const lastUpdated   = fetchedAt
    ? `${Math.round((Date.now() - fetchedAt) / 60000)}m ago`
    : "loading...";

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">

      {/* ── Header row: logo + tabs + status ─────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center gap-0 border-b border-border bg-background z-50 h-11 px-3">

        {/* Logo */}
        <span className="text-sm font-black tracking-[3px] text-emerald-500 font-mono uppercase whitespace-nowrap pr-3 border-r border-border">
          Crisis·Alpha
        </span>

        {/* Tabs — inline with header */}
        <div className="flex items-center gap-0.5 px-2 overflow-x-auto flex-1">
          {TAB_ORDER.map((tab) => {
            const count    = tab === "ALL" ? disasters.length : disasters.filter((d) => d.type === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {tab !== "ALL" && <span className="text-[12px]">{TYPE_ICONS[tab]}</span>}
                {TYPE_LABELS[tab]}
                <span className={cn(
                  "inline-flex items-center justify-center min-w-[16px] h-4 px-0.5 rounded text-[9px] font-mono",
                  isActive ? "bg-white/15 text-foreground" : "bg-white/8 text-muted-foreground"
                )}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Status — right side */}
        <div className="flex items-center gap-2 flex-shrink-0 pl-2 border-l border-border">
          <span className="text-[9px] font-mono text-muted-foreground/50 hidden lg:block">{lastUpdated}</span>
          {Object.entries(sources).map(([src, n]) => (
            <span key={src} className="text-[9px] font-mono text-muted-foreground/50 hidden xl:block">{src}:{n}</span>
          ))}
          <button onClick={() => fetchDisasters()} className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
            <RefreshCw className={cn("w-3 h-3", dataLoading && "animate-spin")} />
          </button>
          <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            {dataError
              ? <WifiOff className="w-3 h-3 text-red-400" />
              : <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            {dataError ? "ERR" : "LIVE"}
          </span>
          <Badge variant="destructive"   className="text-[9px] px-1.5 py-0 h-5">{criticalCount} CRIT</Badge>
          <Badge variant="outline"        className="text-[9px] px-1.5 py-0 h-5 border-orange-500/40 text-orange-400">{highCount} HIGH</Badge>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left: event list */}
        <aside className="w-56 flex-shrink-0 border-r border-border bg-background flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-border flex-shrink-0">
            <p className="text-[9px] font-mono tracking-[3px] text-muted-foreground">
              {activeTab === "ALL" ? "ALL EVENTS" : TYPE_LABELS[activeTab].toUpperCase()} — {filtered.length}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {dataLoading && disasters.length === 0 ? (
              <div className="p-2 space-y-1.5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-white/[0.03] animate-pulse border border-white/5" />
                ))}
              </div>
            ) : dataError ? (
              <div className="p-3">
                <p className="text-[10px] font-mono text-red-400 leading-relaxed">{dataError}</p>
                <button onClick={() => fetchDisasters()} className="mt-2 text-[10px] font-mono text-emerald-500 underline">Retry</button>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filtered.map((d) => (
                  <DisasterCard key={d.id} disaster={d} isSelected={selected?.id === d.id} onClick={() => handleSelect(d)} />
                ))}
                {filtered.length === 0 && (
                  <p className="text-[11px] text-muted-foreground font-mono px-2 py-4 text-center">
                    No {TYPE_LABELS[activeTab]} events.
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Center: map + detail */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-background">

          {/* ── Event title banner — full width above map row ── */}
          {selected && (
            <div className={cn("flex-shrink-0 border-b px-4 py-3 flex items-center justify-between gap-4", ac.bg, ac.border)}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-shrink-0">{TYPE_ICONS[selected.type]}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-[10px] font-black tracking-[3px] font-mono", ac.text)}>{selected.type}</span>
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 border font-mono tracking-widest", ac.border, ac.text)}>
                      {selected.severity}
                    </Badge>
                    {selected.isLive && (
                      <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />LIVE
                      </span>
                    )}
                    <span className="text-[9px] text-muted-foreground font-mono">{selected.date}</span>
                    <span className="text-[9px] text-muted-foreground/30">·</span>
                    <span className="text-[9px] text-muted-foreground font-mono">{selected.source}</span>
                  </div>
                  <h2 className="text-xl font-black text-foreground tracking-tight leading-tight mt-0.5 truncate">
                    {selected.location}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-1 max-w-2xl">
                    {selected.description}
                  </p>
                </div>
              </div>
              {selected.hasMarketImpact && selected.magnitude != null ? (
                <div className="flex-shrink-0 text-right">
                  <p className="text-3xl font-black font-mono leading-none"
                    style={{ color: isUp ? "#10b981" : "#ef4444", textShadow: isUp ? "0 0 24px rgba(16,185,129,0.35)" : "0 0 24px rgba(239,68,68,0.35)" }}>
                    {isUp ? "+" : "-"}{selected.magnitude.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{selected.primary}</p>
                  <p className="text-[10px] text-muted-foreground/50 font-mono">{Math.round(selected.confidence * 100)}% confidence</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/40 font-mono italic flex-shrink-0">No market impact</p>
              )}
            </div>
          )}

          {/* ── Map row: Map | AI Predictions | AI Analysis ── */}
          <div className="flex flex-shrink-0 border-b border-border" style={{ height: 260 }}>

            {/* 1. Leaflet map */}
            <div className="flex-1 min-w-0 relative">
              <LeafletMap
                disasters={filtered.length > 0 ? filtered : disasters}
                selected={selected}
                onSelect={handleSelect}
              />
            </div>

            {/* 2. AI Predictions */}
            {selected && (
              <div className="w-64 flex-shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
                <div className="px-3 py-2 border-b border-border flex-shrink-0">
                  <p className="text-[9px] font-mono tracking-[2px] text-muted-foreground">AI PREDICTIONS</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {selected.hasMarketImpact
                    ? <AIPredictionsPanel disaster={selected} />
                    : <p className="text-[10px] text-muted-foreground/40 font-mono italic p-1">No predictions for this event.</p>}
                </div>
              </div>
            )}

            {/* 3. AI Analysis */}
            <div className="w-80 flex-shrink-0 border-l border-border bg-background flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-border flex-shrink-0 flex items-center justify-between">
                <p className="text-[9px] font-mono tracking-[2px] text-emerald-500/70">◆ AI ANALYSIS</p>
                <p className="text-[9px] font-mono text-muted-foreground/50">{OLLAMA_MODEL}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {aiLoading ? (
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mt-1.5 flex-shrink-0" />
                    <p className="text-[11px] font-mono text-muted-foreground">Analysing {selected?.location ?? "event"}...</p>
                  </div>
                ) : analysis ? (
                  <p className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap font-mono">{analysis}</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/30 font-mono italic">Select an event to generate analysis.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Detail scroll area: just the chart ── */}
          <div className="flex-1 overflow-y-auto">
            {selected ? (
              <div className="p-4 space-y-4">
                {selected.hasMarketImpact
                  ? <CommodityChart disaster={selected} />
                  : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground/40 text-xs font-mono border border-white/5 rounded-xl">
                      No commodity chart — event has no market exposure
                    </div>
                  )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs font-mono">
                {dataLoading ? "Loading live disaster data..." : "No events available."}
              </div>
            )}
          </div>
        </main>

        {/* Right: market impacts */}
        {selected && (
          <aside className="w-56 flex-shrink-0 border-l border-border bg-background flex flex-col min-h-0">
            <div className="px-3 py-2 border-b border-border flex-shrink-0">
              <p className="text-[9px] font-mono tracking-[3px] text-muted-foreground">MARKET IMPACTS</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-2 space-y-2">
                <IndirectImpacts disaster={selected} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}