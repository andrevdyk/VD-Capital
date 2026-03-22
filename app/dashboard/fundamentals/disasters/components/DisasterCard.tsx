"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Disaster } from "../types/disaster";
import { ALERT_CONFIG, TYPE_ICONS } from "../lib/disasters";

interface DisasterCardProps {
  disaster:   Disaster;
  isSelected: boolean;
  onClick:    () => void;
}

export function DisasterCard({ disaster, isSelected, onClick }: DisasterCardProps) {
  const ac = ALERT_CONFIG[disaster.alert];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-lg border px-3 py-2.5 transition-all duration-150",
        "hover:border-white/15 hover:bg-white/[0.03]",
        !disaster.hasMarketImpact
          ? "border-white/5 bg-transparent opacity-50"
          : isSelected
          ? `${ac.bg} ${ac.border} shadow-md`
          : "border-white/8 bg-transparent"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">{TYPE_ICONS[disaster.type]}</span>
          <div className="min-w-0">
            <p className={cn("text-[9px] font-black tracking-[2px] font-mono truncate", ac.text)}>
              {disaster.type}
            </p>
            <p className="text-xs font-semibold text-foreground truncate mt-0.5 leading-tight">
              {disaster.location}
            </p>
            <p className={cn("text-[10px] font-mono truncate", disaster.hasMarketImpact ? "text-muted-foreground" : "text-muted-foreground/40 italic")}>
              {disaster.hasMarketImpact ? disaster.primary : "No market impact"}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {disaster.hasMarketImpact && disaster.magnitude != null ? (
            <p className="text-sm font-black text-emerald-400 font-mono leading-none">
              +{disaster.magnitude.toFixed(1)}%
            </p>
          ) : (
            <p className="text-[9px] font-mono text-muted-foreground/40 leading-none mt-1">
              M{disaster.description.match(/M(\d+\.\d+)/)?.[1] ?? "—"}
            </p>
          )}
          {disaster.isLive && disaster.hasMarketImpact && (
            <span className="inline-flex items-center gap-1 mt-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono text-emerald-500">LIVE</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", ac.dot, isSelected && "animate-pulse")} />
        <span className={cn("text-[9px] font-mono font-bold", ac.text)}>{disaster.severity}</span>
        <span className="text-[9px] text-muted-foreground/30">·</span>
        <span className="text-[9px] text-muted-foreground font-mono">{disaster.date}</span>
        <span className="text-[9px] text-muted-foreground/30">·</span>
        <span className="text-[9px] text-muted-foreground font-mono">{disaster.source}</span>
      </div>
    </button>
  );
}