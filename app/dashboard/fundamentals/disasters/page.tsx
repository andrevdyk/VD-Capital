"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Disaster, TabFilter } from "./types/disaster";
import { DISASTERS, ALERT_CONFIG, TYPE_ICONS, TYPE_LABELS } from "./lib/disasters";
import { DisasterCard }       from "./components/DisasterCard";
import { IndirectImpacts }    from "./components/IndirectImpacts";
import { AIAnalysisPanel }    from "./components/AIAnalysisPanel";
import { AIPredictionsPanel } from "./components/AIPredictionsPanel";
import { CommodityChart }     from "./components/CommodityChart";
import { Badge }  from "@/components/ui/badge";
import { cn }     from "@/lib/utils";

// Leaflet must be loaded client-side only (no SSR)
const LeafletMap = dynamic(
  () => import("./components/LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background text-muted-foreground text-xs font-mono">
      Loading map...
    </div>
  )}
);

// Also need leaflet CSS
import "leaflet/dist/leaflet.css";

const OLLAMA_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL ?? "llama3.1:8b";

const TAB_ORDER: TabFilter[] = ["ALL", "WAR", "WILDFIRE", "EARTHQUAKE", "HURRICANE", "DROUGHT", "FLOOD"];

export default function DisasterMarketPage() {
  const [selected,   setSelected]   = useState<Disaster>(DISASTERS[1]);
  const [activeTab,  setActiveTab]  = useState<TabFilter>("ALL");
  const [analysis,   setAnalysis]   = useState<string>("");
  const [aiLoading,  setAiLoading]  = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  // Filter disasters by tab
  const filtered = useMemo(() =>
    activeTab === "ALL" ? DISASTERS : DISASTERS.filter((d) => d.type === activeTab),
  [activeTab]);

  // If selected event is not in filtered list, reset to first
  useEffect(() => {
    if (!filtered.find((d) => d.id === selected.id)) {
      setSelected(filtered[0] ?? DISASTERS[0]);
    }
  }, [activeTab]); // eslint-disable-line

  // AI analysis
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
        try { setAnalysis(`⚠️ ${JSON.parse(t).error}`); }
        catch { setAnalysis(`⚠️ Server error ${res.status}. Check that /api/disaster-analysis/route.ts is at the root app/ level.`); }
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
        setAnalysis("⚠️ Ollama unreachable. Run: ollama serve\nThen: ollama pull llama3.1:8b");
    } finally { setAiLoading(false); }
  }, []);

  const handleSelect = useCallback((d: Disaster) => {
    setSelected(d);
    fetchAnalysis(d);
  }, [fetchAnalysis]);

  useEffect(() => { fetchAnalysis(selected); }, []); // eslint-disable-line

  const ac   = ALERT_CONFIG[selected.alert];
  const isUp = selected.direction === "UP";

  const criticalCount = DISASTERS.filter((d) => d.alert === "red").length;
  const highCount     = DISASTERS.filter((d) => d.alert === "orange").length;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">

      {/* ── Header + Tab Bar ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-border bg-background z-50">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black tracking-[3px] text-emerald-500 font-mono uppercase">
              Crisis·Alpha
            </span>
            <span className="text-[10px] tracking-[2px] text-muted-foreground font-mono hidden lg:block">
              Global Disaster Market Intelligence
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
            <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-5">
              {criticalCount} CRITICAL
            </Badge>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-5 border-orange-500/40 text-orange-400">
              {highCount} HIGH
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto scrollbar-none">
          {TAB_ORDER.map((tab) => {
            const count  = tab === "ALL" ? DISASTERS.length : DISASTERS.filter((d) => d.type === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono font-bold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {tab !== "ALL" && <span>{TYPE_ICONS[tab]}</span>}
                {TYPE_LABELS[tab]}
                <span className={cn(
                  "inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-mono",
                  isActive ? "bg-white/15 text-foreground" : "bg-white/8 text-muted-foreground"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left: Event list ─────────────────────────────────────────── */}
        <aside className="w-60 flex-shrink-0 border-r border-border bg-background flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-border flex-shrink-0">
            <p className="text-[9px] font-mono tracking-[3px] text-muted-foreground">
              {activeTab === "ALL" ? "ALL EVENTS" : TYPE_LABELS[activeTab].toUpperCase()} — {filtered.length}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {filtered.map((d) => (
                <DisasterCard
                  key={d.id}
                  disaster={d}
                  isSelected={selected.id === d.id}
                  onClick={() => handleSelect(d)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-[11px] text-muted-foreground font-mono px-2 py-4 text-center">
                  No {TYPE_LABELS[activeTab]} events active.
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* ── Center: Map + Detail ─────────────────────────────────────── */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-background">

          {/* Map + AI Predictions side by side */}
          <div className="flex flex-shrink-0 border-b border-border" style={{ height: 240 }}>
            {/* Leaflet map */}
            <div className="flex-1 min-w-0 relative">
              <LeafletMap
                disasters={filtered.length > 0 ? filtered : DISASTERS}
                selected={selected}
                onSelect={handleSelect}
              />
            </div>

            {/* AI Predictions panel — right of map */}
            <div className="w-72 flex-shrink-0 border-l border-border bg-background/95 flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-mono tracking-[2px] text-muted-foreground">
                    AI PREDICTIONS
                  </p>
                  <span className={cn("text-[9px] font-mono font-bold", isUp ? "text-emerald-400" : "text-red-400")}>
                    {selected.primary}
                  </span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <AIPredictionsPanel disaster={selected} />
              </div>
            </div>
          </div>

          {/* Detail scroll area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">

              {/* Event header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xl flex-shrink-0">{TYPE_ICONS[selected.type]}</span>
                    <span className={cn("text-[10px] font-black tracking-[3px] font-mono", ac.text)}>
                      {selected.type}
                    </span>
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 border font-mono tracking-widest", ac.border, ac.text)}>
                      {selected.severity}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-mono">{selected.date}</span>
                    <span className="text-[9px] text-muted-foreground/40 font-mono">·</span>
                    <span className="text-[9px] text-muted-foreground font-mono">{selected.source}</span>
                    {selected.isLive && (
                      <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <h1 className="text-lg font-black text-foreground tracking-tight">{selected.location}</h1>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{selected.description}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-3xl font-black font-mono leading-none"
                    style={{ color: isUp ? "#10b981" : "#ef4444", textShadow: isUp ? "0 0 24px rgba(16,185,129,0.3)" : "0 0 24px rgba(239,68,68,0.3)" }}>
                    {isUp ? "+" : "-"}{selected.magnitude.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{selected.primary}</p>
                  <p className="text-[10px] text-muted-foreground/50 font-mono">{Math.round(selected.confidence * 100)}% confidence</p>
                </div>
              </div>

              {/* Commodity chart — taller */}
              <CommodityChart disaster={selected} />

              {/* AI text analysis */}
              <AIAnalysisPanel analysis={analysis} loading={aiLoading} modelName={OLLAMA_MODEL} />
            </div>
          </div>
        </main>

        {/* ── Right: Market impacts ─────────────────────────────────────── */}
        <aside className="w-60 flex-shrink-0 border-l border-border bg-background flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-border flex-shrink-0">
            <p className="text-[9px] font-mono tracking-[3px] text-muted-foreground">MARKET IMPACTS</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-2">
              <IndirectImpacts disaster={selected} />
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}