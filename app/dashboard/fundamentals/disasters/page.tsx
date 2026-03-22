"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Disaster } from "./types/disaster";
import { DISASTERS, ALERT_CONFIG, TYPE_ICONS } from "./lib/disasters";
import { DisasterCard } from "./components/DisasterCard";
import { ModelBreakdown } from "./components/ModelBreakdown";
import { IndirectImpacts } from "./components/IndirectImpacts";
import { AIAnalysisPanel } from "./components/AIAnalysisPanel";
import { WorldMap } from "./components/WorldMap";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Change this to match your Ollama model name
const OLLAMA_MODEL_DISPLAY = process.env.NEXT_PUBLIC_OLLAMA_MODEL ?? "llama3.2";

export default function DisasterMarketPage() {
  const [selected, setSelected] = useState<Disaster>(DISASTERS[1]);
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAnalysis = useCallback(async (disaster: Disaster) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setAnalysis("");

    try {
      const res = await fetch("/api/disaster-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(disaster),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setAnalysis(`⚠️ ${err.error ?? "Failed to connect to AI. Make sure Ollama is running."}`);
        return;
      }

      const reader = res.body!.getReader();
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

  // Load analysis for default selected on mount
  useEffect(() => {
    fetchAnalysis(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ac = ALERT_CONFIG[selected.alert];
  const criticalCount = DISASTERS.filter((d) => d.alert === "red").length;
  const highCount = DISASTERS.filter((d) => d.alert === "orange").length;

  return (
    <div
      className="flex flex-col h-screen bg-[#050a14] text-slate-200 overflow-hidden"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {/* ── Header ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/6 bg-[#050a14]/90 backdrop-blur-sm z-50">
        <div className="flex items-center gap-4">
          <span className="text-sm font-black tracking-[4px] text-emerald-400 uppercase">
            Crisis·Alpha
          </span>
          <Separator orientation="vertical" className="h-4 bg-white/10" />
          <span className="text-[10px] tracking-[2px] text-slate-600 hidden sm:block">
            Global Disaster Market Intelligence
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-slate-500">LIVE FEED</span>
          </span>
          <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
            {criticalCount} CRITICAL
          </Badge>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-orange-500/40 text-orange-400">
            {highCount} HIGH
          </Badge>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Disaster List ── */}
        <aside className="w-72 flex-shrink-0 border-r border-white/6 bg-slate-950/40 flex flex-col">
          <div className="px-3 pt-3 pb-1">
            <p className="text-[9px] font-mono tracking-[3px] text-slate-600">
              ACTIVE EVENTS — {DISASTERS.length}
            </p>
          </div>
          <ScrollArea className="flex-1 px-2 pb-3">
            <div className="space-y-2 pt-2">
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

        {/* ── Center: Map + Detail ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* World Map */}
          <WorldMap disasters={DISASTERS} selected={selected} onSelect={handleSelect} />

          {/* Detail scroll area */}
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-4">

              {/* Disaster header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">{TYPE_ICONS[selected.type]}</span>
                    <span className={cn("text-[10px] font-bold tracking-[4px] font-mono", ac.text)}>
                      {selected.type}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] px-2 py-0 border font-mono tracking-widest", ac.border, ac.text)}
                    >
                      {selected.severity}
                    </Badge>
                  </div>
                  <h1 className="text-xl font-black text-slate-100 tracking-tight">
                    {selected.location}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
                    {selected.description}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className="text-4xl font-black text-emerald-400 font-mono leading-none"
                    style={{ textShadow: "0 0 30px rgba(52,211,153,0.35)" }}
                  >
                    +{selected.magnitude.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    {selected.primary} FORECAST
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono">
                    {Math.round(selected.confidence * 100)}% confidence
                  </p>
                </div>
              </div>

              {/* ML Model Breakdown */}
              <ModelBreakdown breakdown={selected.model_breakdown} />

              {/* AI Analysis */}
              <AIAnalysisPanel
                analysis={analysis}
                loading={loading}
                modelName={OLLAMA_MODEL_DISPLAY}
              />
            </div>
          </ScrollArea>
        </main>

        {/* ── Right: Indirect Impacts ── */}
        <aside className="w-64 flex-shrink-0 border-l border-white/6 bg-slate-950/40">
          <div className="px-3 pt-3 pb-1">
            <p className="text-[9px] font-mono tracking-[3px] text-slate-600">
              MARKET IMPACTS
            </p>
          </div>
          <ScrollArea className="h-[calc(100%-2rem)]">
            <div className="p-2 space-y-2">
              <IndirectImpacts disaster={selected} />
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}