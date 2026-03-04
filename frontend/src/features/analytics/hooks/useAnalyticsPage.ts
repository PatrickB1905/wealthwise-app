import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';

import AnalyticsAPI from '../api/analyticsClient';
import { useAuth } from '@features/auth';
import { usePositionWS } from '@features/portfolio/hooks/usePositionWS';
import {
  AREA_FILL_ID,
  Benchmark,
  DEFAULT_BENCHMARK,
  DEFAULT_DAYS,
  DEFAULT_RANGE_MONTHS,
} from '../constants';
import type {
  HistoryItem,
  Overview,
  PerformanceResponse,
  RiskResponse,
  Summary,
  Tone,
} from '../types/analytics';

function toneFromNumber(val: number): Tone {
  if (val > 0) return 'positive';
  if (val < 0) return 'negative';
  return 'neutral';
}

function isFiniteNumber(val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val);
}

function num(val: unknown, fallback = 0): number {
  return isFiniteNumber(val) ? val : fallback;
}

function money(val: unknown): string {
  return num(val).toFixed(2);
}

function pct(val: unknown): string {
  return num(val).toFixed(2);
}

function fixed(val: unknown, digits: number, fallback = 0): string {
  return num(val, fallback).toFixed(digits);
}

function ageSecondsFromMs(ms?: number): number | null {
  if (!ms || !Number.isFinite(ms)) return null;
  return Math.max(0, (Date.now() - ms) / 1000);
}

function formatAge(ageSec: number): string {
  if (ageSec < 60) return `${Math.round(ageSec)}s ago`;
  const mins = Math.round(ageSec / 60);
  return `${mins}m ago`;
}

export function useAnalyticsPage() {
  const theme = useTheme();
  const { user } = useAuth();

  usePositionWS();

  const [rangeMonths, setRangeMonths] = useState<number>(DEFAULT_RANGE_MONTHS);
  const [benchmark, setBenchmark] = useState<Benchmark>(DEFAULT_BENCHMARK);
  const [days, setDays] = useState<number>(DEFAULT_DAYS);

  const commonQueryOpts = useMemo(
    () =>
      ({
        enabled: Boolean(user),
        keepPreviousData: true,
        refetchOnWindowFocus: false,
        staleTime: 10_000,
        refetchInterval: 30_000,
        refetchIntervalInBackground: true,
      }) as const,
    [user],
  );

  const summaryQuery = useQuery<Summary, Error>({
    queryKey: ['analytics', 'summary'],
    queryFn: () => AnalyticsAPI.get<Summary>('/analytics/summary').then((res) => res.data),
    ...commonQueryOpts,
  });

  const historyQuery = useQuery<HistoryItem[], Error>({
    queryKey: ['analytics', 'history', rangeMonths],
    queryFn: () =>
      AnalyticsAPI.get<HistoryItem[]>('/analytics/history', {
        params: { months: rangeMonths },
      }).then((res) => res.data),
    ...commonQueryOpts,
  });

  const overviewQuery = useQuery<Overview, Error>({
    queryKey: ['analytics', 'overview'],
    queryFn: () => AnalyticsAPI.get<Overview>('/analytics/overview').then((res) => res.data),
    ...commonQueryOpts,
  });

  const perfQuery = useQuery<PerformanceResponse, Error>({
    queryKey: ['analytics', 'performance', days],
    queryFn: () =>
      AnalyticsAPI.get<PerformanceResponse>('/analytics/performance', {
        params: { days },
      }).then((res) => res.data),
    ...commonQueryOpts,
  });

  const riskQuery = useQuery<RiskResponse, Error>({
    queryKey: ['analytics', 'risk', days, benchmark],
    queryFn: () =>
      AnalyticsAPI.get<RiskResponse>('/analytics/risk', {
        params: { days, benchmark },
      }).then((res) => res.data),
    ...commonQueryOpts,
  });

  const summary = summaryQuery.data;
  const history = historyQuery.data ?? [];
  const overview = overviewQuery.data;
  const perf = perfQuery.data;
  const risk = riskQuery.data;

  const anyLoading =
    summaryQuery.isLoading ||
    historyQuery.isLoading ||
    overviewQuery.isLoading ||
    perfQuery.isLoading ||
    riskQuery.isLoading;

  const errorMsg =
    summaryQuery.error?.message ||
    historyQuery.error?.message ||
    overviewQuery.error?.message ||
    perfQuery.error?.message ||
    riskQuery.error?.message;

  const ready = Boolean(summary) && Boolean(overview) && Boolean(perf) && Boolean(risk);

  const plTone = useMemo(() => toneFromNumber(num(summary?.totalPL, 0)), [summary?.totalPL]);
  const pctTone = useMemo(
    () => toneFromNumber(num(summary?.totalPLPercent, 0)),
    [summary?.totalPLPercent],
  );

  const updatedAtMs = Math.min(
    summaryQuery.dataUpdatedAt || Number.POSITIVE_INFINITY,
    historyQuery.dataUpdatedAt || Number.POSITIVE_INFINITY,
    overviewQuery.dataUpdatedAt || Number.POSITIVE_INFINITY,
    perfQuery.dataUpdatedAt || Number.POSITIVE_INFINITY,
    riskQuery.dataUpdatedAt || Number.POSITIVE_INFINITY,
  );

  const updatedLabel = useMemo(() => {
    const ageSec = ageSecondsFromMs(updatedAtMs);
    return ageSec == null ? '—' : formatAge(ageSec);
  }, [updatedAtMs]);

  const chart = useMemo(() => {
    const gridStroke = theme.palette.divider;

    const axisTick = {
      fill: theme.palette.text.secondary,
      fontSize: 12,
      fontWeight: 600,
    } as const;

    const softTooltipStyle = {
      borderRadius: 14,
      boxShadow: theme.shadows[6],
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      padding: '10px 12px',
    } as const;

    const tooltipCursor = {
      stroke: theme.palette.text.secondary,
      strokeOpacity: 0.35,
      strokeDasharray: '4 6',
    } as const;

    return {
      gridStroke,
      axisTick,
      softTooltipStyle,
      tooltipCursor,
      primary: theme.palette.primary.main,
      textPrimary: theme.palette.text.primary,
      areaFillId: AREA_FILL_ID,
    };
  }, [theme]);

  return {
    user,

    // Controls
    rangeMonths,
    setRangeMonths,
    benchmark,
    setBenchmark,
    days,
    setDays,

    // Data
    summary,
    history,
    overview,
    perf,
    risk,

    // Status
    anyLoading,
    ready,
    errorMsg,
    updatedLabel,

    // Derived tones
    plTone,
    pctTone,

    // Formatting helpers
    num,
    money,
    pct,
    fixed,
    toneFromNumber,

    // Chart config
    chart,
  };
}

export type UseAnalyticsPageReturn = ReturnType<typeof useAnalyticsPage>;
