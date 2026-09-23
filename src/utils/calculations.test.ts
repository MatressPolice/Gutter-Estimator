import { describe, it, expect } from 'vitest';
import { calculateGutterShell } from './calculations';
import { GutterShellItem } from '../types';

describe('calculateGutterShell', () => {
  const createBaseShell = (overrides?: Partial<GutterShellItem>): GutterShellItem => ({
    id: 'test-id',
    manufacturer: 'Test Mfg',
    color: 'White',
    gauge: '24 Gauge',
    pricePerSheet: 0,
    costPerLF: 10,
    orderLF: 100,
    slitCharge: 50,
    freight: 25,
    customerLF: 100,
    isCustomerCoil: false,
    ...overrides,
  });

  it('should use labor 7 when customerLF < 300', () => {
    const shell = createBaseShell({ customerLF: 299 });
    const result = calculateGutterShell(shell);
    expect(result.labor).toBe(7);
  });

  it('should use labor 6 when customerLF >= 300', () => {
    const shell = createBaseShell({ customerLF: 300 });
    const result = calculateGutterShell(shell);
    expect(result.labor).toBe(6);
  });

  describe('isCustomerCoil = true', () => {
    it('should correctly calculate with labor = 7', () => {
      const shell = createBaseShell({ isCustomerCoil: true, customerLF: 100, orderLF: 50 });
      const result = calculateGutterShell(shell);

      const labor = 7;
      const markup = labor * 0.43; // 3.01
      const priceChargedLF = labor + markup; // 10.01
      const total = priceChargedLF * shell.orderLF; // 10.01 * 50 = 500.5
      const customerLFS = total / shell.customerLF; // 500.5 / 100 = 5.005

      expect(result).toEqual({
        subTotal: 0,
        totalCost: 0,
        totalCostLF: 0,
        markup,
        labor,
        priceChargedLF,
        total,
        customerLFS,
      });
    });

    it('should correctly calculate with labor = 6', () => {
      const shell = createBaseShell({ isCustomerCoil: true, customerLF: 400, orderLF: 50 });
      const result = calculateGutterShell(shell);

      const labor = 6;
      const markup = labor * 0.43; // 2.58
      const priceChargedLF = labor + markup; // 8.58
      const total = priceChargedLF * shell.orderLF; // 8.58 * 50 = 429
      const customerLFS = total / shell.customerLF; // 429 / 400 = 1.0725

      expect(result).toEqual({
        subTotal: 0,
        totalCost: 0,
        totalCostLF: 0,
        markup,
        labor,
        priceChargedLF,
        total,
        customerLFS,
      });
    });

    it('should handle zero customerLF without division by zero', () => {
      const shell = createBaseShell({ isCustomerCoil: true, customerLF: 0, orderLF: 50 });
      const result = calculateGutterShell(shell);
      expect(result.customerLFS).toBe(0);
    });
  });

  describe('isCustomerCoil = false', () => {
    it('should calculate correctly using pricePerSheet when > 0', () => {
      const shell = createBaseShell({
        pricePerSheet: 100, // Should override costPerLF
        costPerLF: 1,      // Should be ignored
        orderLF: 100,
        slitCharge: 10,
        freight: 20,
        customerLF: 50
      });
      const result = calculateGutterShell(shell);

      const labor = 7; // customerLF < 300
      const costPerLF = 100 / 20; // 5
      const subTotal = 5 * 100; // 500
      const totalCost = 500 + 10 + 20; // 530
      const totalCostLF = 530 / 100; // 5.3
      const markup = 5.3 * 0.43; // 2.279
      const priceChargedLF = 5.3 + 2.279 + 7; // 14.579
      const total = 14.579 * 100; // 1457.9
      const customerLFS = 1457.9 / 50; // 29.158

      expect(result.subTotal).toBe(subTotal);
      expect(result.totalCost).toBe(totalCost);
      expect(result.totalCostLF).toBe(totalCostLF);
      expect(result.markup).toBeCloseTo(markup);
      expect(result.labor).toBe(labor);
      expect(result.priceChargedLF).toBeCloseTo(priceChargedLF);
      expect(result.total).toBeCloseTo(total);
      expect(result.customerLFS).toBeCloseTo(customerLFS);
    });

    it('should calculate correctly using costPerLF when pricePerSheet is 0', () => {
      const shell = createBaseShell({
        pricePerSheet: 0,
        costPerLF: 5,
        orderLF: 100,
        slitCharge: 10,
        freight: 20,
        customerLF: 50
      });
      const result = calculateGutterShell(shell);

      const labor = 7; // customerLF < 300
      const costPerLF = 5;
      const subTotal = 5 * 100; // 500
      const totalCost = 500 + 10 + 20; // 530
      const totalCostLF = 530 / 100; // 5.3
      const markup = 5.3 * 0.43; // 2.279
      const priceChargedLF = 5.3 + 2.279 + 7; // 14.579
      const total = 14.579 * 100; // 1457.9
      const customerLFS = 1457.9 / 50; // 29.158

      expect(result.subTotal).toBe(subTotal);
      expect(result.totalCost).toBe(totalCost);
      expect(result.totalCostLF).toBe(totalCostLF);
      expect(result.markup).toBeCloseTo(markup);
      expect(result.labor).toBe(labor);
      expect(result.priceChargedLF).toBeCloseTo(priceChargedLF);
      expect(result.total).toBeCloseTo(total);
      expect(result.customerLFS).toBeCloseTo(customerLFS);
    });

    it('should handle zero orderLF without division by zero', () => {
      const shell = createBaseShell({ orderLF: 0, costPerLF: 5, slitCharge: 10, freight: 20 });
      const result = calculateGutterShell(shell);

      expect(result.totalCostLF).toBe(0);
      expect(result.subTotal).toBe(0);
      expect(result.totalCost).toBe(30); // 0 + 10 + 20

      const markup = 0; // 0 * 0.43
      const labor = 7;
      const priceChargedLF = 0 + 0 + 7; // 7
      const total = 7 * 0; // 0

      expect(result.markup).toBe(markup);
      expect(result.priceChargedLF).toBe(priceChargedLF);
      expect(result.total).toBe(total);
    });

    it('should handle zero customerLF without division by zero', () => {
      const shell = createBaseShell({ customerLF: 0, orderLF: 10, costPerLF: 5 });
      const result = calculateGutterShell(shell);
      expect(result.customerLFS).toBe(0);
    });
  });
});
