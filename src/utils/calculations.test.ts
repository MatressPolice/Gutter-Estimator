import { describe, it, expect } from 'vitest';
import { formatCurrency } from './calculations';

describe('formatCurrency', () => {
  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats positive integers correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats positive floats correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });

  it('rounds numbers correctly', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
    expect(formatCurrency(10.994)).toBe('$10.99');
  });
});
