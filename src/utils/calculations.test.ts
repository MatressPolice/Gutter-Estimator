import { describe, it, expect } from 'vitest';
import { getPartMathExplanation } from './calculations';
import { PartItem } from '../types';

describe('getPartMathExplanation', () => {
  const defaultRates = {
    hourlyRate: 50,
    overheadPercent: 20,
    profitPercent: 10,
  };

  const defaultPart: PartItem = {
    id: 'p1',
    name: 'Test Part',
    uom: 'EA',
    hours: 2,
    sheets: 1,
    pricePerSheet: 100,
    quantity: 10,
  };

  it('should include "Price Per EA (Grand Total / Quantity)" when quantity > 0', () => {
    const steps = getPartMathExplanation(defaultPart, defaultRates);
    const lastStep = steps[steps.length - 1];

    expect(lastStep.label).toBe('Price Per EA (Grand Total / Quantity)');
    expect(lastStep.expression).toContain('/ 10 Units');
  });

  it('should include specific fallback when quantity === 0', () => {
    const partWithZeroQuantity: PartItem = {
      ...defaultPart,
      quantity: 0,
    };
    const steps = getPartMathExplanation(partWithZeroQuantity, defaultRates);
    const lastStep = steps[steps.length - 1];

    expect(lastStep.label).toBe('Price Per EA');
    expect(lastStep.expression).toBe('Quantity is 0');
    expect(lastStep.result).toBe('N/A (Requires Quantity > 0)');
  });
});
