import { Estimate, EstimateTotals } from '../types';
import { calculatePart, formatCurrency } from '../utils/calculations';

interface PrintDocumentProps {
  estimate: Estimate;
  totals: EstimateTotals;
}

export default function PrintDocument({ estimate, totals }: PrintDocumentProps) {
  const dateFormatted = estimate.date
    ? new Date(estimate.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not Specified';

  return (
    <div className="bg-white p-8 sm:p-12 border border-slate-200 rounded-xl shadow-xs print-container font-sans text-slate-900 leading-normal max-w-4xl mx-auto">
      {/* 1. Header / Letterhead */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 border-b-2 border-slate-200 pb-8 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight text-slate-900 uppercase">
            Work Estimate &amp; Pricing Quote
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            CUSTOM PARTS MANUFACTURE &amp; FABRICATION
          </p>
        </div>
        <div className="text-left sm:text-right">
          <div className="inline-block bg-slate-100 border border-slate-250 font-mono text-sm px-3.5 py-1.5 rounded-lg font-bold">
            Ref: {estimate.quoteNumber || 'QT-DRAFT'}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-2">
            Date: <span className="font-semibold text-slate-700">{dateFormatted}</span>
          </p>
        </div>
      </div>

      {/* 2. Addresses / Project Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 text-sm">
        <div>
          <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2 font-display">
            Client / Requestor
          </h3>
          <p className="font-bold text-base text-slate-900">
            {estimate.clientName || 'Valued Client'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Custom Manufacturing Services
          </p>
        </div>
        <div>
          <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2 font-display">
            Project Description
          </h3>
          <p className="font-semibold text-slate-800">
            {estimate.name || 'Custom Parts Estimate'}
          </p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Estimates are subject to standard workshop operating terms. All rates are calculated dynamically in accordance with global labor &amp; material metrics.
          </p>
        </div>
      </div>

      {/* 3. Main Sheet Table (Print-Optimized) */}
      <div className="mb-8 print-break-inside-avoid">
        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-3 font-display">
          Pricing Summary Table
        </h3>
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 divide-x divide-slate-200 border-b border-slate-300 font-semibold">
              <th className="px-3 py-2 text-left font-display">Part Name</th>
              <th className="px-1.5 py-2">Hours</th>
              <th className="px-1.5 py-2">$/Hr</th>
              <th className="px-2 py-2 print-bg-blue">Hours$</th>
              <th className="px-1.5 py-2">Sheets</th>
              <th className="px-2 py-2">$PerSh</th>
              <th className="px-2 py-2 print-bg-rose">Materials$</th>
              <th className="px-2 py-2 print-bg-gray">Subtotal</th>
              <th className="px-2 py-2 print-bg-gray">Overhead</th>
              <th className="px-2 py-2 print-bg-gray">Profit</th>
              <th className="px-2 py-2 print-bg-gray font-bold">Total</th>
              <th className="px-1.5 py-2">Qty</th>
              <th className="px-3 py-2 text-right print-bg-green font-bold">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {estimate.parts.map((part) => {
              const calcs = calculatePart(part, estimate);
              return (
                <tr key={part.id} className="divide-x divide-slate-100">
                  <td className="px-3 py-2 text-left font-semibold text-slate-900">{part.name || `[PART${estimate.parts.indexOf(part) + 1}]`}</td>
                  <td className="px-1.5 py-2 font-mono">{part.hours.toFixed(2)}</td>
                  <td className="px-1.5 py-2 font-mono">{formatCurrency(estimate.hourlyRate)}</td>
                  <td className="px-2 py-2 font-mono text-blue-900 print-bg-blue">{formatCurrency(calcs.hoursCost)}</td>
                  <td className="px-1.5 py-2 font-mono">{part.sheets}</td>
                  <td className="px-2 py-2 font-mono">{formatCurrency(part.pricePerSheet)}</td>
                  <td className="px-2 py-2 font-mono text-rose-900 print-bg-rose">{formatCurrency(calcs.materialCosts)}</td>
                  <td className="px-2 py-2 font-mono print-bg-gray">{formatCurrency(calcs.subTotal)}</td>
                  <td className="px-2 py-2 font-mono text-slate-500 print-bg-gray">{formatCurrency(calcs.overhead)}</td>
                  <td className="px-2 py-2 font-mono text-slate-500 print-bg-gray">{formatCurrency(calcs.profit)}</td>
                  <td className="px-2 py-2 font-mono text-slate-900 font-semibold print-bg-gray">{formatCurrency(calcs.grandTotal)}</td>
                  <td className="px-1.5 py-2 font-mono text-center">
                    {part.quantity}
                    {part.uom ? <span className="text-[9px] block text-slate-500">{part.uom}</span> : null}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-emerald-950 print-bg-green">
                    {part.quantity > 0 ? (
                      <>
                        {formatCurrency(calcs.pricePerEa)}
                        {part.uom ? <span className="text-[10px] font-normal text-emerald-800 ml-0.5">/{part.uom}</span> : null}
                      </>
                    ) : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Aggregate Grand Totals (Summary Table) */}
      <div className="flex justify-end mb-12 print-break-inside-avoid">
        <div className="w-full sm:w-80 space-y-2 text-sm border-t-2 border-slate-200 pt-4">
          <div className="flex justify-between items-center py-1 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold uppercase">Total Labor Cost ({totals.totalHours.toFixed(1)} Hrs)</span>
            <span className="font-mono text-slate-800">{formatCurrency(totals.totalHoursCost)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold uppercase">Total Materials Cost ({totals.totalSheets.toFixed(1)} Sheets)</span>
            <span className="font-mono text-slate-800">{formatCurrency(totals.totalMaterialCosts)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 font-semibold text-xs">
            <span className="text-slate-700 uppercase">Combined Subtotal</span>
            <span className="font-mono text-slate-900">{formatCurrency(totals.totalSubTotal)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold uppercase">Workshop Overhead ({estimate.overheadPercent}%)</span>
            <span className="font-mono text-slate-800">{formatCurrency(totals.totalOverhead)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold uppercase">Net Profit Margin ({estimate.profitPercent}%)</span>
            <span className="font-mono text-slate-800">{formatCurrency(totals.totalProfit)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-emerald-50 text-emerald-950 font-bold rounded-lg border border-emerald-100 text-base">
            <span className="uppercase tracking-tight text-xs">Grand Total Quote</span>
            <span className="font-mono">{formatCurrency(totals.totalGrandTotal)}</span>
          </div>
        </div>
      </div>

      {/* 6. Sign-off Footer block */}
      <div className="mt-16 border-t border-slate-250 pt-12 print-break-inside-avoid text-sm">
        <div className="grid grid-cols-2 gap-12">
          <div>
            <div className="border-b border-slate-350 h-8"></div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2">
              Estimator Signature
            </p>
          </div>
          <div>
            <div className="border-b border-slate-350 h-8"></div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2">
              Client Acceptance (Date)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
