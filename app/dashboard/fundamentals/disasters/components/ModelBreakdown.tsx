"use client";

import { ModelBreakdown as ModelBreakdownType } from "../types/disaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ModelBreakdownProps {
  breakdown: ModelBreakdownType;
}

const MODELS = [
  { key: "xgboost" as const, label: "XGBoost", color: "bg-emerald-400" },
  { key: "lightgbm" as const, label: "LightGBM", color: "bg-orange-400" },
  { key: "pytorch" as const, label: "PyTorch", color: "bg-violet-400" },
];

export function ModelBreakdown({ breakdown }: ModelBreakdownProps) {
  const avg = (breakdown.xgboost + breakdown.lightgbm + breakdown.pytorch) / 3;
  const max = 15;

  return (
    <Card className="bg-white/3 border-white/8">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-[9px] font-mono tracking-[3px] text-slate-500 uppercase">
          ML Model Consensus
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {MODELS.map(({ key, label, color }) => {
          const value = breakdown[key];
          const pct = Math.min((value / max) * 100, 100);
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                  {label}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-200">
                  +{value.toFixed(1)}%
                </span>
              </div>
              {/* Custom progress bar to support per-model colors */}
              <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        <div className="pt-2 border-t border-white/6 flex justify-between items-center">
          <span className="text-[10px] font-mono text-slate-500">Model Average</span>
          <span className="text-sm font-black font-mono text-emerald-400">
            +{avg.toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}