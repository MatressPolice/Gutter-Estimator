import { describe, it, expect } from 'vitest';
import { isEstimateEqual } from './equality';
import { Estimate, PartItem, GutterShellItem } from '../types';

const defaultPart: PartItem = {
  id: 'p1',
  name: 'Part 1',
  uom: 'EA',
  hours: 1,
  sheets: 1,
  pricePerSheet: 10,
  quantity: 2,
};

const defaultShell: GutterShellItem = {
  id: 's1',
  manufacturer: 'Mfg',
  color: 'White',
  gauge: '24 Gauge',
  pricePerSheet: 50,
  costPerLF: 0,
  orderLF: 100,
  slitCharge: 10,
  freight: 10,
  customerLF: 100,
  isCustomerCoil: false,
};

const baseEstimate: Estimate = {
  id: 'e1',
  name: 'Estimate 1',
  clientName: 'Client 1',
  quoteNumber: 'Q-001',
  date: '2023-01-01',
  notes: 'Some notes',
  hourlyRate: 100,
  overheadPercent: 20,
  profitPercent: 10,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  parts: [defaultPart],
  shells: [defaultShell],
  userId: 'user1',
};

describe('isEstimateEqual', () => {
  it('returns true for identically referenced objects', () => {
    expect(isEstimateEqual(baseEstimate, baseEstimate)).toBe(true);
  });

  it('returns true for two identical independent objects', () => {
    const clone: Estimate = JSON.parse(JSON.stringify(baseEstimate));
    expect(isEstimateEqual(baseEstimate, clone)).toBe(true);
  });

  it('handles falsy or nullish inputs', () => {
    expect(isEstimateEqual(undefined as unknown as Estimate, undefined as unknown as Estimate)).toBe(true);
    expect(isEstimateEqual(null as unknown as Estimate, null as unknown as Estimate)).toBe(true);
    expect(isEstimateEqual(null as unknown as Estimate, baseEstimate)).toBe(false);
    expect(isEstimateEqual(baseEstimate, undefined as unknown as Estimate)).toBe(false);
  });

  describe('top-level properties', () => {
    const propsToTest: Array<keyof Omit<Estimate, 'parts' | 'shells' | 'userId'>> = [
      'id',
      'name',
      'clientName',
      'quoteNumber',
      'date',
      'notes',
      'hourlyRate',
      'overheadPercent',
      'profitPercent',
      'createdAt',
      'updatedAt',
    ];

    propsToTest.forEach((prop) => {
      it(`returns false if ${prop} differs`, () => {
        const clone = JSON.parse(JSON.stringify(baseEstimate));

        if (typeof clone[prop] === 'string') {
          clone[prop] = clone[prop] + ' changed';
        } else if (typeof clone[prop] === 'number') {
          clone[prop] = clone[prop] + 1;
        }

        expect(isEstimateEqual(baseEstimate, clone)).toBe(false);
      });
    });
  });

  describe('parts array', () => {
    it('returns false if parts array length differs', () => {
      const clone = JSON.parse(JSON.stringify(baseEstimate));
      clone.parts = [];
      expect(isEstimateEqual(baseEstimate, clone)).toBe(false);
    });

    it('returns false if a property inside a part differs', () => {
      const clone = JSON.parse(JSON.stringify(baseEstimate));
      clone.parts[0].hours = 99;
      expect(isEstimateEqual(baseEstimate, clone)).toBe(false);
    });

    it('returns false if part id differs', () => {
      const clone = JSON.parse(JSON.stringify(baseEstimate));
      clone.parts[0].id = 'different-id';
      expect(isEstimateEqual(baseEstimate, clone)).toBe(false);
    });
  });

  describe('shells array', () => {
    it('returns false if shells array length differs', () => {
      const clone = JSON.parse(JSON.stringify(baseEstimate));
      clone.shells = [];
      expect(isEstimateEqual(baseEstimate, clone)).toBe(false);
    });

    it('returns false if a property inside a shell differs', () => {
      const clone = JSON.parse(JSON.stringify(baseEstimate));
      clone.shells[0].color = 'Black';
      expect(isEstimateEqual(baseEstimate, clone)).toBe(false);
    });

    it('returns false if shell id differs', () => {
      const clone = JSON.parse(JSON.stringify(baseEstimate));
      clone.shells[0].id = 'different-id';
      expect(isEstimateEqual(baseEstimate, clone)).toBe(false);
    });
  });
});
