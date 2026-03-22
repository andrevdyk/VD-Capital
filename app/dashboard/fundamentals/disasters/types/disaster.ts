export type AlertLevel   = "red" | "orange" | "yellow";
export type DisasterType = "WILDFIRE" | "EARTHQUAKE" | "HURRICANE" | "DROUGHT" | "FLOOD" | "WAR";
export type Direction    = "up" | "down";
export type TabFilter    = "ALL" | DisasterType;

export interface IndirectAsset {
  asset:     string;
  impact:    string;
  direction: Direction;
  category:  "commodity" | "equity" | "forex" | "index" | "energy";
}

export interface AIModel {
  name:        string;       // "SENTINEL" | "ORACLE" | "NEXUS"
  probability: number;       // 0-100 — probability of price increase
  prediction:  number;       // predicted % move
}

export interface Disaster {
  id:          number;
  type:        DisasterType;
  severity:    "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  alert:       AlertLevel;
  location:    string;
  lat:         number;
  lng:         number;
  date:        string;
  source:      string;       // e.g. "GDACS", "USGS", "ACLED"
  isLive:      boolean;
  primary:     string;       // primary commodity impacted
  primarySymbol: string;     // Infoway/TradingView symbol
  primary_pct: number;       // % of global supply at risk
  direction:   "UP" | "DOWN";
  magnitude:   number;       // predicted % price move
  confidence:  number;       // 0-1
  indirect:    IndirectAsset[];
  ai_models:   AIModel[];
  description: string;
}