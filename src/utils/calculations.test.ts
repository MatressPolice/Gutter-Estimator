import { describe, it, expect } from 'vitest';
import { calculateComprehensiveTotals } from './calculations';
import { Estimate, PartItem, GutterShellItem } from '../types';

describe('calculateComprehensiveTotals', () => {
  it('handles an empty estimate with no parts or shells', () => {
    const emptyEstimate = {
      id: '1',
      name: 'Empty',
      clientName: 'Client',
      quoteNumber: '001',
      date: '2023-01-01',
      hourlyRate: 100,
      overheadPercent: 10,
      profitPercent: 20,
      parts: [],
      shells: [],
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    } as Estimate;

    const result = calculateComprehensiveTotals(emptyEstimate);

    expect(result).toEqual({
      partsTotalHours: 0,
      partsTotalSheets: 0,
      partsTotalHoursCost: 0,
      partsTotalMaterialCosts: 0,
      partsTotalSubTotal: 0,
      partsTotalOverhead: 0,
      partsTotalProfit: 0,
      partsGrandTotal: 0,

      shellsTotalOrderLF: 0,
      shellsTotalCustomerLF: 0,
      shellsGrandTotal: 0,

      combinedGrandTotal: 0,
    });
  });

  it('handles an estimate where parts and shells are undefined', () => {
    const missingArraysEstimate = {
      id: '1',
      name: 'Missing Arrays',
      clientName: 'Client',
      quoteNumber: '001',
      date: '2023-01-01',
      hourlyRate: 100,
      overheadPercent: 10,
      profitPercent: 20,
      // parts and shells purposely omitted to test default `|| []` logic
    } as unknown as Estimate;

    const result = calculateComprehensiveTotals(missingArraysEstimate);

    expect(result).toEqual({
      partsTotalHours: 0,
      partsTotalSheets: 0,
      partsTotalHoursCost: 0,
      partsTotalMaterialCosts: 0,
      partsTotalSubTotal: 0,
      partsTotalOverhead: 0,
      partsTotalProfit: 0,
      partsGrandTotal: 0,

      shellsTotalOrderLF: 0,
      shellsTotalCustomerLF: 0,
      shellsGrandTotal: 0,

      combinedGrandTotal: 0,
    });
  });

  it('calculates totals correctly when only parts are present', () => {
    const part: PartItem = {
      id: 'p1',
      name: 'Part 1',
      hours: 2,
      sheets: 3,
      pricePerSheet: 10,
      quantity: 1,
    };

    const estimate: Estimate = {
      id: '1',
      name: 'Parts Only',
      clientName: 'Client',
      quoteNumber: '001',
      date: '2023-01-01',
      hourlyRate: 50,
      overheadPercent: 10,
      profitPercent: 20,
      parts: [part],
      shells: [],
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };

    const result = calculateComprehensiveTotals(estimate);

    // subTotal = (2 * 50) + (3 * 10) = 100 + 30 = 130
    // overhead = 130 * 0.10 = 13
    // profit = 130 * 0.20 = 26
    // grandTotal = 130 + 13 + 26 = 169

    expect(result.partsTotalHours).toBe(2);
    expect(result.partsTotalSheets).toBe(3);
    expect(result.partsTotalHoursCost).toBe(100);
    expect(result.partsTotalMaterialCosts).toBe(30);
    expect(result.partsTotalSubTotal).toBe(130);
    expect(result.partsTotalOverhead).toBe(13);
    expect(result.partsTotalProfit).toBe(26);
    expect(result.partsGrandTotal).toBe(169);

    expect(result.shellsTotalOrderLF).toBe(0);
    expect(result.shellsGrandTotal).toBe(0);

    expect(result.combinedGrandTotal).toBe(169);
  });

  it('calculates totals correctly when only shells are present', () => {
    const shell: GutterShellItem = {
      id: 's1',
      manufacturer: 'Mfg',
      color: 'White',
      gauge: '24 Gauge',
      pricePerSheet: 0,
      costPerLF: 2,
      orderLF: 100,
      slitCharge: 10,
      freight: 40,
      customerLF: 100,
      isCustomerCoil: false,
    };

    const estimate: Estimate = {
      id: '1',
      name: 'Shells Only',
      clientName: 'Client',
      quoteNumber: '001',
      date: '2023-01-01',
      hourlyRate: 50,
      overheadPercent: 10,
      profitPercent: 20,
      parts: [],
      shells: [shell],
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };

    const result = calculateComprehensiveTotals(estimate);

    // labor = customerLF (100) < 300 ? 7 : 6 = 7
    // subTotal = costPerLF (2) * orderLF (100) = 200
    // totalCost = subTotal (200) + slitCharge (10) + freight (40) = 250
    // totalCostLF = totalCost (250) / orderLF (100) = 2.5
    // markup = totalCostLF (2.5) * 0.43 = 1.075
    // priceChargedLF = totalCostLF (2.5) + markup (1.075) + labor (7) = 10.575
    // total = priceChargedLF (10.575) * orderLF (100) = 1057.5

    expect(result.partsGrandTotal).toBe(0);

    expect(result.shellsTotalOrderLF).toBe(100);
    expect(result.shellsTotalCustomerLF).toBe(100);
    expect(result.shellsGrandTotal).toBe(1057.5);

    expect(result.combinedGrandTotal).toBe(1057.5);
  });

  it('calculates comprehensive totals with both parts and shells', () => {
    const part: PartItem = {
      id: 'p1',
      name: 'Part 1',
      hours: 2,
      sheets: 3,
      pricePerSheet: 10,
      quantity: 1,
    };

    const shell: GutterShellItem = {
      id: 's1',
      manufacturer: 'Mfg',
      color: 'White',
      gauge: '24 Gauge',
      pricePerSheet: 0,
      costPerLF: 2,
      orderLF: 100,
      slitCharge: 10,
      freight: 40,
      customerLF: 100,
      isCustomerCoil: false,
    };

    const estimate: Estimate = {
      id: '1',
      name: 'Parts and Shells',
      clientName: 'Client',
      quoteNumber: '001',
      date: '2023-01-01',
      hourlyRate: 50,
      overheadPercent: 10,
      profitPercent: 20,
      parts: [part],
      shells: [shell],
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };

    const result = calculateComprehensiveTotals(estimate);

    // partsGrandTotal = 169
    // shellsGrandTotal = 1057.5
    // combinedGrandTotal = 169 + 1057.5 = 1226.5

    expect(result.partsGrandTotal).toBe(169);
    expect(result.shellsGrandTotal).toBe(1057.5);
    expect(result.combinedGrandTotal).toBe(1226.5);
  });

  it('handles strings properly for orderLF and customerLF values', () => {
    // Tests that Number(shell.orderLF) and Number(shell.customerLF) conversions work safely
    const shell = {
      id: 's1',
      manufacturer: 'Mfg',
      color: 'White',
      gauge: '24 Gauge',
      pricePerSheet: 0,
      costPerLF: 2,
      orderLF: '100', // string intentionally
      slitCharge: 10,
      freight: 40,
      customerLF: '200', // string intentionally
      isCustomerCoil: false,
    } as unknown as GutterShellItem;

    const estimate: Estimate = {
      id: '1',
      name: 'String Values',
      clientName: 'Client',
      quoteNumber: '001',
      date: '2023-01-01',
      hourlyRate: 50,
      overheadPercent: 10,
      profitPercent: 20,
      parts: [],
      shells: [shell],
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };

    const result = calculateComprehensiveTotals(estimate);

    expect(result.shellsTotalOrderLF).toBe(100);
    expect(result.shellsTotalCustomerLF).toBe(200);
  });
});
