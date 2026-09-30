import { describe, it, expect } from 'vitest';
import { formatCurrency } from './calculations';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(50)).toBe('$50.00');
    expect(formatCurrency(0.99)).toBe('$0.99');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('handles rounding behavior', () => {
    // Should round down
    expect(formatCurrency(1.234)).toBe('$1.23');
    // Should round up
    expect(formatCurrency(1.235)).toBe('$1.24');
    expect(formatCurrency(1.236)).toBe('$1.24');
  });
});
