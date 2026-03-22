"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Disaster } from "../types/disaster";
import { ALERT_CONFIG, COMMODITY_CATEGORIES } from "../lib/disasters";
import { TrendingUp, TrendingDown } from "lucide-react";

interface IndirectImpactsProps {
  disaster: Disaster;
}

export function IndirectImpacts({ disaster }: IndirectImpactsProps) {
  const [catFilter, setCatFilter] = useState<string>("All");
  const ac   = ALERT_CONFIG[disaster.alert];
  const isUp = disaster.direction === "UP";

  const filtered = catFilter === "All"
    ? disaster.indirect
    : disaster.indirect.filter((a) => a.category === catFilter);

  return (
    <div className="space-y-3">
      {/* Primary commodity */}
      <div className={cn("rounded-lg border p-3", ac.bg, ac.border)}>
        <p className={cn("text-[9px] font-mono tracking-[2px] mb-2 opacity-70", ac.text)}>
          PRIMARY COMMODITY
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-foreground">{disaster.primary}</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              {disaster.primary_pct}% global supply at risk
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-xl font-black font-mono"
              style={{
                color: isUp ? "#10b981" : "#ef4444",
                textShadow: isUp ? "0 0 16px rgba(16,185,129,0.4)" : "0 0 16px rgba(239,68,68,0.4)",
              }}
            >
              {isUp ? "+" : "-"}{disaster.magnitude.toFixed(1)}%
            </p>
            <p className={cn("text-[9px] font-mono font-bold", isUp ? "text-emerald-400" : "text-red-400")}>
              {isUp ? "BULLISH" : "BEARISH"}
            </p>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div>
        <p className="text-[9px] font-mono tracking-[2px] text-muted-foreground mb-1.5 px-0.5">
          SECONDARY EXPOSURES
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {COMMODITY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={cn(
                "px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all capitalize",
                catFilter === cat
                  ? "bg-white/15 text-foreground"
                  : "bg-white/[0.04] text-muted-foreground hover:bg-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Asset rows */}
      <div className="space-y-1">
        {filtered.length === 0 ? (
          <p className="text-[10px] text-muted-foreground font-mono px-1">
            No {catFilter} exposures for this event.
          </p>
        ) : (
          filtered.map((asset, i) => {
            const up = asset.direction === "up";
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs",
                  up
                    ? "bg-emerald-950/25 border-emerald-500/15"
                    : "bg-red-950/25 border-red-500/15"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {up
                    ? <TrendingUp  className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    : <TrendingDown className="w-3 h-3 text-red-400    flex-shrink-0" />}
                  <span className="text-xs font-mono text-foreground/80 truncate">{asset.asset}</span>
                </div>
                <span className={cn("text-xs font-black font-mono flex-shrink-0 ml-2", up ? "text-emerald-400" : "text-red-400")}>
                  {asset.impact}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Transmission path */}
      <div className="rounded-lg border border-white/6 bg-white/[0.02] p-3">
        <p className="text-[9px] font-mono tracking-[2px] text-muted-foreground mb-2">
          TRANSMISSION PATH
        </p>
        <div className="font-mono text-[10px] leading-loose">
          <p className={cn("font-bold", ac.text)}>⬤ {disaster.type}</p>
          <p className="pl-3 text-muted-foreground/30">↓</p>
          <p className="pl-2 text-muted-foreground">Production Loss</p>
          <p className="pl-3 text-muted-foreground/30">↓</p>
          <p className="pl-2 text-muted-foreground">Supply Shock</p>
          <p className="pl-3 text-muted-foreground/30">↓</p>
          <p className="pl-2 text-foreground/80">→ {disaster.primary}</p>
          {disaster.indirect.slice(0, 3).map((a, i) => (
            <p key={i} className={cn("pl-5 text-[9px]", a.direction === "up" ? "text-emerald-400" : "text-red-400")}>
              → {a.asset} {a.impact}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}