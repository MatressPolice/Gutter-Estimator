import { Estimate, EstimateTotals } from '../types';
import { calculatePart, formatCurrency } from '../utils/calculations';
import GutterLogo from './GutterLogo';

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
    <div className="bg-white p-8 sm:p-12 border border-[#A5ACAF]/40 rounded-xl shadow-xs print-container font-sans text-[#002244] leading-normal max-w-4xl mx-auto">
      {/* 1. Header / Letterhead with Seattle Seahawks Brand */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 border-b-2 border-[#002244] pb-6 mb-8">
        <div className="flex items-center gap-4">
          <GutterLogo variant="seahawks" size={54} />
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-[#002244] uppercase">
              Work Estimate &amp; Pricing Quote
            </h1>
            <p className="text-xs text-slate-500 font-mono font-bold mt-0.5 tracking-wider">
              PRECISION SHEET METAL &amp; GUTTER FABRICATION
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="inline-block bg-[#002244] text-white border border-[#A5ACAF]/40 font-mono text-sm px-3.5 py-1.5 rounded-lg font-bold shadow-xs">
            Ref: {estimate.quoteNumber || 'QT-DRAFT'}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1.5">
            Date: <span className="font-bold text-[#002244]">{dateFormatted}</span>
          </p>
        </div>
      </div>

      {/* 2. Addresses / Project Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 text-sm">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1 font-display">
            Client / Requestor
          </h3>
          <p className="font-extrabold text-base text-[#002244]">
            {estimate.clientName || 'Valued Client'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Custom Manufacturing Services
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1 font-display">
            Project Description
          </h3>
          <p className="font-bold text-[#002244]">
            {estimate.name || 'Custom Parts Estimate'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Estimates calculated dynamically based on shop labor and raw material indices.
          </p>
        </div>
      </div>

      {/* 3. Main Sheet Table (Print-Optimized) */}
      <div className="mb-8 print-break-inside-avoid">
        <h3 className="font-bold text-[#002244] uppercase tracking-wider text-xs mb-3 font-display">
          Pricing Summary Table
        </h3>
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr className="bg-[#002244] text-white divide-x divide-[#0A3663] border-b border-[#002244] font-semibold">
              <th className="px-3 py-2 text-left font-display">Part Name</th>
              <th className="px-1.5 py-2">Hours</th>
              <th className="px-1.5 py-2">$/Hr</th>
              <th className="px-2 py-2">Hours$</th>
              <th className="px-1.5 py-2">Sheets</th>
              <th className="px-2 py-2">$PerSh</th>
              <th className="px-2 py-2">Materials$</th>
              <th className="px-2 py-2">Subtotal</th>
              <th className="px-2 py-2">Overhead</th>
              <th className="px-2 py-2">Profit</th>
              <th className="px-2 py-2 font-bold">Total</th>
              <th className="px-1.5 py-2">Qty</th>
              <th className="px-3 py-2 text-right font-bold text-[#69BE28]">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {estimate.parts.map((part) => {
              const calcs = calculatePart(part, estimate);
              return (
                <tr key={part.id} className="divide-x divide-slate-100 hover:bg-slate-50/50">
                  <td className="px-3 py-2 text-left font-bold text-[#002244]">{part.name || `[PART${estimate.parts.indexOf(part) + 1}]`}</td>
                  <td className="px-1.5 py-2 font-mono">{part.hours.toFixed(2)}</td>
                  <td className="px-1.5 py-2 font-mono">{formatCurrency(estimate.hourlyRate)}</td>
                  <td className="px-2 py-2 font-mono font-medium">{formatCurrency(calcs.hoursCost)}</td>
                  <td className="px-1.5 py-2 font-mono">{part.sheets}</td>
                  <td className="px-2 py-2 font-mono">{formatCurrency(part.pricePerSheet)}</td>
                  <td className="px-2 py-2 font-mono font-medium">{formatCurrency(calcs.materialCosts)}</td>
                  <td className="px-2 py-2 font-mono font-semibold">{formatCurrency(calcs.subTotal)}</td>
                  <td className="px-2 py-2 font-mono text-slate-500">{formatCurrency(calcs.overhead)}</td>
                  <td className="px-2 py-2 font-mono text-[#69BE28] font-bold">{formatCurrency(calcs.profit)}</td>
                  <td className="px-2 py-2 font-mono text-[#002244] font-bold">{formatCurrency(calcs.grandTotal)}</td>
                  <td className="px-1.5 py-2 font-mono text-center">
                    {part.quantity}
                    {part.uom ? <span className="text-[9px] block text-slate-500 font-semibold">{part.uom}</span> : null}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-extrabold text-[#002244] bg-[#f0fdf4]">
                    {part.quantity > 0 ? (
                      <>
                        {formatCurrency(calcs.pricePerEa)}
                        {part.uom ? <span className="text-[10px] font-normal text-slate-600 ml-0.5">/{part.uom}</span> : null}
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
        <div className="w-full sm:w-80 space-y-2 text-sm border-t-2 border-[#002244] pt-4">
          <div className="flex justify-between items-center py-1 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold uppercase">Total Labor Cost ({totals.totalHours.toFixed(1)} Hrs)</span>
            <span className="font-mono text-slate-800 font-medium">{formatCurrency(totals.totalHoursCost)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold uppercase">Total Materials Cost ({totals.totalSheets.toFixed(1)} Sheets)</span>
            <span className="font-mono text-slate-800 font-medium">{formatCurrency(totals.totalMaterialCosts)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 font-semibold text-xs">
            <span className="text-[#002244] uppercase">Combined Subtotal</span>
            <span className="font-mono text-[#002244] font-bold">{formatCurrency(totals.totalSubTotal)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold uppercase">Workshop Overhead ({estimate.overheadPercent}%)</span>
            <span className="font-mono text-slate-800">{formatCurrency(totals.totalOverhead)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100 text-xs">
            <span className="text-[#69BE28] font-bold uppercase">Net Profit Margin ({estimate.profitPercent}%)</span>
            <span className="font-mono text-[#69BE28] font-bold">{formatCurrency(totals.totalProfit)}</span>
          </div>
          <div className="flex justify-between items-center py-2.5 px-3 bg-[#f0fdf4] text-[#002244] font-extrabold rounded-lg border-2 border-[#69BE28] text-base shadow-xs">
            <span className="uppercase tracking-tight text-xs">Grand Total Quote</span>
            <span className="font-mono text-lg">{formatCurrency(totals.totalGrandTotal)}</span>
          </div>
        </div>
      </div>

      {/* 5. Sign-off Footer block */}
      <div className="mt-16 border-t border-[#A5ACAF]/40 pt-10 print-break-inside-avoid text-sm">
        <div className="grid grid-cols-2 gap-12">
          <div>
            <div className="border-b border-slate-400 h-8"></div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2">
              Estimator Signature
            </p>
          </div>
          <div>
            <div className="border-b border-slate-400 h-8"></div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2">
              Client Acceptance (Date)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
