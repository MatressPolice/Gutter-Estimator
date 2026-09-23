import { describe, it, expect } from 'vitest';
import { calculatePart } from './calculations';
import type { PartItem } from '../types';

describe('calculatePart', () => {
  it('should calculate correctly with standard inputs', () => {
    const part: PartItem = {
      id: '1',
      name: 'Test Part',
      hours: 2,
      sheets: 3,
      pricePerSheet: 10,
      quantity: 5,
    };
    const rates = {
      hourlyRate: 50,
      overheadPercent: 20,
      profitPercent: 10,
    };

    const result = calculatePart(part, rates);

    // hoursCost = 2 * 50 = 100
    expect(result.hoursCost).toBe(100);
    // materialCosts = 3 * 10 = 30
    expect(result.materialCosts).toBe(30);
    // subTotal = 100 + 30 = 130
    expect(result.subTotal).toBe(130);
    // overhead = 130 * 0.20 = 26
    expect(result.overhead).toBe(26);
    // profit = 130 * 0.10 = 13
    expect(result.profit).toBe(13);
    // grandTotal = 130 + 26 + 13 = 169
    expect(result.grandTotal).toBe(169);
    // pricePerEa = 169 / 5 = 33.8
    expect(result.pricePerEa).toBe(33.8);
  });

  it('should handle zero quantity without division by zero', () => {
    const part: PartItem = {
      id: '2',
      name: 'Zero Quantity Part',
      hours: 1,
      sheets: 1,
      pricePerSheet: 10,
      quantity: 0,
    };
    const rates = {
      hourlyRate: 50,
      overheadPercent: 20,
      profitPercent: 10,
    };

    const result = calculatePart(part, rates);

    expect(result.subTotal).toBe(60);
    expect(result.grandTotal).toBe(78); // 60 + 12 (overhead) + 6 (profit)
    // Division by zero would result in Infinity or NaN, but the code checks quantity > 0
    expect(result.pricePerEa).toBe(0);
  });

  it('should handle all zero inputs correctly', () => {
    const part: PartItem = {
      id: '3',
      name: 'Zero Input Part',
      hours: 0,
      sheets: 0,
      pricePerSheet: 0,
      quantity: 0,
    };
    const rates = {
      hourlyRate: 0,
      overheadPercent: 0,
      profitPercent: 0,
    };

    const result = calculatePart(part, rates);

    expect(result.hoursCost).toBe(0);
    expect(result.materialCosts).toBe(0);
    expect(result.subTotal).toBe(0);
    expect(result.overhead).toBe(0);
    expect(result.profit).toBe(0);
    expect(result.grandTotal).toBe(0);
    expect(result.pricePerEa).toBe(0);
  });
});
