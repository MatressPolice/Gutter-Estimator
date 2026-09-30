import { describe, it, expect } from 'vitest';
import { calculateGutterShell } from './calculations';
import { GutterShellItem } from '../types';

describe('calculateGutterShell', () => {
  const createShellItem = (overrides?: Partial<GutterShellItem>): GutterShellItem => ({
    id: 'test-1',
    manufacturer: 'Test Mfg',
    color: 'White',
    gauge: '24 Gauge',
    pricePerSheet: 0,
    costPerLF: 0,
    orderLF: 0,
    slitCharge: 0,
    freight: 0,
    customerLF: 0,
    isCustomerCoil: false,
    ...overrides,
  });

  it('should use labor 7 when customerLF < 300', () => {
    const item = createShellItem({ customerLF: 299 });
    const result = calculateGutterShell(item);
    expect(result.labor).toBe(7);
  });

  it('should use labor 6 when customerLF >= 300', () => {
    const item = createShellItem({ customerLF: 300 });
    const result = calculateGutterShell(item);
    expect(result.labor).toBe(6);
  });

  describe('isCustomerCoil true', () => {
    it('should set costs to 0 and calculate markup based on labor (customerLF < 300)', () => {
      const item = createShellItem({
        isCustomerCoil: true,
        customerLF: 100, // labor = 7
        orderLF: 50,
      });
      const result = calculateGutterShell(item);

      expect(result.subTotal).toBe(0);
      expect(result.totalCost).toBe(0);
      expect(result.totalCostLF).toBe(0);

      expect(result.labor).toBe(7);
      expect(result.markup).toBeCloseTo(7 * 0.43); // 3.01

      const priceChargedLF = 7 + 7 * 0.43; // 10.01
      expect(result.priceChargedLF).toBeCloseTo(priceChargedLF);

      const total = priceChargedLF * 50; // 500.5
      expect(result.total).toBeCloseTo(total);

      expect(result.customerLFS).toBeCloseTo(total / 100); // 5.005
    });

    it('should handle customerLF === 0 gracefully (no division by zero for customerLFS)', () => {
      const item = createShellItem({
        isCustomerCoil: true,
        customerLF: 0,
        orderLF: 50,
      });
      const result = calculateGutterShell(item);
      expect(result.customerLFS).toBe(0);
    });
  });

  describe('isCustomerCoil falsy (standard calculation)', () => {
    it('should calculate standard values using costPerLF when pricePerSheet is 0', () => {
      const item = createShellItem({
        isCustomerCoil: false,
        pricePerSheet: 0,
        costPerLF: 2,
        orderLF: 100,
        slitCharge: 15,
        freight: 35,
        customerLF: 200, // labor = 7
      });

      const result = calculateGutterShell(item);

      const expectedSubTotal = 2 * 100; // 200
      expect(result.subTotal).toBe(expectedSubTotal);

      const expectedTotalCost = expectedSubTotal + 15 + 35; // 250
      expect(result.totalCost).toBe(expectedTotalCost);

      const expectedTotalCostLF = expectedTotalCost / 100; // 2.5
      expect(result.totalCostLF).toBe(expectedTotalCostLF);

      const expectedMarkup = expectedTotalCostLF * 0.43; // 1.075
      expect(result.markup).toBeCloseTo(expectedMarkup);

      expect(result.labor).toBe(7);

      const expectedPriceChargedLF = expectedTotalCostLF + expectedMarkup + 7; // 2.5 + 1.075 + 7 = 10.575
      expect(result.priceChargedLF).toBeCloseTo(expectedPriceChargedLF);

      const expectedTotal = expectedPriceChargedLF * 100; // 1057.5
      expect(result.total).toBeCloseTo(expectedTotal);

      const expectedCustomerLFS = expectedTotal / 200; // 5.2875
      expect(result.customerLFS).toBeCloseTo(expectedCustomerLFS);
    });

    it('should override costPerLF with (pricePerSheet / 20) when pricePerSheet > 0', () => {
      const item = createShellItem({
        isCustomerCoil: false,
        pricePerSheet: 40, // overrides to costPerLF = 2
        costPerLF: 999, // should be ignored
        orderLF: 100,
        slitCharge: 15,
        freight: 35,
        customerLF: 200,
      });

      const result = calculateGutterShell(item);
      expect(result.subTotal).toBe(200); // 2 * 100
      expect(result.totalCost).toBe(250); // 200 + 15 + 35
      // other values verified in previous test
    });

    it('should handle orderLF === 0 gracefully (no division by zero for totalCostLF)', () => {
      const item = createShellItem({
        isCustomerCoil: false,
        costPerLF: 2,
        orderLF: 0, // Should trigger fallback
        slitCharge: 15,
        freight: 35,
        customerLF: 100,
      });

      const result = calculateGutterShell(item);

      expect(result.subTotal).toBe(0);
      expect(result.totalCost).toBe(50); // 0 + 15 + 35
      expect(result.totalCostLF).toBe(0); // Handled safely

      expect(result.markup).toBe(0); // 0 * 0.43
      expect(result.labor).toBe(7);
      expect(result.priceChargedLF).toBe(7); // 0 + 0 + 7
      expect(result.total).toBe(0); // 7 * 0
      expect(result.customerLFS).toBe(0); // 0 / 100
    });

    it('should handle customerLF === 0 gracefully (no division by zero for customerLFS)', () => {
      const item = createShellItem({
        isCustomerCoil: false,
        costPerLF: 2,
        orderLF: 100,
        slitCharge: 10,
        freight: 20,
        customerLF: 0, // Should trigger fallback
      });

      const result = calculateGutterShell(item);

      expect(result.customerLFS).toBe(0);
    });
  });
});
