import type { RemoteQuote } from '@features/market-data/hooks/useQuotes';
import { QUOTE_STALE_THRESHOLD_SEC } from '../constants/positions';
import { isFiniteNumber } from './format';

export function ageSecondsFromIso(iso?: string): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  return Math.max(0, (Date.now() - ms) / 1000);
}

export function formatAge(ageSec: number): string {
  if (ageSec < 60) return `${Math.round(ageSec)}s ago`;
  const mins = Math.round(ageSec / 60);
  return `${mins}m ago`;
}

export function quoteState(q?: RemoteQuote): { state: 'fresh' | 'stale' | 'missing'; tip: string } {
  const hasPrice = q && isFiniteNumber(q.currentPrice);
  if (!hasPrice) return { state: 'missing', tip: 'Live price not available yet' };

  const ageSec = ageSecondsFromIso(q?.updatedAt);

  if (ageSec != null && ageSec > QUOTE_STALE_THRESHOLD_SEC) {
    return { state: 'stale', tip: `Updated ${formatAge(ageSec)}` };
  }

  return {
    state: 'fresh',
    tip: ageSec == null ? 'Live price available' : `Updated ${formatAge(ageSec)}`,
  };
}
