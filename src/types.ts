export interface PartItem {
  id: string;
  name: string;
  uom?: 'EA' | 'LF' | '';
  hours: number;
  sheets: number;
  pricePerSheet: number;
  quantity: number;
}

export interface GutterShellItem {
  id: string;
  manufacturer: string;
  color: string;
  gauge: '22 Gauge' | '24 Gauge' | '.032' | '';
  pricePerSheet: number;
  costPerLF: number;
  orderLF: number;
  slitCharge: number;
  freight: number;
  customerLF: number;
  isCustomerCoil?: boolean;
}

export interface Estimate {
  id: string;
  name: string;
  clientName: string;
  quoteNumber: string;
  date: string;
  notes?: string;
  hourlyRate: number;      // e.g. 100
  overheadPercent: number; // e.g. 34
  profitPercent: number;   // e.g. 10
  parts: PartItem[];
  shells: GutterShellItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PartCalculations {
  hoursCost: number;        // hours * hourlyRate
  materialCosts: number;    // sheets * pricePerSheet
  subTotal: number;         // hoursCost + materialCosts
  overhead: number;         // (overheadPercent / 100) * subTotal
  profit: number;           // (profitPercent / 100) * subTotal
  grandTotal: number;       // subTotal + overhead + profit
  pricePerEa: number;       // grandTotal / quantity (if quantity > 0)
}

export interface GutterShellCalculations {
  subTotal: number;         // costPerLF * orderLF
  totalCost: number;        // subTotal + slitCharge + freight
  totalCostLF: number;      // totalCost / orderLF
  markup: number;           // totalCostLF * 0.43
  labor: number;            // if customerLF < 300 ? 7 : 6
  priceChargedLF: number;   // totalCostLF + markup + labor
  total: number;            // priceChargedLF * orderLF
  customerLFS: number;      // total / customerLF
}

export interface EstimateTotals {
  totalHours: number;
  totalSheets: number;
  totalHoursCost: number;
  totalMaterialCosts: number;
  totalSubTotal: number;
  totalOverhead: number;
  totalProfit: number;
  totalGrandTotal: number;
  averagePricePerEa: number;
}

export interface ComprehensiveTotals {
  partsTotalHours: number;
  partsTotalSheets: number;
  partsTotalHoursCost: number;
  partsTotalMaterialCosts: number;
  partsTotalSubTotal: number;
  partsTotalOverhead: number;
  partsTotalProfit: number;
  partsGrandTotal: number;

  shellsTotalOrderLF: number;
  shellsTotalCustomerLF: number;
  shellsGrandTotal: number;

  combinedGrandTotal: number;
}

