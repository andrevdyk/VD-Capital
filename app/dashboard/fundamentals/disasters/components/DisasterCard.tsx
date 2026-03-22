"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Disaster } from "../types/disaster";
import { ALERT_CONFIG, TYPE_ICONS } from "../lib/disasters";

interface DisasterCardProps {
  disaster: Disaster;
  isSelected: boolean;
  onClick: () => void;
}

export function DisasterCard({ disaster, isSelected, onClick }: DisasterCardProps) {
  const ac = ALERT_CONFIG[disaster.alert];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 border",
        "bg-slate-950/60 hover:bg-slate-900/80",
        isSelected
          ? `${ac.bg} ${ac.border} shadow-lg ${ac.glow}`
          : "border-white/8 hover:border-white/15"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl flex-shrink-0">{TYPE_ICONS[disaster.type]}</span>
            <div className="min-w-0">
              <p className={cn("text-[10px] font-bold tracking-[3px] font-mono", ac.text)}>
                {disaster.type}
              </p>
              <p className="text-sm font-semibold text-slate-200 truncate mt-0.5">
                {disaster.location}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-black text-emerald-400 font-mono leading-none">
              +{disaster.magnitude.toFixed(1)}%
            </p>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5">{disaster.primary}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2.5">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full flex-shrink-0",
              ac.dot,
              isSelected && "animate-pulse"
            )}
          />
          <Badge
            variant="outline"
            className={cn("text-[9px] px-1.5 py-0 border-0 font-mono tracking-widest", ac.text)}
          >
            {disaster.severity}
          </Badge>
          <span className="text-[9px] text-slate-600 font-mono">•</span>
          <span className="text-[9px] text-slate-500 font-mono">{disaster.date}</span>
          <span className="text-[9px] text-slate-600 font-mono">•</span>
          <span className="text-[9px] text-slate-500 font-mono">
            {Math.round(disaster.confidence * 100)}% conf
          </span>
        </div>
      </CardContent>
    </Card>
  );
}