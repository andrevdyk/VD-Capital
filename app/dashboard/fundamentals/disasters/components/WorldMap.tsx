"use client";

import { cn } from "@/lib/utils";
import { Disaster } from "../types/disaster";
import { ALERT_CONFIG, TYPE_ICONS } from "../lib/disasters";

interface WorldMapProps {
  disasters: Disaster[];
  selected:  Disaster;
  onSelect:  (d: Disaster) => void;
}

function lngToX(lng: number) { return ((lng + 180) / 360) * 100; }
function latToY(lat: number) { return ((90  - lat) / 180) * 100; }

export function WorldMap({ disasters, selected, onSelect }: WorldMapProps) {
  return (
    <div className="relative w-full h-44 bg-background border-b border-border overflow-hidden flex-shrink-0">

      {/* Grid lines */}
      {[10,20,30,40,50,60,70,80,90].map((p) => (
        <div key={`v${p}`} className="absolute top-0 bottom-0 w-px bg-border/40" style={{ left: `${p}%` }} />
      ))}
      {[20,40,60,80].map((p) => (
        <div key={`h${p}`}
          className={cn("absolute left-0 right-0 h-px", p === 50 ? "bg-emerald-500/15" : "bg-border/40")}
          style={{ top: `${p}%` }}
        />
      ))}
      {/* Equator */}
      <div className="absolute left-0 right-0 h-px bg-emerald-500/20" style={{ top: "50%" }} />

      <p className="absolute top-2 left-3 text-[9px] tracking-[2px] text-muted-foreground/50 select-none font-mono">
        WORLD MAP — DISASTER OVERLAY
      </p>

      {/* Markers */}
      {disasters.map((d) => {
        const x    = lngToX(d.lng);
        const y    = latToY(d.lat);
        const ac   = ALERT_CONFIG[d.alert];
        const isSel = selected.id === d.id;

        return (
          <button
            key={d.id}
            onClick={() => onSelect(d)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`${d.type} at ${d.location}`}
          >
            {isSel && (
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-50 scale-[2.5]"
                style={{ background: ac.hex }}
              />
            )}
            <span
              className={cn(
                "relative flex items-center justify-center w-6 h-6 rounded-full text-[11px] transition-transform duration-150",
                isSel ? "scale-125" : "scale-100 group-hover:scale-110"
              )}
              style={{
                background: ac.hex,
                boxShadow: `0 0 ${isSel ? 14 : 7}px ${ac.hex}`,
              }}
            >
              {TYPE_ICONS[d.type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}