export type Summary = {
  invested: number;
  totalPL: number;
  totalPLPercent: number;
  openCount: number;
  closedCount: number;
};

export type HistoryItem = {
  date: string;
  value: number;
};

export type HoldingItem = {
  ticker: string;
  quantity: number;
  avgCost: number;
  currentPrice: number | null;
  marketValue: number | null;
  unrealizedPL: number | null;
  unrealizedPLPercent: number | null;
  weight: number | null;
};

export type Overview = {
  summary: Summary;
  holdings: HoldingItem[];
  concentration: {
    top5WeightPercent: number;
    hhi: number;
  };
};

export type PerformancePoint = {
  date: string;
  portfolioValue: number;
  cumulativeReturnPercent: number;
};

export type PerformanceResponse = {
  days: number;
  points: PerformancePoint[];
};

export type RiskResponse = {
  days: number;
  benchmark: string;
  volatilityAnnualized: number;
  maxDrawdownPercent: number;
  sharpeAnnualized: number;
  beta: number;
  correlation: number;
};

export type Tone = 'positive' | 'negative' | 'neutral';
