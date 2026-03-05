import { isFiniteNumber, money, normalizeSymbol, tableCellMoney, toneFromNumber } from '../format';

describe('portfolio utils: format', () => {
  test('toneFromNumber returns positive/negative/neutral', () => {
    expect(toneFromNumber(1)).toBe('positive');
    expect(toneFromNumber(0)).toBe('neutral');
    expect(toneFromNumber(-0)).toBe('neutral');
    expect(toneFromNumber(-1)).toBe('negative');
  });

  test('isFiniteNumber is a safe type guard', () => {
    expect(isFiniteNumber(0)).toBe(true);
    expect(isFiniteNumber(123.45)).toBe(true);
    expect(isFiniteNumber(-10)).toBe(true);

    expect(isFiniteNumber(Number.NaN)).toBe(false);
    expect(isFiniteNumber(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isFiniteNumber(Number.NEGATIVE_INFINITY)).toBe(false);

    expect(isFiniteNumber('1')).toBe(false);
    expect(isFiniteNumber(null)).toBe(false);
    expect(isFiniteNumber(undefined)).toBe(false);
    expect(isFiniteNumber({})).toBe(false);
  });

  test('normalizeSymbol trims and uppercases', () => {
    expect(normalizeSymbol(' aapl ')).toBe('AAPL');
    expect(normalizeSymbol('btc-usd')).toBe('BTC-USD');
    expect(normalizeSymbol('   ')).toBe('');
  });

  test('money uses USD currency formatting (stable via Intl)', () => {
    const expected = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      1234.56,
    );

    expect(money(1234.56)).toBe(expected);
    expect(money(0)).toBe(
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(0),
    );
  });

  test('tableCellMoney returns em dash for null/undefined/non-finite', () => {
    expect(tableCellMoney(null)).toBe('—');
    expect(tableCellMoney(undefined)).toBe('—');
    expect(tableCellMoney(Number.NaN)).toBe('—');
    expect(tableCellMoney(Number.POSITIVE_INFINITY)).toBe('—');
  });

  test('tableCellMoney formats finite numbers', () => {
    const expected = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      10,
    );
    expect(tableCellMoney(10)).toBe(expected);
  });
});
