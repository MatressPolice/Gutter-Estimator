import { describe, it, expect } from 'vitest';
import { calculateEstimateTotals } from './calculations';
import { PartItem } from '../types';

describe('calculateEstimateTotals', () => {
  const defaultRates = {
    hourlyRate: 100,
    overheadPercent: 20,
    profitPercent: 10,
  };

  it('should handle an empty parts array correctly', () => {
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

  it('should handle parts with zero quantities avoiding division by zero', () => {
    const partsWithZeroQuantities: PartItem[] = [
      {
        id: '1',
        name: 'Part 1',
        uom: 'EA',
        hours: 1,
        sheets: 1,
        pricePerSheet: 50,
        quantity: 0,
      },
      {
        id: '2',
        name: 'Part 2',
        uom: 'EA',
        hours: 2,
        sheets: 2,
        pricePerSheet: 50,
        quantity: 0,
      },
    ];

    const result = calculateEstimateTotals(partsWithZeroQuantities, defaultRates);

    // We expect the totals to accumulate, but averagePricePerEa should remain 0
    expect(result.averagePricePerEa).toBe(0);

    // Verify other totals calculate correctly even if quantities are 0
    // Part 1: hoursCost = 100, materialCost = 50, subTotal = 150, overhead = 30, profit = 15, grandTotal = 195
    // Part 2: hoursCost = 200, materialCost = 100, subTotal = 300, overhead = 60, profit = 30, grandTotal = 390
    // Totals: hours = 3, sheets = 3, hoursCost = 300, materialCost = 150, subTotal = 450, overhead = 90, profit = 45, grandTotal = 585
    expect(result.totalHours).toBe(3);
    expect(result.totalSheets).toBe(3);
    expect(result.totalHoursCost).toBe(300);
    expect(result.totalMaterialCosts).toBe(150);
    expect(result.totalSubTotal).toBe(450);
    expect(result.totalOverhead).toBe(90);
    expect(result.totalProfit).toBe(45);
    expect(result.totalGrandTotal).toBe(585);
  });
});
