"use client";

import { cn } from "@/lib/utils";
import { IndirectAsset, Disaster } from "../types/disaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ALERT_CONFIG } from "../lib/disasters";

interface IndirectImpactsProps {
  disaster: Disaster;
}

function AssetRow({ asset }: { asset: IndirectAsset }) {
  const isUp = asset.direction === "up";
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-lg border text-sm",
        isUp
          ? "bg-emerald-950/30 border-emerald-500/20"
          : "bg-red-950/30 border-red-500/20"
      )}
    >
      <div className="flex items-center gap-2">
        {isUp ? (
          <TrendingUp className="w-3 h-3 text-emerald-400 flex-shrink-0" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-400 flex-shrink-0" />
        )}
        <span className="text-xs font-mono text-slate-300">{asset.asset}</span>
      </div>
      <span
        className={cn(
          "text-xs font-black font-mono",
          isUp ? "text-emerald-400" : "text-red-400"
        )}
      >
        {asset.impact}
      </span>
    </div>
  );
}

export function IndirectImpacts({ disaster }: IndirectImpactsProps) {
  const ac = ALERT_CONFIG[disaster.alert];

  return (
    <div className="space-y-3">
      {/* Primary commodity */}
      <Card className={cn("border", ac.bg, ac.border)}>
        <CardContent className="p-4">
          <p className={cn("text-[9px] font-mono tracking-[3px] mb-2 opacity-70", ac.text)}>
            PRIMARY COMMODITY
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-black text-slate-100 font-mono">
                {disaster.primary}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                {disaster.primary_pct}% global supply at risk
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-400 font-mono leading-none"
                style={{ textShadow: "0 0 20px rgba(52,211,153,0.4)" }}>
                +{disaster.magnitude.toFixed(1)}%
              </p>
              <Badge variant="outline" className="text-[9px] mt-1 border-emerald-500/30 text-emerald-400">
                BULLISH
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary assets */}
      <Card className="bg-white/3 border-white/8">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-[9px] font-mono tracking-[3px] text-slate-500">
            SECONDARY EXPOSURES
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-1.5">
          {disaster.indirect.map((asset, i) => (
            <AssetRow key={i} asset={asset} />
          ))}
        </CardContent>
      </Card>

      {/* Transmission chain */}
      <Card className="bg-white/2 border-white/6">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-[9px] font-mono tracking-[3px] text-slate-500">
            TRANSMISSION PATH
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="font-mono text-[10px] leading-loose text-slate-500">
            <p className={ac.text}>⬤ {disaster.type}</p>
            <p className="pl-3 text-slate-700">↓</p>
            <p className="pl-2">Production Loss</p>
            <p className="pl-3 text-slate-700">↓</p>
            <p className="pl-2">Supply Shock</p>
            <p className="pl-3 text-slate-700">↓</p>
            <p className="pl-2 text-slate-300">→ {disaster.primary}</p>
            <p className="pl-5 text-slate-700">↓</p>
            {disaster.indirect.slice(0, 3).map((a, i) => (
              <p
                key={i}
                className={cn(
                  "pl-6 text-[9px]",
                  a.direction === "up" ? "text-emerald-400" : "text-red-400"
                )}
              >
                → {a.asset} {a.impact}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}