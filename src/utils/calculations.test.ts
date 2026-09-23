import { describe, it, expect } from 'vitest';
import { calculatePart } from './calculations';
import type { PartItem } from '../types';

describe('calculatePart', () => {
  const defaultRates = {
    hourlyRate: 50,
    overheadPercent: 20,
    profitPercent: 10,
  };

  it('should accurately calculate totals and pricePerEa when quantity > 0', () => {
    const part: PartItem = {
      id: '1',
      name: 'Test Part',
      hours: 2, // 2 hours * 50 = 100
      sheets: 3, // 3 sheets * 20 = 60
      pricePerSheet: 20,
      quantity: 2, // grand total / 2
    };

    const result = calculatePart(part, defaultRates);

    expect(result.hoursCost).toBe(100);
    expect(result.materialCosts).toBe(60);
    expect(result.subTotal).toBe(160); // 100 + 60

    // overhead: 160 * (20 / 100) = 32
    expect(result.overhead).toBe(32);

    // profit: 160 * (10 / 100) = 16
    expect(result.profit).toBe(16);

    // grandTotal: 160 + 32 + 16 = 208
    expect(result.grandTotal).toBe(208);

    // pricePerEa: 208 / 2 = 104
    expect(result.pricePerEa).toBe(104);
  });

  it('should return pricePerEa as 0 when quantity is 0 (zero division edge case)', () => {
    const part: PartItem = {
      id: '2',
      name: 'Test Part Zero Quantity',
      hours: 2,
      sheets: 3,
      pricePerSheet: 20,
      quantity: 0, // quantity is 0, should avoid Infinity/NaN
    };

    const result = calculatePart(part, defaultRates);

    // Assert that the fallback to 0 works
    expect(result.pricePerEa).toBe(0);

    // Other calculations should remain valid
    expect(result.grandTotal).toBe(208);
  });

  it('should handle fractional percentages correctly', () => {
    const part: PartItem = {
      id: '3',
      name: 'Test Part Fractional',
      hours: 1, // 1 hour * 50 = 50
      sheets: 1, // 1 sheet * 10 = 10
      pricePerSheet: 10,
      quantity: 5,
    };

    const fractionalRates = {
      hourlyRate: 50,
      overheadPercent: 25.5,
      profitPercent: 12.5,
    };

    const result = calculatePart(part, fractionalRates);

    expect(result.subTotal).toBe(60); // 50 + 10
    expect(result.overhead).toBe(15.3); // 60 * 0.255
    expect(result.profit).toBe(7.5); // 60 * 0.125
    expect(result.grandTotal).toBe(82.8); // 60 + 15.3 + 7.5
    expect(result.pricePerEa).toBeCloseTo(16.56); // 82.8 / 5
  });
});
