import { Estimate, PartItem, GutterShellItem } from '../types';

export function isEstimateEqual(a: Estimate, b: Estimate): boolean {
  if (!a || !b) return a === b;

  if (a.id !== b.id) return false;
  if (a.name !== b.name) return false;
  if (a.clientName !== b.clientName) return false;
  if (a.quoteNumber !== b.quoteNumber) return false;
  if (a.date !== b.date) return false;
  if (a.notes !== b.notes) return false;
  if (a.hourlyRate !== b.hourlyRate) return false;
  if (a.overheadPercent !== b.overheadPercent) return false;
  if (a.profitPercent !== b.profitPercent) return false;
  if (a.createdAt !== b.createdAt) return false;
  if (a.updatedAt !== b.updatedAt) return false;

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
