export interface EnergyPricePoint {
  timestamp: number;
  isoTime: string;
  price: number;
  region: string;
}

export interface GridMetric {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "stable";
}

export interface InvoiceRecord {
  id: string;
  periodStart: string;
  periodEnd: string;
  provider: string;
  energyMWh: number;
  totalCostEUR: number;
}

export interface InvoiceComparison {
  month: string;
  billed: number;
  market: number;
  variance: number;
}

export interface AnomalyPoint {
  isoTime: string;
  price: number;
  zScore: number;
  severity: "low" | "medium" | "high";
  note: string;
}

export interface PatternInsight {
  title: string;
  description: string;
  impact: "positive" | "neutral" | "negative";
}

export interface EfficiencyInsight {
  efficiencyScore: number;
  patternLabel: string;
  changePct: number;
  recommendations: string[];
}

export interface ReportPreview {
  title: string;
  nextDelivery: string;
  deliveryCadenceLabel: string;
  sections: {
    title: string;
    body: string;
    indicator?: string;
  }[];
}

export interface IndicatorPoint {
  period: string;
  value: number;
}

export interface IndicatorSeries {
  key: string;
  label: string;
  unit?: string;
  points: IndicatorPoint[];
}

export interface IndicatorAnomaly extends IndicatorPoint {
  zScore: number;
  severity: "low" | "medium" | "high";
  direction: "up" | "down";
}

export interface AiRecommendation {
  summary: string;
  opportunities: string[];
  cautions: string[];
  actions: string[];
  generatedAt: string;
}

