import { describe, it, expect } from 'vitest';
import { formatCurrency, calculatePart, calculateEstimateTotals, calculateGutterShell } from './calculations';
import { PartItem, GutterShellItem } from '../types';

describe('formatCurrency', () => {
  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats positive integers correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats positive floats correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });

  it('rounds numbers correctly', () => {
    expect(formatCurrency(10.999)).toBe('$11.00');
    expect(formatCurrency(10.994)).toBe('$10.99');
  });
});

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

  it('should handle all zero inputs correctly', () => {
    const part: PartItem = {
      id: '4',
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

  it('should correctly calculate totals for a single part', () => {
    const parts: PartItem[] = [
      {
        id: '1',
        name: 'Part 1',
        uom: 'EA',
        hours: 2,
        sheets: 3,
        pricePerSheet: 50,
        quantity: 1,
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
      averagePricePerEa: 455,
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
        pricePerSheet: 50,
        quantity: 1,
      },
      {
        id: '2',
        name: 'Part 2',
        uom: 'EA',
        hours: 1,
        sheets: 1,
        pricePerSheet: 100,
        quantity: 2,
      },
    ];

    const result = calculateEstimateTotals(parts, defaultRates);

    expect(result).toEqual({
      totalHours: 3,
      totalSheets: 4,
      totalHoursCost: 300,
      totalMaterialCosts: 250,
      totalSubTotal: 550,
      totalOverhead: 110,
      totalProfit: 55,
      totalGrandTotal: 715,
      averagePricePerEa: 715 / 3,
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

describe('calculateGutterShell', () => {
  const baseShell: GutterShellItem = {
    id: '1',
    manufacturer: 'Test Mfg',
    color: 'White',
    gauge: '24 Gauge',
    pricePerSheet: 0,
    costPerLF: 0,
    orderLF: 100,
    slitCharge: 0,
    freight: 0,
    customerLF: 100,
    isCustomerCoil: false,
  };

  describe('when isCustomerCoil is true', () => {
    it('calculates correctly when customerLF < 300 (labor tier 7)', () => {
      const shell: GutterShellItem = {
        ...baseShell,
        isCustomerCoil: true,
        customerLF: 250, // < 300 => labor = 7
        orderLF: 300,
      };

      const result = calculateGutterShell(shell);

      expect(result.labor).toBe(7);
      expect(result.subTotal).toBe(0);
      expect(result.totalCost).toBe(0);
      expect(result.totalCostLF).toBe(0);

      const expectedMarkup = 7 * 0.43; // 3.01
      expect(result.markup).toBeCloseTo(expectedMarkup);

      const expectedPriceChargedLF = 7 + expectedMarkup; // 10.01
      expect(result.priceChargedLF).toBeCloseTo(expectedPriceChargedLF);

      const expectedTotal = expectedPriceChargedLF * 300; // 3003
      expect(result.total).toBeCloseTo(expectedTotal);

      const expectedCustomerLFS = expectedTotal / 250; // 12.012
      expect(result.customerLFS).toBeCloseTo(expectedCustomerLFS);
    });

    it('calculates correctly when customerLF >= 300 (labor tier 6)', () => {
      const shell: GutterShellItem = {
        ...baseShell,
        isCustomerCoil: true,
        customerLF: 350, // >= 300 => labor = 6
        orderLF: 400,
      };

      const result = calculateGutterShell(shell);

      expect(result.labor).toBe(6);

      const expectedMarkup = 6 * 0.43; // 2.58
      expect(result.markup).toBeCloseTo(expectedMarkup);

      const expectedPriceChargedLF = 6 + expectedMarkup; // 8.58
      expect(result.priceChargedLF).toBeCloseTo(expectedPriceChargedLF);

      const expectedTotal = expectedPriceChargedLF * 400; // 3432
      expect(result.total).toBeCloseTo(expectedTotal);

      const expectedCustomerLFS = expectedTotal / 350; // 9.8057...
      expect(result.customerLFS).toBeCloseTo(expectedCustomerLFS);
    });

    it('handles customerLF = 0 gracefully (customerLFS should be 0)', () => {
      const shell: GutterShellItem = {
        ...baseShell,
        isCustomerCoil: true,
        customerLF: 0,
        orderLF: 100,
      };

      const result = calculateGutterShell(shell);
      expect(result.customerLFS).toBe(0);
    });
  });

  describe('when isCustomerCoil is false', () => {
    it('uses pricePerSheet / 20 for costPerLF when pricePerSheet > 0 and customerLF < 300', () => {
      const shell: GutterShellItem = {
        ...baseShell,
        isCustomerCoil: false,
        pricePerSheet: 40, // overrides costPerLF to 40 / 20 = 2
        costPerLF: 1, // should be ignored
        orderLF: 100,
        slitCharge: 50,
        freight: 50,
        customerLF: 250, // < 300 => labor = 7
      };

      const result = calculateGutterShell(shell);

      expect(result.labor).toBe(7);

      const expectedCostPerLF = 2; // 40 / 20
      const expectedSubTotal = expectedCostPerLF * 100; // 200
      expect(result.subTotal).toBe(expectedSubTotal);

      const expectedTotalCost = expectedSubTotal + 50 + 50; // 300
      expect(result.totalCost).toBe(expectedTotalCost);

      const expectedTotalCostLF = expectedTotalCost / 100; // 3
      expect(result.totalCostLF).toBe(expectedTotalCostLF);

      const expectedMarkup = expectedTotalCostLF * 0.43; // 3 * 0.43 = 1.29
      expect(result.markup).toBeCloseTo(expectedMarkup);

      const expectedPriceChargedLF = expectedTotalCostLF + expectedMarkup + 7; // 3 + 1.29 + 7 = 11.29
      expect(result.priceChargedLF).toBeCloseTo(expectedPriceChargedLF);

      const expectedTotal = expectedPriceChargedLF * 100; // 1129
      expect(result.total).toBeCloseTo(expectedTotal);

      const expectedCustomerLFS = expectedTotal / 250; // 1129 / 250 = 4.516
      expect(result.customerLFS).toBeCloseTo(expectedCustomerLFS);
    });

    it('uses costPerLF directly when pricePerSheet is 0 and customerLF >= 300', () => {
      const shell: GutterShellItem = {
        ...baseShell,
        isCustomerCoil: false,
        pricePerSheet: 0,
        costPerLF: 3, // used since pricePerSheet is 0
        orderLF: 200,
        slitCharge: 0,
        freight: 100,
        customerLF: 300, // >= 300 => labor = 6
      };

      const result = calculateGutterShell(shell);

      expect(result.labor).toBe(6);

      const expectedSubTotal = 3 * 200; // 600
      expect(result.subTotal).toBe(expectedSubTotal);

      const expectedTotalCost = expectedSubTotal + 0 + 100; // 700
      expect(result.totalCost).toBe(expectedTotalCost);

      const expectedTotalCostLF = expectedTotalCost / 200; // 3.5
      expect(result.totalCostLF).toBe(expectedTotalCostLF);

      const expectedMarkup = expectedTotalCostLF * 0.43; // 3.5 * 0.43 = 1.505
      expect(result.markup).toBeCloseTo(expectedMarkup);

      const expectedPriceChargedLF = expectedTotalCostLF + expectedMarkup + 6; // 3.5 + 1.505 + 6 = 11.005
      expect(result.priceChargedLF).toBeCloseTo(expectedPriceChargedLF);

      const expectedTotal = expectedPriceChargedLF * 200; // 2201
      expect(result.total).toBeCloseTo(expectedTotal);

      const expectedCustomerLFS = expectedTotal / 300; // 2201 / 300 = 7.3366...
      expect(result.customerLFS).toBeCloseTo(expectedCustomerLFS);
    });

    it('handles orderLF = 0 gracefully (totalCostLF should be 0)', () => {
      const shell: GutterShellItem = {
        ...baseShell,
        isCustomerCoil: false,
        pricePerSheet: 20,
        orderLF: 0,
        slitCharge: 10,
        freight: 10,
        customerLF: 100, // labor 7
      };

      const result = calculateGutterShell(shell);

      expect(result.subTotal).toBe(0); // 1 * 0
      expect(result.totalCost).toBe(20); // 0 + 10 + 10
      expect(result.totalCostLF).toBe(0); // avoided division by zero
      expect(result.markup).toBe(0); // 0 * 0.43
      expect(result.priceChargedLF).toBe(7); // 0 + 0 + 7
      expect(result.total).toBe(0); // 7 * 0
      expect(result.customerLFS).toBe(0); // 0 / 100
    });

    it('handles customerLF = 0 gracefully (customerLFS should be 0)', () => {
      const shell: GutterShellItem = {
        ...baseShell,
        isCustomerCoil: false,
        costPerLF: 5,
        orderLF: 100,
        customerLF: 0,
      };

      const result = calculateGutterShell(shell);
      expect(result.customerLFS).toBe(0);
    });
  });
});
