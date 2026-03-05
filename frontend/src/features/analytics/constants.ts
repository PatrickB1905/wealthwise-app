export const RANGE_OPTIONS = [
  { label: '12 M', months: 12 },
  { label: '6 M', months: 6 },
  { label: '3 M', months: 3 },
] as const;

export const BENCHMARKS = ['SPY', 'QQQ', 'IWM'] as const;
export type Benchmark = (typeof BENCHMARKS)[number];

export const DAY_WINDOWS = [
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '180D', days: 180 },
  { label: '365D', days: 365 },
] as const;

export const DEFAULT_RANGE_MONTHS = 12;
export const DEFAULT_BENCHMARK: Benchmark = 'SPY';
export const DEFAULT_DAYS = 30;

export const CHART_Y_AXIS_WIDTH = 68;
export const AREA_FILL_ID = 'ww_area_fill';
