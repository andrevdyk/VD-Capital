export type AlertLevel = "red" | "orange" | "yellow";
export type DisasterType = "WILDFIRE" | "EARTHQUAKE" | "HURRICANE" | "DROUGHT" | "FLOOD";
export type Direction = "up" | "down";

export interface IndirectAsset {
  asset: string;
  impact: string;
  direction: Direction;
}

export interface ModelBreakdown {
  xgboost: number;
  lightgbm: number;
  pytorch: number;
}

export interface Disaster {
  id: number;
  type: DisasterType;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  alert: AlertLevel;
  location: string;
  lat: number;
  lng: number;
  date: string;
  primary: string;
  primary_pct: number;
  direction: "UP" | "DOWN";
  magnitude: number;
  confidence: number;
  indirect: IndirectAsset[];
  model_breakdown: ModelBreakdown;
  description: string;
  // Optional type-specific fields
  area_ha?: number;
  magnitude_eq?: number;
  depth_km?: number;
  wind_speed_kmh?: number;
  ndvi_drop_pct?: number;
  affected_km2?: number;
}