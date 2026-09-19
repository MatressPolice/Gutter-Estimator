import { Estimate } from './src/types';

function createMockEstimate(id: string, numParts = 50, numShells = 50): Estimate {
  return {
    id,
    name: 'Test Estimate',
    clientName: 'John Doe',
    quoteNumber: 'Q-12345',
    date: '2023-10-27',
    notes: 'Some notes here',
    hourlyRate: 100,
    overheadPercent: 34,
    profitPercent: 10,
    parts: Array.from({ length: numParts }).map((_, i) => ({
      id: `part-${i}`,
      name: `Part ${i}`,
      uom: 'EA',
      hours: i * 2,
      sheets: i,
      pricePerSheet: i * 10,
      quantity: i * 5,
    })),
    shells: Array.from({ length: numShells }).map((_, i) => ({
      id: `shell-${i}`,
      manufacturer: `Manufacturer ${i}`,
      color: `Color ${i}`,
      gauge: '24 Gauge',
      pricePerSheet: i * 15,
      costPerLF: i * 2,
      orderLF: i * 100,
      slitCharge: i * 5,
      freight: i * 20,
      customerLF: i * 90,
      isCustomerCoil: false,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const e1 = createMockEstimate('1');
const e2 = createMockEstimate('1');

function isEstimateEqual(a: Estimate, b: Estimate): boolean {
  if (a.id !== b.id) return false;
  if (a.name !== b.name) return false;
  if (a.clientName !== b.clientName) return false;
  if (a.quoteNumber !== b.quoteNumber) return false;
  if (a.date !== b.date) return false;
  if (a.notes !== b.notes) return false;
  if (a.hourlyRate !== b.hourlyRate) return false;
  if (a.overheadPercent !== b.overheadPercent) return false;
  if (a.profitPercent !== b.profitPercent) return false;

  if (a.parts.length !== b.parts.length) return false;
  if (a.shells.length !== b.shells.length) return false;

  for (let i = 0; i < a.parts.length; i++) {
    const pa = a.parts[i];
    const pb = b.parts[i];
    if (pa.id !== pb.id ||
        pa.name !== pb.name ||
        pa.uom !== pb.uom ||
        pa.hours !== pb.hours ||
        pa.sheets !== pb.sheets ||
        pa.pricePerSheet !== pb.pricePerSheet ||
        pa.quantity !== pb.quantity) {
      return false;
    }
  }

  for (let i = 0; i < a.shells.length; i++) {
    const sa = a.shells[i];
    const sb = b.shells[i];
    if (sa.id !== sb.id ||
        sa.manufacturer !== sb.manufacturer ||
        sa.color !== sb.color ||
        sa.gauge !== sb.gauge ||
        sa.pricePerSheet !== sb.pricePerSheet ||
        sa.costPerLF !== sb.costPerLF ||
        sa.orderLF !== sb.orderLF ||
        sa.slitCharge !== sb.slitCharge ||
        sa.freight !== sb.freight ||
        sa.customerLF !== sb.customerLF ||
        sa.isCustomerCoil !== sb.isCustomerCoil) {
      return false;
    }
  }

  return true;
}

const ITERATIONS = 100000;

console.log("Measuring JSON.stringify approach...");
const startJson = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const isDifferent = JSON.stringify(e1) !== JSON.stringify(e2);
}
const endJson = performance.now();
console.log(`JSON.stringify time: ${(endJson - startJson).toFixed(2)}ms`);

console.log("Measuring custom deep equality approach...");
const startCustom = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const isDifferent = !isEstimateEqual(e1, e2);
}
const endCustom = performance.now();
console.log(`Custom deep equality time: ${(endCustom - startCustom).toFixed(2)}ms`);

console.log(`Speedup: ${((endJson - startJson) / (endCustom - startCustom)).toFixed(2)}x`);
