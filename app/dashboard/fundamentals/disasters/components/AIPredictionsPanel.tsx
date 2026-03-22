"use client";

import { cn } from "@/lib/utils";
import { Disaster } from "../types/disaster";
import { ALERT_CONFIG } from "../lib/disasters";

interface AIPredictionsPanelProps {
  disaster: Disaster;
}

const MODEL_COLORS = ["#10b981", "#f97316", "#a78bfa"] as const;
const MODEL_BG     = ["rgba(16,185,129,0.08)", "rgba(249,115,22,0.08)", "rgba(167,139,250,0.08)"] as const;
const MODEL_BORDER = ["rgba(16,185,129,0.25)", "rgba(249,115,22,0.25)", "rgba(167,139,250,0.25)"] as const;

export function AIPredictionsPanel({ disaster }: AIPredictionsPanelProps) {
  const isUp  = disaster.direction === "UP";
  const avgProb = Math.round(
    disaster.ai_models.reduce((s, m) => s + m.probability, 0) / disaster.ai_models.length
  );

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Consensus bar */}
      <div className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
        <p className="text-[9px] font-mono tracking-[2px] text-muted-foreground mb-1.5">
          AI CONSENSUS
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${avgProb}%`,
                background: isUp
                  ? "linear-gradient(90deg, #059669, #10b981)"
                  : "linear-gradient(90deg, #b91c1c, #ef4444)",
              }}
            />
          </div>
          <span className={cn(
            "text-sm font-black font-mono flex-shrink-0",
            isUp ? "text-emerald-400" : "text-red-400"
          )}>
            {avgProb}%
          </span>
        </div>
        <p className="text-[9px] text-muted-foreground font-mono mt-1">
          probability of {isUp ? "price increase" : "price decrease"}
        </p>
      </div>

      {/* Individual AI cards */}
      {disaster.ai_models.map((model, i) => (
        <div
          key={model.name}
          className="rounded-lg border px-3 py-2 flex items-center justify-between"
          style={{ background: MODEL_BG[i], borderColor: MODEL_BORDER[i] }}
        >
          <div>
            <p className="text-[9px] font-mono font-black tracking-[2px]"
              style={{ color: MODEL_COLORS[i] }}>
              {model.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Probability mini-bar */}
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${model.probability}%`, background: MODEL_COLORS[i] }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {model.probability}% bull
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-base font-black font-mono"
              style={{ color: MODEL_COLORS[i] }}>
              {isUp ? "+" : "-"}{model.prediction.toFixed(1)}%
            </p>
            <p className="text-[9px] font-mono text-muted-foreground">predicted</p>
          </div>
        </div>
      ))}
    </div>
  );
}