import { describe, it, expect } from 'vitest';
import { calculateGutterShell } from './calculations';
import { GutterShellItem } from '../types';

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
