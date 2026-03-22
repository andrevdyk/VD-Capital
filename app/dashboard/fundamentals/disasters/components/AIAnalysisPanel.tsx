"use client";

import { BrainCircuit, Loader2 } from "lucide-react";

interface AIAnalysisPanelProps {
  analysis:  string;
  loading:   boolean;
  modelName: string;
}

export function AIAnalysisPanel({ analysis, loading, modelName }: AIAnalysisPanelProps) {
  return (
    <div className="rounded-xl border border-emerald-500/15 bg-emerald-950/10">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/10">
        <BrainCircuit className="w-3.5 h-3.5 text-emerald-500/70" />
        <p className="text-[9px] font-mono tracking-[3px] text-emerald-500/70">
          AI ANALYSIS — {modelName.toUpperCase()} (LOCAL)
        </p>
      </div>
      <div className="px-4 py-3">
        {loading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin flex-shrink-0" />
            <span className="text-xs font-mono text-muted-foreground">
              Analysing event with {modelName}...
            </span>
          </div>
        ) : analysis ? (
          <p className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap font-mono">
            {analysis}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground/40 font-mono italic">
            Select a disaster to generate analysis.
          </p>
        )}
      </div>
    </div>
  );
}