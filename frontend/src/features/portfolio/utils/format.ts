import type { Tone } from '../types/tone';

export function toneFromNumber(val: number): Tone {
  if (val > 0) return 'positive';
  if (val < 0) return 'negative';
  return 'neutral';
}

export function isFiniteNumber(val: unknown): val is number {
  return typeof val === 'number' && Number.isFinite(val);
}

export function normalizeSymbol(sym: string): string {
  return sym.trim().toUpperCase();
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function money(n: number): string {
  return usd.format(n);
}

export function tableCellMoney(v: number | null | undefined): string {
  if (!isFiniteNumber(v)) return '—';
  return money(v);
}
