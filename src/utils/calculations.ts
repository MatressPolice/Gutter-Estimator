import { PartItem, PartCalculations, EstimateTotals, GutterShellItem, GutterShellCalculations, Estimate, ComprehensiveTotals } from '../types';

/**
 * Calculates all computed columns for a single gutter shell item based on its inputs.
 */
export function calculateGutterShell(shell: GutterShellItem): GutterShellCalculations {
  const labor = shell.customerLF < 300 ? 7 : 6;

  let subTotal = 0;
  let totalCost = 0;
  let totalCostLF = 0;
  let markup = 0;

  if (shell.isCustomerCoil) {
    markup = labor * 0.43;
  } else {
    // If pricePerSheet > 0, we override costPerLF
    const costPerLF = shell.pricePerSheet > 0 ? shell.pricePerSheet / 20 : shell.costPerLF;

    subTotal = costPerLF * shell.orderLF;
    totalCost = subTotal + shell.slitCharge + shell.freight;

    totalCostLF = shell.orderLF > 0 ? totalCost / shell.orderLF : 0;
    markup = totalCostLF * 0.43;
  }

  const priceChargedLF = totalCostLF + markup + labor;
  const total = priceChargedLF * shell.orderLF;
  const customerLFS = shell.customerLF > 0 ? total / shell.customerLF : 0;

  return {
    subTotal,
    totalCost,
    totalCostLF,
    markup,
    labor,
    priceChargedLF,
    total,
    customerLFS
  };
}

/**
 * Calculates all computed columns for a single part item based on its inputs and rates.
 */
export function calculatePart(
  part: PartItem,
  rates: { hourlyRate: number; overheadPercent: number; profitPercent: number }
): PartCalculations {
  const { hours, sheets, pricePerSheet, quantity } = part;
  const { hourlyRate, overheadPercent, profitPercent } = rates;

  const hoursCost = hours * hourlyRate;
  const materialCosts = sheets * pricePerSheet;
  const subTotal = hoursCost + materialCosts;
  
  const overhead = subTotal * (overheadPercent / 100);
  const profit = subTotal * (profitPercent / 100);
  const grandTotal = subTotal + overhead + profit;
  
  const pricePerEa = quantity > 0 ? grandTotal / quantity : 0;

  return {
    hoursCost,
    materialCosts,
    subTotal,
    overhead,
    profit,
    grandTotal,
    pricePerEa,
  };
}

/**
 * Aggregates totals across all parts in an estimate.
 */
export function calculateEstimateTotals(
  parts: PartItem[],
  rates: { hourlyRate: number; overheadPercent: number; profitPercent: number }
): EstimateTotals {
  let totalHours = 0;
  let totalSheets = 0;
  let totalHoursCost = 0;
  let totalMaterialCosts = 0;
  let totalSubTotal = 0;
  let totalOverhead = 0;
  let totalProfit = 0;
  let totalGrandTotal = 0;

  parts.forEach((part) => {
    const calcs = calculatePart(part, rates);
    totalHours += part.hours || 0;
    totalSheets += part.sheets || 0;
    totalHoursCost += calcs.hoursCost;
    totalMaterialCosts += calcs.materialCosts;
    totalSubTotal += calcs.subTotal;
    totalOverhead += calcs.overhead;
    totalProfit += calcs.profit;
    totalGrandTotal += calcs.grandTotal;
  });

  const totalQuantity = parts.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const averagePricePerEa = totalQuantity > 0 ? totalGrandTotal / totalQuantity : 0;

  return {
    totalHours,
    totalSheets,
    totalHoursCost,
    totalMaterialCosts,
    totalSubTotal,
    totalOverhead,
    totalProfit,
    totalGrandTotal,
    averagePricePerEa,
  };
}

/**
 * Calculates unified totals for both Gutter Shells and Gutter Parts.
 */
export function calculateComprehensiveTotals(estimate: Estimate): ComprehensiveTotals {
  const partsTotals = calculateEstimateTotals(estimate.parts || [], {
    hourlyRate: estimate.hourlyRate,
    overheadPercent: estimate.overheadPercent,
    profitPercent: estimate.profitPercent,
  });

  let shellsTotalOrderLF = 0;
  let shellsTotalCustomerLF = 0;
  let shellsGrandTotal = 0;

  (estimate.shells || []).forEach((shell) => {
    const calcs = calculateGutterShell(shell);
    shellsTotalOrderLF += Number(shell.orderLF) || 0;
    shellsTotalCustomerLF += Number(shell.customerLF) || 0;
    shellsGrandTotal += calcs.total || 0;
  });

  return {
    partsTotalHours: partsTotals.totalHours,
    partsTotalSheets: partsTotals.totalSheets,
    partsTotalHoursCost: partsTotals.totalHoursCost,
    partsTotalMaterialCosts: partsTotals.totalMaterialCosts,
    partsTotalSubTotal: partsTotals.totalSubTotal,
    partsTotalOverhead: partsTotals.totalOverhead,
    partsTotalProfit: partsTotals.totalProfit,
    partsGrandTotal: partsTotals.totalGrandTotal,

    shellsTotalOrderLF,
    shellsTotalCustomerLF,
    shellsGrandTotal,

    combinedGrandTotal: partsTotals.totalGrandTotal + shellsGrandTotal,
  };
}


/**
 * Formats a currency value.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

