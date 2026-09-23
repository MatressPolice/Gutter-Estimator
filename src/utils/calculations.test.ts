import { describe, it, expect } from 'vitest';
import { calculateEstimateTotals } from './calculations';
import { PartItem } from '../types';

describe('calculateEstimateTotals', () => {
  const defaultRates = {
    hourlyRate: 100,
    overheadPercent: 20,
    profitPercent: 10,
  };

  it('should return all zeros for an empty parts array', () => {
    const result = calculateEstimateTotals([], defaultRates);

    expect(result).toEqual({
      totalHours: 0,
      totalSheets: 0,
      totalHoursCost: 0,
      totalMaterialCosts: 0,
      totalSubTotal: 0,
      totalOverhead: 0,
      totalProfit: 0,
      totalGrandTotal: 0,
      averagePricePerEa: 0,
    });
  });

  it('should correctly calculate totals for a single part', () => {
    const parts: PartItem[] = [
      {
        id: '1',
        name: 'Part 1',
        uom: 'EA',
        hours: 2,
        sheets: 3,
        pricePerSheet: 50, // materialCost: 3 * 50 = 150
        quantity: 1, // hoursCost: 2 * 100 = 200, subTotal: 150 + 200 = 350, overhead: 350 * 0.2 = 70, profit: 350 * 0.1 = 35, grandTotal: 350 + 70 + 35 = 455
      },
    ];

    const result = calculateEstimateTotals(parts, defaultRates);

    expect(result).toEqual({
      totalHours: 2,
      totalSheets: 3,
      totalHoursCost: 200,
      totalMaterialCosts: 150,
      totalSubTotal: 350,
      totalOverhead: 70,
      totalProfit: 35,
      totalGrandTotal: 455,
      averagePricePerEa: 455, // grandTotal / quantity = 455 / 1
    });
  });

  it('should correctly calculate totals for multiple parts', () => {
    const parts: PartItem[] = [
      {
        id: '1',
        name: 'Part 1',
        uom: 'EA',
        hours: 2,
        sheets: 3,
        pricePerSheet: 50, // sub: 350, oh: 70, prof: 35, grand: 455
        quantity: 1,
      },
      {
        id: '2',
        name: 'Part 2',
        uom: 'EA',
        hours: 1, // hoursCost: 100
        sheets: 1,
        pricePerSheet: 100, // materialCost: 100
        quantity: 2, // sub: 200, oh: 40, prof: 20, grand: 260
      },
    ];

    const result = calculateEstimateTotals(parts, defaultRates);

    expect(result).toEqual({
      totalHours: 3, // 2 + 1
      totalSheets: 4, // 3 + 1
      totalHoursCost: 300, // 200 + 100
      totalMaterialCosts: 250, // 150 + 100
      totalSubTotal: 550, // 350 + 200
      totalOverhead: 110, // 70 + 40
      totalProfit: 55, // 35 + 20
      totalGrandTotal: 715, // 455 + 260
      averagePricePerEa: 715 / 3, // 715 / (1 + 2)
    });
  });

  it('should handle zero quantities safely (avoiding NaN or Infinity)', () => {
    const parts: PartItem[] = [
      {
        id: '1',
        name: 'Zero Quantity Part',
        uom: 'EA',
        hours: 1, // hoursCost: 100
        sheets: 0, // materialCost: 0
        pricePerSheet: 0,
        quantity: 0, // total sub: 100, oh: 20, prof: 10, grand: 130
      },
    ];

    const result = calculateEstimateTotals(parts, defaultRates);

    expect(result).toEqual({
      totalHours: 1,
      totalSheets: 0,
      totalHoursCost: 100,
      totalMaterialCosts: 0,
      totalSubTotal: 100,
      totalOverhead: 20,
      totalProfit: 10,
      totalGrandTotal: 130,
      averagePricePerEa: 0, // Should be 0 since total quantity is 0
    });
  });
});
