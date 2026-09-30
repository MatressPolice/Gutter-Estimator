import { describe, it, expect } from 'vitest';
import { calculatePart } from './calculations';
import { PartItem } from '../types';

describe('calculatePart', () => {
  it('should calculate correctly for typical inputs', () => {
    const part: PartItem = {
      id: '1',
      name: 'Test Part',
      hours: 2,
      sheets: 3,
      pricePerSheet: 10,
      quantity: 5,
    };
    const rates = { hourlyRate: 50, overheadPercent: 10, profitPercent: 20 };

    const result = calculatePart(part, rates);

    expect(result.hoursCost).toBe(100); // 2 * 50
    expect(result.materialCosts).toBe(30); // 3 * 10
    expect(result.subTotal).toBe(130); // 100 + 30
    expect(result.overhead).toBe(13); // 130 * 0.1
    expect(result.profit).toBe(26); // 130 * 0.2
    expect(result.grandTotal).toBe(169); // 130 + 13 + 26
    expect(result.pricePerEa).toBe(33.8); // 169 / 5
  });

  it('should handle zero quantity without returning Infinity or NaN', () => {
    const part: PartItem = {
      id: '2',
      name: 'Zero Quantity Part',
      hours: 2,
      sheets: 3,
      pricePerSheet: 10,
      quantity: 0,
    };
    const rates = { hourlyRate: 50, overheadPercent: 10, profitPercent: 20 };

    const result = calculatePart(part, rates);

    expect(result.grandTotal).toBe(169); // Grand total is still calculated
    expect(result.pricePerEa).toBe(0); // Price per ea is 0 when quantity is 0
  });

  it('should handle zero hours and sheets', () => {
    const part: PartItem = {
      id: '3',
      name: 'Zero Inputs Part',
      hours: 0,
      sheets: 0,
      pricePerSheet: 10,
      quantity: 5,
    };
    const rates = { hourlyRate: 50, overheadPercent: 10, profitPercent: 20 };

    const result = calculatePart(part, rates);

    expect(result.hoursCost).toBe(0);
    expect(result.materialCosts).toBe(0);
    expect(result.subTotal).toBe(0);
    expect(result.overhead).toBe(0);
    expect(result.profit).toBe(0);
    expect(result.grandTotal).toBe(0);
    expect(result.pricePerEa).toBe(0);
  });

  it('should handle zero rates', () => {
    const part: PartItem = {
      id: '4',
      name: 'Zero Rates Part',
      hours: 2,
      sheets: 3,
      pricePerSheet: 10,
      quantity: 5,
    };
    const rates = { hourlyRate: 0, overheadPercent: 0, profitPercent: 0 };

    const result = calculatePart(part, rates);

    expect(result.hoursCost).toBe(0); // 2 * 0
    expect(result.materialCosts).toBe(30); // 3 * 10
    expect(result.subTotal).toBe(30); // 0 + 30
    expect(result.overhead).toBe(0); // 30 * 0
    expect(result.profit).toBe(0); // 30 * 0
    expect(result.grandTotal).toBe(30); // 30 + 0 + 0
    expect(result.pricePerEa).toBe(6); // 30 / 5
  });
});
