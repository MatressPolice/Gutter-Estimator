import { describe, it, expect } from 'vitest';
import { calculateGutterShell } from './calculations';
import { GutterShellItem } from '../types';

describe('calculateGutterShell', () => {
  const baseShell: GutterShellItem = {
    id: '1',
    manufacturer: 'Acme',
    color: 'White',
    gauge: '24 Gauge',
    pricePerSheet: 0,
    costPerLF: 1.5,
    orderLF: 100,
    slitCharge: 10,
    freight: 20,
    customerLF: 150, // labor = 7
  };

  it('handles isCustomerCoil = true when customerLF > 0', () => {
    const shell = { ...baseShell, isCustomerCoil: true };
    const result = calculateGutterShell(shell);

    const expectedLabor = 7; // customerLF < 300
    const expectedMarkup = expectedLabor * 0.43; // 3.01
    const expectedPriceChargedLF = expectedLabor + expectedMarkup; // 10.01
    const expectedTotal = expectedPriceChargedLF * shell.orderLF; // 1001.0
    const expectedCustomerLFS = expectedTotal / shell.customerLF; // 1001.0 / 150

    expect(result.subTotal).toBe(0);
    expect(result.totalCost).toBe(0);
    expect(result.totalCostLF).toBe(0);
    expect(result.labor).toBe(expectedLabor);
    expect(result.markup).toBeCloseTo(expectedMarkup, 5);
    expect(result.priceChargedLF).toBeCloseTo(expectedPriceChargedLF, 5);
    expect(result.total).toBeCloseTo(expectedTotal, 5);
    expect(result.customerLFS).toBeCloseTo(expectedCustomerLFS, 5);
  });

  it('handles isCustomerCoil = true when customerLF = 0', () => {
    const shell = { ...baseShell, isCustomerCoil: true, customerLF: 0 };
    const result = calculateGutterShell(shell);
    expect(result.customerLFS).toBe(0); // Prevents divide by zero
    expect(result.labor).toBe(7);
  });

  it('handles isCustomerCoil = false and pricePerSheet > 0 (overrides costPerLF)', () => {
    const shell = { ...baseShell, pricePerSheet: 40, costPerLF: 0.5, customerLF: 350 };
    // labor = 6 since customerLF >= 300
    const result = calculateGutterShell(shell);

    const expectedLabor = 6;
    const expectedCostPerLF = shell.pricePerSheet / 20; // 40 / 20 = 2.0
    const expectedSubTotal = expectedCostPerLF * shell.orderLF; // 2.0 * 100 = 200
    const expectedTotalCost = expectedSubTotal + shell.slitCharge + shell.freight; // 200 + 10 + 20 = 230
    const expectedTotalCostLF = expectedTotalCost / shell.orderLF; // 230 / 100 = 2.3
    const expectedMarkup = expectedTotalCostLF * 0.43; // 2.3 * 0.43 = 0.989
    const expectedPriceChargedLF = expectedTotalCostLF + expectedMarkup + expectedLabor; // 2.3 + 0.989 + 6 = 9.289
    const expectedTotal = expectedPriceChargedLF * shell.orderLF; // 9.289 * 100 = 928.9
    const expectedCustomerLFS = expectedTotal / shell.customerLF; // 928.9 / 350

    expect(result.labor).toBe(expectedLabor);
    expect(result.subTotal).toBe(expectedSubTotal);
    expect(result.totalCost).toBe(expectedTotalCost);
    expect(result.totalCostLF).toBe(expectedTotalCostLF);
    expect(result.markup).toBeCloseTo(expectedMarkup, 5);
    expect(result.priceChargedLF).toBeCloseTo(expectedPriceChargedLF, 5);
    expect(result.total).toBeCloseTo(expectedTotal, 5);
    expect(result.customerLFS).toBeCloseTo(expectedCustomerLFS, 5);
  });

  it('handles isCustomerCoil = false and pricePerSheet <= 0 (uses costPerLF)', () => {
    const shell = { ...baseShell, pricePerSheet: 0, costPerLF: 1.5, customerLF: 350 };
    const result = calculateGutterShell(shell);

    const expectedCostPerLF = shell.costPerLF; // 1.5
    const expectedSubTotal = expectedCostPerLF * shell.orderLF; // 1.5 * 100 = 150
    const expectedTotalCost = expectedSubTotal + shell.slitCharge + shell.freight; // 150 + 10 + 20 = 180

    expect(result.subTotal).toBe(expectedSubTotal);
    expect(result.totalCost).toBe(expectedTotalCost);
  });

  it('handles orderLF = 0 safely', () => {
    const shell = { ...baseShell, orderLF: 0, costPerLF: 1.5, isCustomerCoil: false };
    const result = calculateGutterShell(shell);

    expect(result.subTotal).toBe(0);
    expect(result.totalCost).toBe(0 + shell.slitCharge + shell.freight); // 30
    expect(result.totalCostLF).toBe(0); // Prevents divide by zero
  });
});
