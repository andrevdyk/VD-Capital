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
  const mapRef        = useRef<any>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const markersRef    = useRef<Map<number, any>>(new Map());
  const onSelectRef   = useRef(onSelect);
  onSelectRef.current = onSelect;

  // ── Mount map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear any stale Leaflet instance from StrictMode double-invoke
    const el = containerRef.current as any;
    if (el._leaflet_id) {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      delete el._leaflet_id;
    }
    if (mapRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current) return;
      const el2 = containerRef.current as any;
      if (el2._leaflet_id) delete el2._leaflet_id;

      const map = L.map(containerRef.current!, {
        center:             [20, 15],
        zoom:               2,
        zoomControl:        false,
        attributionControl: false,
        minZoom:            1,
        maxZoom:            12,
        // drag is ON by default in Leaflet — no need to set it
      });

      // Esri satellite base layer
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "©Esri", maxZoom: 19 }
      ).addTo(map);

      // CartoDB dark label overlay (Stamen is deprecated)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
        { attribution: "©CartoDB", subdomains: "abcd", maxZoom: 19, opacity: 0.7 }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;

      // Add all markers
      disasters.forEach((d) => placeMarker(L, map, d, d.id === selected?.id));
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Add new markers when disaster list changes ───────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      // Add any markers that aren't on the map yet
      disasters.forEach((d) => {
        if (!markersRef.current.has(d.id)) {
          placeMarker(L, mapRef.current, d, d.id === selected?.id);
        }
      });
    });
  }, [disasters]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update icons + pan when selection changes ────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selected) return;
    import("leaflet").then((L) => {
      disasters.forEach((d) => {
        const marker = markersRef.current.get(d.id);
        if (!marker) return;
        marker.setIcon(buildIcon(L, d, d.id === selected.id));
      });
      mapRef.current.panTo([selected.lat, selected.lng], { animate: true, duration: 0.6 });
    });
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function buildIcon(L: any, d: Disaster, isSelected: boolean) {
    const ac   = ALERT_CONFIG[d.alert];
    const size = isSelected ? 34 : 26;
    const font = isSelected ? 15 : 11;

    // Use a <span> for the emoji so it renders reliably without foreignObject
    return L.divIcon({
      className:  "",
      iconSize:   [size, size],
      iconAnchor: [size / 2, size / 2],
      html: `
        <div style="position:relative;width:${size}px;height:${size}px;">
          ${isSelected ? `
            <div style="
              position:absolute;inset:-6px;border-radius:50%;
              border:2px solid ${ac.hex};
              animation:leaflet-ping 1.5s ease-out infinite;
            "></div>` : ""}
          <div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:${ac.hex};
            box-shadow:0 0 ${isSelected ? 14 : 6}px ${ac.hex};
            display:flex;align-items:center;justify-content:center;
            font-size:${font}px;line-height:1;
            cursor:pointer;
          ">${TYPE_ICONS[d.type]}</div>
        </div>`,
    });
  }

  function placeMarker(L: any, map: any, d: Disaster, isSelected: boolean) {
    const marker = L.marker([d.lat, d.lng], { icon: buildIcon(L, d, isSelected) })
      .addTo(map)
      .on("click", () => onSelectRef.current(d));
    markersRef.current.set(d.id, marker);
  }

  return (
    <>
      <style>{`
        @keyframes leaflet-ping {
          0%   { transform:scale(1);   opacity:0.9; }
          100% { transform:scale(2.4); opacity:0;   }
        }
        .leaflet-container        { background:#09090b !important; cursor:grab; }
        .leaflet-container:active { cursor:grabbing; }
        .leaflet-control-zoom a   { background:#18181b !important; border-color:#27272a !important; color:#a1a1aa !important; }
        .leaflet-control-zoom a:hover { background:#27272a !important; }
      `}</style>
      <div ref={containerRef} className="w-full h-full" />
    </>
  );
}