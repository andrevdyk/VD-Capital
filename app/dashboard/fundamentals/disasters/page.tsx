"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Disaster } from "./types/disaster";
import { DISASTERS, ALERT_CONFIG, TYPE_ICONS } from "./lib/disasters";
import { DisasterCard }    from "./components/DisasterCard";
import { ModelBreakdown }  from "./components/ModelBreakdown";
import { IndirectImpacts } from "./components/IndirectImpacts";
import { AIAnalysisPanel } from "./components/AIAnalysisPanel";
import { WorldMap }        from "./components/WorldMap";
import { CommodityChart }  from "./components/CommodityChart";
import { Badge }           from "@/components/ui/badge";
import { ScrollArea }      from "@/components/ui/scroll-area";
import { Separator }       from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const OLLAMA_MODEL_DISPLAY = process.env.NEXT_PUBLIC_OLLAMA_MODEL ?? "mistral";

export default function DisasterMarketPage() {
  const [selected,  setSelected]  = useState<Disaster>(DISASTERS[1]);
  const [analysis,  setAnalysis]  = useState<string>("");
  const [loading,   setLoading]   = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAnalysis = useCallback(async (disaster: Disaster) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setAnalysis("");

    try {
      const res = await fetch("/api/disaster-analysis", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(disaster),
        signal:  abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setAnalysis(`⚠️ ${err.error ?? "Failed to connect to AI. Make sure Ollama is running."}`);
        return;
      }

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnalysis((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setAnalysis("⚠️ Could not reach Ollama. Run `ollama serve` in your terminal first.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = useCallback(
    (disaster: Disaster) => {
      setSelected(disaster);
      fetchAnalysis(disaster);
    },
    [fetchAnalysis]
  );

  useEffect(() => { fetchAnalysis(selected); }, []); // eslint-disable-line

  const ac = ALERT_CONFIG[selected.alert];
  const isUp = selected.direction === "UP";

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-mono">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-border bg-background/95 backdrop-blur-sm z-50">
        <div className="flex items-center gap-4">
          <span className="text-sm font-black tracking-[4px] text-emerald-500 uppercase">
            Crisis·Alpha
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-[10px] tracking-[2px] text-muted-foreground hidden sm:block">
            Global Disaster Market Intelligence
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE FEED
          </span>
          <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
            {DISASTERS.filter((d) => d.alert === "red").length} CRITICAL
          </Badge>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-orange-500/40 text-orange-400">
            {DISASTERS.filter((d) => d.alert === "orange").length} HIGH
          </Badge>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar: event list ─────────────────────────────────── */}
        <aside className="w-72 flex-shrink-0 border-r border-border bg-background flex flex-col">
          <div className="px-3 pt-3 pb-1.5 border-b border-border">
            <p className="text-[9px] tracking-[3px] text-muted-foreground">
              ACTIVE EVENTS — {DISASTERS.length}
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1.5">
              {DISASTERS.map((d) => (
                <DisasterCard
                  key={d.id}
                  disaster={d}
                  isSelected={selected.id === d.id}
                  onClick={() => handleSelect(d)}
                />
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* ── Center: map + details ─────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* World map */}
          <WorldMap disasters={DISASTERS} selected={selected} onSelect={handleSelect} />

          {/* Scrollable detail area */}
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-4">

              {/* ── Event header ─────────────────────────────────────── */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <span className="text-2xl">{TYPE_ICONS[selected.type]}</span>
                    <span className={cn("text-[10px] font-bold tracking-[4px]", ac.text)}>
                      {selected.type}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] px-2 py-0 border tracking-widest", ac.border, ac.text)}
                    >
                      {selected.severity}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{selected.date}</span>
                  </div>
                  <h1 className="text-xl font-black text-foreground tracking-tight">
                    {selected.location}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-lg">
                    {selected.description}
                  </p>
                </div>

                {/* Big price prediction */}
                <div className="flex-shrink-0 text-right">
                  <p
                    className="text-4xl font-black font-mono leading-none"
                    style={{
                      color: isUp ? "#10b981" : "#ef4444",
                      textShadow: isUp
                        ? "0 0 30px rgba(16,185,129,0.3)"
                        : "0 0 30px rgba(239,68,68,0.3)",
                    }}
                  >
                    {isUp ? "+" : "-"}{selected.magnitude.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {selected.primary} FORECAST
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {Math.round(selected.confidence * 100)}% confidence
                  </p>
                </div>
              </div>

              {/* ── Commodity chart with prediction box ──────────────── */}
              <CommodityChart disaster={selected} />

              {/* ── ML model breakdown ───────────────────────────────── */}
              <ModelBreakdown breakdown={selected.model_breakdown} />

              {/* ── AI analysis ──────────────────────────────────────── */}
              <AIAnalysisPanel
                analysis={analysis}
                loading={loading}
                modelName={OLLAMA_MODEL_DISPLAY}
              />
            </div>
          </ScrollArea>
        </main>

        {/* ── Right sidebar: market impacts ────────────────────────────── */}
        <aside className="w-64 flex-shrink-0 border-l border-border bg-background flex flex-col">
          <div className="px-3 pt-3 pb-1.5 border-b border-border">
            <p className="text-[9px] tracking-[3px] text-muted-foreground">
              MARKET IMPACTS
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              <IndirectImpacts disaster={selected} />
            </div>
          </ScrollArea>
        </aside>

      </div>
    </div>
  );
}