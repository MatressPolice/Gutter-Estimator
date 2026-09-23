import { describe, it, expect } from 'vitest';
import { calculatePart } from './calculations';
import { PartItem } from '../types';

describe('calculatePart', () => {
  it('should calculate typical positive numbers correctly (happy path)', () => {
    const part = {
      id: '1',
      name: 'Test Part',
      hours: 2,
      sheets: 3,
      pricePerSheet: 10,
      quantity: 5,
    } as PartItem;

    const rates = {
      hourlyRate: 50,
      overheadPercent: 10,
      profitPercent: 20,
    };

    const result = calculatePart(part, rates);

    expect(result.hoursCost).toBe(100); // 2 * 50
    expect(result.materialCosts).toBe(30); // 3 * 10
    expect(result.subTotal).toBe(130); // 100 + 30
    expect(result.overhead).toBe(13); // 130 * 0.1
    expect(result.profit).toBe(26); // 130 * 0.2
    expect(result.grandTotal).toBe(169); // 130 + 13 + 26
    expect(result.pricePerEa).toBe(33.8); // 169 / 5
  });

  it('should handle zero for part inputs and rates', () => {
    const part = {
      id: '2',
      name: 'Zero Part',
      hours: 0,
      sheets: 0,
      pricePerSheet: 0,
      quantity: 0,
    } as PartItem;

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

  it('should return pricePerEa as 0 when quantity is 0, avoiding division by zero', () => {
    const part = {
      id: '3',
      name: 'Zero Quantity Part',
      hours: 2,
      sheets: 1,
      pricePerSheet: 100,
      quantity: 0,
    } as PartItem;

    const rates = {
      hourlyRate: 50,
      overheadPercent: 10,
      profitPercent: 10,
    };

    const result = calculatePart(part, rates);

    expect(result.grandTotal).toBe(240); // (100 + 100) + 20 + 20
    expect(result.pricePerEa).toBe(0); // quantity is 0
  });

  it('should handle fractional values correctly', () => {
    const part = {
      id: '4',
      name: 'Fractional Part',
      hours: 1.5,
      sheets: 2.5,
      pricePerSheet: 10.5,
      quantity: 3,
    } as PartItem;

    const rates = {
      hourlyRate: 25.5,
      overheadPercent: 12.5,
      profitPercent: 15.5,
    };

    const result = calculatePart(part, rates);

    // hoursCost = 1.5 * 25.5 = 38.25
    // materialCosts = 2.5 * 10.5 = 26.25
    // subTotal = 38.25 + 26.25 = 64.5
    // overhead = 64.5 * 0.125 = 8.0625
    // profit = 64.5 * 0.155 = 9.9975
    // grandTotal = 64.5 + 8.0625 + 9.9975 = 82.56
    // pricePerEa = 82.56 / 3 = 27.52

    expect(result.hoursCost).toBeCloseTo(38.25);
    expect(result.materialCosts).toBeCloseTo(26.25);
    expect(result.subTotal).toBeCloseTo(64.5);
    expect(result.overhead).toBeCloseTo(8.0625);
    expect(result.profit).toBeCloseTo(9.9975);
    expect(result.grandTotal).toBeCloseTo(82.56);
    expect(result.pricePerEa).toBeCloseTo(27.52);
  });
});
