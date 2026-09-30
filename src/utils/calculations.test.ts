import { describe, it, expect } from 'vitest';
import { calculateEstimateTotals } from './calculations';
import { PartItem } from '../types';

describe('calculateEstimateTotals', () => {
  const defaultRates = {
    hourlyRate: 100,
    overheadPercent: 10,
    profitPercent: 20,
  };

  it('should return all zeroes for an empty parts array', () => {
    const totals = calculateEstimateTotals([], defaultRates);
    expect(totals).toEqual({
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

  it('should calculate totals correctly for a single part', () => {
    const parts: PartItem[] = [
      {
        id: '1',
        name: 'Part 1',
        hours: 2,
        sheets: 3,
        pricePerSheet: 50,
        quantity: 5,
      },
    ];

    const totals = calculateEstimateTotals(parts, defaultRates);

    // Expected values based on calculatePart logic:
    // hoursCost = 2 * 100 = 200
    // materialCosts = 3 * 50 = 150
    // subTotal = 200 + 150 = 350
    // overhead = 350 * 0.10 = 35
    // profit = 350 * 0.20 = 70
    // grandTotal = 350 + 35 + 70 = 455
    // totalQuantity = 5
    // averagePricePerEa = 455 / 5 = 91

    expect(totals).toEqual({
      totalHours: 2,
      totalSheets: 3,
      totalHoursCost: 200,
      totalMaterialCosts: 150,
      totalSubTotal: 350,
      totalOverhead: 35,
      totalProfit: 70,
      totalGrandTotal: 455,
      averagePricePerEa: 91,
    });
  });

  it('should aggregate totals correctly for multiple parts', () => {
    const parts: PartItem[] = [
      {
        id: '1',
        name: 'Part 1',
        hours: 2,
        sheets: 3,
        pricePerSheet: 50,
        quantity: 5,
      }, // grandTotal: 455
      {
        id: '2',
        name: 'Part 2',
        hours: 1, // hoursCost: 100
        sheets: 2, // materialCosts: 100, pricePerSheet = 50
        pricePerSheet: 50,
        quantity: 2, // subTotal: 200, overhead: 20, profit: 40, grandTotal: 260
      },
    ];

    const totals = calculateEstimateTotals(parts, defaultRates);

    // Expected aggregated values:
    // totalHours = 2 + 1 = 3
    // totalSheets = 3 + 2 = 5
    // totalHoursCost = 200 + 100 = 300
    // totalMaterialCosts = 150 + 100 = 250
    // totalSubTotal = 350 + 200 = 550
    // totalOverhead = 35 + 20 = 55
    // totalProfit = 70 + 40 = 110
    // totalGrandTotal = 455 + 260 = 715
    // totalQuantity = 5 + 2 = 7
    // averagePricePerEa = 715 / 7 = 102.14285714285714

    expect(totals).toEqual({
      totalHours: 3,
      totalSheets: 5,
      totalHoursCost: 300,
      totalMaterialCosts: 250,
      totalSubTotal: 550,
      totalOverhead: 55,
      totalProfit: 110,
      totalGrandTotal: 715,
      averagePricePerEa: 715 / 7,
    });
  });

  it('should correctly handle averagePricePerEa when total quantity is 0', () => {
    const parts: PartItem[] = [
      {
        id: '1',
        name: 'Part 1',
        hours: 2,
        sheets: 3,
        pricePerSheet: 50,
        quantity: 0,
      },
    ];

    const totals = calculateEstimateTotals(parts, defaultRates);

    expect(totals.averagePricePerEa).toBe(0);
    expect(totals.totalGrandTotal).toBe(455);
  });
});
