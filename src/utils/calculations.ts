import { PartItem, PartCalculations, EstimateTotals, GutterShellItem, GutterShellCalculations } from '../types';

/**
 * Calculates all computed columns for a single gutter shell item based on its inputs.
 */
export function calculateGutterShell(shell: GutterShellItem): GutterShellCalculations {
  const labor = shell.customerLF < 300 ? 7 : 6;

  if (shell.isCustomerCoil) {
    const subTotal = 0;
    const totalCost = 0;
    const totalCostLF = 0;
    const markup = labor * 0.43;
    const priceChargedLF = labor + markup;
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
      customerLFS,
    };
  }

  // If pricePerSheet > 0, we override costPerLF
  const costPerLF = shell.pricePerSheet > 0 ? shell.pricePerSheet / 20 : shell.costPerLF;
  
  const subTotal = costPerLF * shell.orderLF;
  const totalCost = subTotal + shell.slitCharge + shell.freight;
  
  const totalCostLF = shell.orderLF > 0 ? totalCost / shell.orderLF : 0;
  const markup = totalCostLF * 0.43;
  
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

export interface FormulaStep {
  label: string;
  expression: string;
  result: string;
}

/**
 * Generates an array of mathematical steps explaining exactly how the pricing was reached.
 */
export function getPartMathExplanation(
  part: PartItem,
  rates: { hourlyRate: number; overheadPercent: number; profitPercent: number }
): FormulaStep[] {
  const { hours, sheets, pricePerSheet, quantity } = part;
  const { hourlyRate, overheadPercent, profitPercent } = rates;
  const calcs = calculatePart(part, rates);

  const steps: FormulaStep[] = [];

  // 1. Labor cost
  steps.push({
    label: 'Labor Cost (Hours$)',
    expression: `${hours.toFixed(2)} Hrs × ${formatCurrency(hourlyRate)}/Hr`,
    result: formatCurrency(calcs.hoursCost),
  });

  // 2. Material Cost
  steps.push({
    label: 'Material Cost (MaterialCosts)',
    expression: `${sheets.toFixed(2)} Sheets × ${formatCurrency(pricePerSheet)}/Sheet`,
    result: formatCurrency(calcs.materialCosts),
  });

  // 3. Subtotal
  steps.push({
    label: 'Subtotal (Hours$ + MaterialCosts)',
    expression: `${formatCurrency(calcs.hoursCost)} + ${formatCurrency(calcs.materialCosts)}`,
    result: formatCurrency(calcs.subTotal),
  });

  // 4. Overhead
  steps.push({
    label: `Overhead (${overheadPercent}% of Subtotal)`,
    expression: `${overheadPercent}% × ${formatCurrency(calcs.subTotal)}`,
    result: formatCurrency(calcs.overhead),
  });

  // 5. Profit
  steps.push({
    label: `Profit (${profitPercent}% of Subtotal)`,
    expression: `${profitPercent}% × ${formatCurrency(calcs.subTotal)}`,
    result: formatCurrency(calcs.profit),
  });

  // 6. Grand Total
  steps.push({
    label: 'Grand Total (Subtotal + Overhead + Profit)',
    expression: `${formatCurrency(calcs.subTotal)} + ${formatCurrency(calcs.overhead)} + ${formatCurrency(calcs.profit)}`,
    result: formatCurrency(calcs.grandTotal),
  });

  // 7. Price per EA
  if (quantity > 0) {
    steps.push({
      label: 'Price Per EA (Grand Total / Quantity)',
      expression: `${formatCurrency(calcs.grandTotal)} / ${quantity} Units`,
      result: formatCurrency(calcs.pricePerEa),
    });
  } else {
    steps.push({
      label: 'Price Per EA',
      expression: 'Quantity is 0',
      result: 'N/A (Requires Quantity > 0)',
    });
  }

  return steps;
}
