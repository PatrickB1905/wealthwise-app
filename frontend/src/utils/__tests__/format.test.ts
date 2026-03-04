import {
  isFiniteNumber,
  money,
  normalizeSymbol,
  tableCellMoney,
  toneFromNumber,
} from '@features/portfolio/utils/format';

describe('portfolio/utils/format', () => {
  describe('toneFromNumber', () => {
    it('returns positive for > 0', () => {
      expect(toneFromNumber(0.0001)).toBe('positive');
    });

    it('returns negative for < 0', () => {
      expect(toneFromNumber(-0.0001)).toBe('negative');
    });

    it('returns neutral for 0', () => {
      expect(toneFromNumber(0)).toBe('neutral');
    });
  });

  describe('isFiniteNumber', () => {
    it('accepts finite numbers', () => {
      expect(isFiniteNumber(0)).toBe(true);
      expect(isFiniteNumber(1.23)).toBe(true);
      expect(isFiniteNumber(-10)).toBe(true);
    });

    it('rejects non-numbers and non-finite numbers', () => {
      expect(isFiniteNumber(NaN)).toBe(false);
      expect(isFiniteNumber(Infinity)).toBe(false);
      expect(isFiniteNumber(-Infinity)).toBe(false);
      expect(isFiniteNumber('1')).toBe(false);
      expect(isFiniteNumber(null)).toBe(false);
      expect(isFiniteNumber(undefined)).toBe(false);
      expect(isFiniteNumber({})).toBe(false);
    });
  });

  describe('normalizeSymbol', () => {
    it('trims and uppercases', () => {
      expect(normalizeSymbol(' aapl ')).toBe('AAPL');
      expect(normalizeSymbol('\nTsLa\t')).toBe('TSLA');
    });
  });

  describe('money', () => {
    it('formats USD currency with Intl.NumberFormat', () => {
      expect(money(12)).toContain('$');
      expect(money(12)).toContain('12');
    });
  });

  describe('tableCellMoney', () => {
    it('returns em dash for null/undefined/non-finite', () => {
      expect(tableCellMoney(null)).toBe('—');
      expect(tableCellMoney(undefined)).toBe('—');
      expect(tableCellMoney(NaN)).toBe('—');
      expect(tableCellMoney(Infinity)).toBe('—');
    });

    it('formats valid numbers as USD', () => {
      const out = tableCellMoney(99.5);
      expect(out).toContain('$');
      expect(out).toContain('99');
    });
  });
});
