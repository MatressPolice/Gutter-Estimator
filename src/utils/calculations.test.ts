import { describe, it, expect } from 'vitest';
import { calculatePart } from './calculations';
import { PartItem } from '../types';

describe('calculatePart', () => {
  it('calculates correctly for normal inputs', () => {
    const part: PartItem = {
      id: 'p1',
      name: 'Part 1',
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
    // materialCosts = 3 * 10 = 30
    // subTotal = 100 + 30 = 130
    // overhead = 130 * 0.2 = 26
    // profit = 130 * 0.1 = 13
    // grandTotal = 130 + 26 + 13 = 169
    // pricePerEa = 169 / 5 = 33.8

    expect(result).toEqual({
      hoursCost: 100,
      materialCosts: 30,
      subTotal: 130,
      overhead: 26,
      profit: 13,
      grandTotal: 169,
      pricePerEa: 33.8,
    });
  });

  it('handles zero quantity by setting pricePerEa to 0', () => {
    const part: PartItem = {
      id: 'p2',
      name: 'Part 2',
      hours: 2,
      sheets: 3,
      pricePerSheet: 10,
      quantity: 0,
    };
    const rates = {
      hourlyRate: 50,
      overheadPercent: 20,
      profitPercent: 10,
    };

    const result = calculatePart(part, rates);

    expect(result.pricePerEa).toBe(0);
    expect(result.grandTotal).toBe(169); // Grand total still calculates normally
  });

  it('handles zero inputs (hours, sheets, pricePerSheet)', () => {
    const part: PartItem = {
      id: 'p3',
      name: 'Part 3',
      hours: 0,
      sheets: 0,
      pricePerSheet: 0,
      quantity: 5,
    };
    const rates = {
      hourlyRate: 50,
      overheadPercent: 20,
      profitPercent: 10,
    };

    const result = calculatePart(part, rates);

    expect(result).toEqual({
      hoursCost: 0,
      materialCosts: 0,
      subTotal: 0,
      overhead: 0,
      profit: 0,
      grandTotal: 0,
      pricePerEa: 0,
    });
  });

  it('handles zero rates', () => {
    const part: PartItem = {
      id: 'p4',
      name: 'Part 4',
      hours: 2,
      sheets: 3,
      pricePerSheet: 10,
      quantity: 5,
    };
    const rates = {
      hourlyRate: 0,
      overheadPercent: 0,
      profitPercent: 0,
    };

    const result = calculatePart(part, rates);

    // hoursCost = 2 * 0 = 0
    // materialCosts = 3 * 10 = 30
    // subTotal = 0 + 30 = 30
    // overhead = 30 * 0 = 0
    // profit = 30 * 0 = 0
    // grandTotal = 30 + 0 + 0 = 30
    // pricePerEa = 30 / 5 = 6

    expect(result).toEqual({
      hoursCost: 0,
      materialCosts: 30,
      subTotal: 30,
      overhead: 0,
      profit: 0,
      grandTotal: 30,
      pricePerEa: 6,
    });
  });
});
