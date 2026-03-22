"use client";

import { useEffect, useRef } from "react";
import { Disaster } from "../types/disaster";
import { ALERT_CONFIG, TYPE_ICONS } from "../lib/disasters";

interface LeafletMapProps {
  disasters: Disaster[];
  selected:  Disaster | null;
  onSelect:  (d: Disaster) => void;
}

export function LeafletMap({ disasters, selected, onSelect }: LeafletMapProps) {
  const mapRef       = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef   = useRef<Map<number, any>>(new Map());
  const onSelectRef  = useRef(onSelect);
  onSelectRef.current = onSelect;

  // ── Mount map once ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // Guard against React StrictMode double-invoke: Leaflet stamps _leaflet_id
    // on the container div after init. If it's already there, remove + reinit.
    const container = containerRef.current as any;
    if (container._leaflet_id) {
      // Already initialised from a previous render — tear it down cleanly first
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      else { delete container._leaflet_id; }
    }
    if (mapRef.current) return;

    // Dynamically import leaflet (client-side only)
    import("leaflet").then((L) => {
      // Check again after async gap — StrictMode cleanup may have run
      if (!containerRef.current) return;
      const el = containerRef.current as any;
      if (el._leaflet_id) { delete el._leaflet_id; }

      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center:          [20, 15],
        zoom:            2,
        zoomControl:     false,
        attributionControl: false,
        minZoom:         1,
        maxZoom:         10,
      });

      // Esri World Imagery — dark satellite, no API key needed
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "©Esri ©OpenStreetMap",
        maxZoom:     19,
      }).addTo(map);

      // Dark label overlay on top of satellite
      L.tileLayer("https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png", {
        attribution: "©Stamen Design ©OpenStreetMap",
        maxZoom:     19,
        opacity:     0.4,
      }).addTo(map);

      // Zoom controls bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;

      // Add markers
      disasters.forEach((d) => addMarker(L, map, d, d.id === selected?.id));
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []); // eslint-disable-line

  // ── Add / update markers when disasters change ────────────────────────────
  function addMarker(L: any, map: any, d: Disaster, isSelected: boolean) {
    const ac = ALERT_CONFIG[d.alert];

    const pulseHtml = isSelected ? `
      <div style="
        position:absolute; inset:-8px; border-radius:50%;
        border: 2px solid ${ac.hex};
        animation: leaflet-ping 1.5s ease-out infinite;
      "></div>` : "";

    const icon = L.divIcon({
      className: "",
      iconSize:  [isSelected ? 32 : 26, isSelected ? 32 : 26],
      iconAnchor:[isSelected ? 16 : 13, isSelected ? 16 : 13],
      html: `
        <div style="position:relative; width:100%; height:100%;">
          ${pulseHtml}
          <div style="
            position:relative; width:100%; height:100%; border-radius:50%;
            background:${ac.hex};
            box-shadow: 0 0 ${isSelected ? 16 : 8}px ${ac.hex};
            display:flex; align-items:center; justify-content:center;
            font-size:${isSelected ? 14 : 11}px;
            cursor:pointer;
            transition: all 0.2s;
          ">${TYPE_ICONS[d.type]}</div>
        </div>`,
    });

    const marker = L.marker([d.lat, d.lng], { icon })
      .addTo(map)
      .on("click", () => onSelectRef.current(d));

    markersRef.current.set(d.id, marker);
  }

  // ── Update marker styles when selection changes ───────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      if (!selected) return;
    disasters.forEach((d) => {
        const marker = markersRef.current.get(d.id);
        if (!marker) return;
        const isSelected = d.id === selected.id;
        const ac = ALERT_CONFIG[d.alert];

        const pulseHtml = isSelected ? `
          <div style="
            position:absolute; inset:-8px; border-radius:50%;
            border: 2px solid ${ac.hex};
            animation: leaflet-ping 1.5s ease-out infinite;
          "></div>` : "";

        const icon = L.divIcon({
          className: "",
          iconSize:  [isSelected ? 32 : 26, isSelected ? 32 : 26],
          iconAnchor:[isSelected ? 16 : 13, isSelected ? 16 : 13],
          html: `
            <div style="position:relative; width:100%; height:100%;">
              ${pulseHtml}
              <div style="
                position:relative; width:100%; height:100%; border-radius:50%;
                background:${ac.hex};
                box-shadow: 0 0 ${isSelected ? 16 : 8}px ${ac.hex};
                display:flex; align-items:center; justify-content:center;
                font-size:${isSelected ? 14 : 11}px; cursor:pointer;
              ">${TYPE_ICONS[d.type]}</div>
            </div>`,
        });
        marker.setIcon(icon);
      });

      // Pan to selected
      if (selected) mapRef.current.panTo([selected.lat, selected.lng], { animate: true, duration: 0.5 });
    });
  }, [selected?.id]); // eslint-disable-line

  return (
    <>
      <style>{`
        @keyframes leaflet-ping {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        .leaflet-container { background: #09090b !important; }
        .leaflet-control-zoom a {
          background: #18181b !important;
          border-color: #27272a !important;
          color: #a1a1aa !important;
        }
        .leaflet-control-zoom a:hover { background: #27272a !important; }
      `}</style>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: 220 }}
      />
    </>
  );
}