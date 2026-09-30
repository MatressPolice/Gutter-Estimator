import { describe, it, expect } from 'vitest';
import { getPartMathExplanation } from './calculations';
import { PartItem } from '../types';

describe('getPartMathExplanation', () => {
  it('should generate correctly formatted steps for a happy path', () => {
    const part: PartItem = {
      id: 'p1',
      name: 'Custom Gutter',
      hours: 2,
      sheets: 1.5,
      pricePerSheet: 10,
      quantity: 2,
    };
    const rates = {
      hourlyRate: 50,
      overheadPercent: 20,
      profitPercent: 10,
    };

    const steps = getPartMathExplanation(part, rates);

    expect(steps).toHaveLength(7);

    // 1. Labor Cost
    expect(steps[0]).toEqual({
      label: 'Labor Cost (Hours$)',
      expression: '2.00 Hrs × $50.00/Hr',
      result: '$100.00',
    });

    // 2. Material Cost
    expect(steps[1]).toEqual({
      label: 'Material Cost (MaterialCosts)',
      expression: '1.50 Sheets × $10.00/Sheet',
      result: '$15.00',
    });

    // 3. Subtotal
    expect(steps[2]).toEqual({
      label: 'Subtotal (Hours$ + MaterialCosts)',
      expression: '$100.00 + $15.00',
      result: '$115.00',
    });

    // 4. Overhead
    expect(steps[3]).toEqual({
      label: 'Overhead (20% of Subtotal)',
      expression: '20% × $115.00',
      result: '$23.00',
    });

    // 5. Profit
    expect(steps[4]).toEqual({
      label: 'Profit (10% of Subtotal)',
      expression: '10% × $115.00',
      result: '$11.50',
    });

    // 6. Grand Total
    expect(steps[5]).toEqual({
      label: 'Grand Total (Subtotal + Overhead + Profit)',
      expression: '$115.00 + $23.00 + $11.50',
      result: '$149.50',
    });

    // 7. Price per EA
    expect(steps[6]).toEqual({
      label: 'Price Per EA (Grand Total / Quantity)',
      expression: '$149.50 / 2 Units',
      result: '$74.75',
    });
  });

  it('should handle zero quantity correctly', () => {
    const part: PartItem = {
      id: 'p2',
      name: 'Zero Quantity Part',
      hours: 1,
      sheets: 1,
      pricePerSheet: 10,
      quantity: 0,
    };
    const rates = {
      hourlyRate: 50,
      overheadPercent: 10,
      profitPercent: 10,
    };

    const steps = getPartMathExplanation(part, rates);

    expect(steps).toHaveLength(7);

    expect(steps[6]).toEqual({
      label: 'Price Per EA',
      expression: 'Quantity is 0',
      result: 'N/A (Requires Quantity > 0)',
    });
  });

  it('should handle zero values gracefully', () => {
    const part: PartItem = {
      id: 'p3',
      name: 'Free Part',
      hours: 0,
      sheets: 0,
      pricePerSheet: 0,
      quantity: 1,
    };
    const rates = {
      hourlyRate: 0,
      overheadPercent: 0,
      profitPercent: 0,
    };

    const steps = getPartMathExplanation(part, rates);

    expect(steps).toHaveLength(7);

    // 1. Labor Cost
    expect(steps[0]).toEqual({
      label: 'Labor Cost (Hours$)',
      expression: '0.00 Hrs × $0.00/Hr',
      result: '$0.00',
    });

    // 2. Material Cost
    expect(steps[1]).toEqual({
      label: 'Material Cost (MaterialCosts)',
      expression: '0.00 Sheets × $0.00/Sheet',
      result: '$0.00',
    });

    // 3. Subtotal
    expect(steps[2]).toEqual({
      label: 'Subtotal (Hours$ + MaterialCosts)',
      expression: '$0.00 + $0.00',
      result: '$0.00',
    });

    // 4. Overhead
    expect(steps[3]).toEqual({
      label: 'Overhead (0% of Subtotal)',
      expression: '0% × $0.00',
      result: '$0.00',
    });

    // 5. Profit
    expect(steps[4]).toEqual({
      label: 'Profit (0% of Subtotal)',
      expression: '0% × $0.00',
      result: '$0.00',
    });

    // 6. Grand Total
    expect(steps[5]).toEqual({
      label: 'Grand Total (Subtotal + Overhead + Profit)',
      expression: '$0.00 + $0.00 + $0.00',
      result: '$0.00',
    });

    // 7. Price per EA
    expect(steps[6]).toEqual({
      label: 'Price Per EA (Grand Total / Quantity)',
      expression: '$0.00 / 1 Units',
      result: '$0.00',
    });
  });
});
