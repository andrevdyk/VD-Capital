"use client";

import { cn } from "@/lib/utils";
import { Disaster } from "../types/disaster";
import { ALERT_CONFIG, TYPE_ICONS } from "../lib/disasters";

interface WorldMapProps {
  disasters: Disaster[];
  selected: Disaster;
  onSelect: (d: Disaster) => void;
}

function lngToX(lng: number, w: number) {
  return ((lng + 180) / 360) * w;
}
function latToY(lat: number, h: number) {
  return ((90 - lat) / 180) * h;
}

export function WorldMap({ disasters, selected, onSelect }: WorldMapProps) {
  const W = 100; // percentage-based
  const H = 100;

  return (
    <div className="relative w-full h-48 bg-slate-950 border-b border-white/6 overflow-hidden">
      {/* Grid lines */}
      {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((pct) => (
        <div
          key={`v${pct}`}
          className="absolute top-0 bottom-0 w-px bg-white/[0.03]"
          style={{ left: `${pct}%` }}
        />
      ))}
      {[16.6, 33.3, 50, 66.6, 83.3].map((pct) => (
        <div
          key={`h${pct}`}
          className="absolute left-0 right-0 h-px"
          style={{
            top: `${pct}%`,
            background: pct === 50 ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.03)",
          }}
        />
      ))}

      {/* Label */}
      <p className="absolute top-2 left-3 text-[9px] font-mono tracking-[2px] text-slate-700 select-none">
        WORLD MAP — DISASTER OVERLAY
      </p>

      {/* Disaster markers */}
      {disasters.map((d) => {
        const x = lngToX(d.lng, 100);
        const y = latToY(d.lat, 100);
        const ac = ALERT_CONFIG[d.alert];
        const isSel = selected.id === d.id;

        return (
          <button
            key={d.id}
            onClick={() => onSelect(d)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`${d.type} at ${d.location}`}
          >
            {/* Ping ring when selected */}
            {isSel && (
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-60"
                style={{ background: ac.hex, scale: "2" }}
              />
            )}
            {/* Dot */}
            <span
              className={cn(
                "relative flex items-center justify-center w-6 h-6 rounded-full text-[11px]",
                "transition-transform duration-150",
                isSel ? "scale-125" : "scale-100 group-hover:scale-110"
              )}
              style={{
                background: ac.hex,
                boxShadow: `0 0 ${isSel ? 16 : 8}px ${ac.hex}`,
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