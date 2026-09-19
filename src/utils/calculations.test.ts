import { describe, it, expect } from 'vitest';
import { calculatePart } from './calculations';
import { PartItem } from '../types';

describe('calculatePart', () => {
  it('should calculate correctly for a typical part', () => {
    const part: PartItem = {
      id: '1',
      name: 'Test Part',
      hours: 2,
      sheets: 3,
      pricePerSheet: 50,
      quantity: 4,
    };

    const rates = {
      hourlyRate: 100,
      overheadPercent: 20,
      profitPercent: 10,
    };

    const result = calculatePart(part, rates);

    expect(result.hoursCost).toBe(200); // 2 * 100
    expect(result.materialCosts).toBe(150); // 3 * 50
    expect(result.subTotal).toBe(350); // 200 + 150
    expect(result.overhead).toBe(70); // 350 * 0.20
    expect(result.profit).toBe(35); // 350 * 0.10
    expect(result.grandTotal).toBe(455); // 350 + 70 + 35
    expect(result.pricePerEa).toBe(113.75); // 455 / 4
  });

  it('should handle zero quantity without dividing by zero', () => {
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
      overheadPercent: 0,
      profitPercent: 0,
    };

    const result = calculatePart(part, rates);

    expect(result.pricePerEa).toBe(0); // Should be 0 when quantity is 0
    expect(result.grandTotal).toBe(60); // 50 + 10
  });

  it('should handle zero rates correctly', () => {
    const part: PartItem = {
      id: '3',
      name: 'Zero Rates Part',
      hours: 5,
      sheets: 2,
      pricePerSheet: 20,
      quantity: 2,
    };

    const rates = {
      hourlyRate: 0,
      overheadPercent: 0,
      profitPercent: 0,
    };

    const result = calculatePart(part, rates);

    expect(result.hoursCost).toBe(0);
    expect(result.materialCosts).toBe(40);
    expect(result.subTotal).toBe(40);
    expect(result.overhead).toBe(0);
    expect(result.profit).toBe(0);
    expect(result.grandTotal).toBe(40);
    expect(result.pricePerEa).toBe(20);
  });
});
