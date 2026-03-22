"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BrainCircuit } from "lucide-react";

interface AIAnalysisPanelProps {
  analysis: string;
  loading: boolean;
  modelName: string;
}

export function AIAnalysisPanel({ analysis, loading, modelName }: AIAnalysisPanelProps) {
  return (
    <Card className="bg-emerald-950/10 border-emerald-500/15">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-[9px] font-mono tracking-[3px] text-emerald-500/70">
          <BrainCircuit className="w-3 h-3" />
          AI ANALYSIS — {modelName.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center gap-3 py-2">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="text-xs font-mono text-slate-500">
              Analysing event with ML models...
            </span>
          </div>
        ) : analysis ? (
          <p className="text-[11px] leading-relaxed text-slate-400 whitespace-pre-wrap font-mono">
            {analysis}
          </p>
        ) : (
          <p className="text-[11px] text-slate-600 font-mono italic">
            Select a disaster event to generate analysis.
          </p>
        )}
      </CardContent>
    </Card>
  );
}