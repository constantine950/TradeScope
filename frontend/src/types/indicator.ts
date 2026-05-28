export interface IndicatorPoint {
  timestamp: string;
  value: number | null;
}

export interface BollingerPoint {
  timestamp: string;
  upper: number | null;
  middle: number | null;
  lower: number | null;
}

export interface IndicatorData {
  symbol: string;
  interval: string;
  type: string;
  period: number;
  data: IndicatorPoint[];
}
