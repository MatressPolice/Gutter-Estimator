import React, { useState } from 'react';
import { Estimate, EstimateTotals } from '../types';
import { calculatePart, calculateGutterShell, calculateComprehensiveTotals, formatCurrency } from '../utils/calculations';
import GutterLogo from './GutterLogo';

interface PrintDocumentProps {
  estimate: Estimate;
  totals?: EstimateTotals;
  viewMode?: 'detailed' | 'client';
}

export default function PrintDocument({ 
  estimate, 
  viewMode = 'detailed' 
}: PrintDocumentProps) {
  const [activeMode, setActiveMode] = useState<'detailed' | 'client'>(viewMode);
  const compTotals = calculateComprehensiveTotals(estimate);

  const dateFormatted = estimate.date
    ? new Date(estimate.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not Specified';

  const hasShells = estimate.shells && estimate.shells.length > 0;
  const hasParts = estimate.parts && estimate.parts.length > 0;

  return (
    <div className="w-full flex flex-col items-center">
      {/* View Mode Toggle (Shown on screen in preview, hidden during actual print) */}
      <div className="mb-4 no-print flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-xs">
        <span className="font-semibold text-slate-500">Printout Layout:</span>
        <button
          type="button"
          onClick={() => setActiveMode('detailed')}
          className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
            activeMode === 'detailed'
              ? 'bg-[#002244] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Detailed Workshop Breakdown
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('client')}
          className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
            activeMode === 'client'
              ? 'bg-[#002244] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Client Quotation (Clean)
        </button>
      </div>

      {/* Standard 8.5" x 11" Letter Document Container */}
      <div className="bg-white p-6 sm:p-8 border border-slate-300 rounded-xl shadow-lg print:shadow-none print:border-none print:p-0 print:m-0 mx-auto print-container max-w-[7.6in] w-full font-sans text-[#002244] leading-normal box-border">
        
        {/* 1. Header / Letterhead with Seattle Seahawks Light Brand */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b-2 border-[#002244] pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <GutterLogo size={50} />
            <div>
              <h1 className="font-display font-black text-2xl tracking-tight text-[#002244] uppercase">
                Work Estimate &amp; Pricing Quote
              </h1>
              <p className="text-[11px] text-slate-500 font-mono font-bold mt-0.5 tracking-wider">
                PRECISION SHEET METAL &amp; GUTTER FABRICATION
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="inline-block bg-[#002244] text-white border border-[#A5ACAF]/40 font-mono text-xs px-3 py-1 rounded font-bold shadow-2xs">
              Ref: {estimate.quoteNumber || 'QT-DRAFT'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Date: <span className="font-bold text-[#002244]">{dateFormatted}</span>
            </p>
          </div>
        </div>

        {/* 2. Addresses / Project Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1 font-display">
              Client / Requestor
            </h3>
            <p className="font-extrabold text-sm text-[#002244]">
              {estimate.clientName || 'Valued Client'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Custom Manufacturing &amp; Fabrication Services
            </p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1 font-display">
              Project Description
            </h3>
            <p className="font-bold text-xs text-[#002244]">
              {estimate.name || 'Custom Gutter & Parts Estimate'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
              {estimate.notes || 'Estimates calculated dynamically based on shop labor and raw material indices.'}
            </p>
          </div>
        </div>

        {/* 3. GUTTER SHELL TABLE (When shells exist in estimate) */}
        {hasShells && (
          <div className="mb-6 print-break-inside-avoid">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[#002244] uppercase tracking-wider text-[11px] font-display flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#69BE28]" />
                Gutter Shell Fabrication (Seamless Roll-Formed)
              </h3>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                Total Order LF: {compTotals.shellsTotalOrderLF} LF
              </span>
            </div>

            {activeMode === 'detailed' ? (
              /* Detailed Shell Table */
              <table className="w-full table-fixed text-[10px] border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-[#002244] text-white font-semibold">
                    <th className="w-[30%] px-2.5 py-1.5 text-left">Specs (Mfr / Color / Gauge)</th>
                    <th className="w-[18%] px-2 py-1.5 text-left">Coil Cost / Surcharge</th>
                    <th className="w-[14%] px-2 py-1.5 text-center">Footage (Order/Cust)</th>
                    <th className="w-[14%] px-2 py-1.5 text-center">Labor &amp; Markup</th>
                    <th className="w-[12%] px-2 py-1.5 text-right">Price/LF</th>
                    <th className="w-[12%] px-2 py-1.5 text-right font-bold text-[#69BE28]">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {estimate.shells.map((shell, idx) => {
                    const calcs = calculateGutterShell(shell);
                    return (
                      <tr key={shell.id || idx} className="hover:bg-slate-50/50">
                        <td className="px-2.5 py-1.5 text-left font-bold text-[#002244]">
                          <div>{shell.manufacturer || 'Standard'} {shell.color || ''}</div>
                          <span className="text-[9px] text-slate-500 font-normal font-mono">{shell.gauge || 'Standard Gauge'}</span>
                        </td>
                        <td className="px-2 py-1.5 text-left font-mono">
                          {shell.isCustomerCoil ? (
                            <span className="text-amber-700 font-semibold">Customer Supplied Coil</span>
                          ) : (
                            <div>
                              <span>{formatCurrency(shell.pricePerSheet > 0 ? shell.pricePerSheet / 20 : shell.costPerLF)}/LF</span>
                              {(shell.slitCharge > 0 || shell.freight > 0) && (
                                <span className="text-[8px] text-slate-400 block">
                                  +{formatCurrency(shell.slitCharge + shell.freight)} fees
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-center font-mono font-medium">
                          <div>{shell.orderLF} LF (Ord)</div>
                          {shell.customerLF > 0 && shell.customerLF !== shell.orderLF && (
                            <div className="text-[9px] text-slate-500 font-normal">{shell.customerLF} LF (Cust)</div>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-center font-mono">
                          <div>Labor: {formatCurrency(calcs.labor)}/LF</div>
                          <div className="text-[8px] text-slate-500">+43% Markup</div>
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono font-bold text-[#002244]">
                          {shell.customerLF > 0 ? formatCurrency(calcs.customerLFS) : formatCurrency(calcs.priceChargedLF)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono font-extrabold text-[#002244] bg-[#f0fdf4]">
                          {formatCurrency(calcs.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* Clean Client Shell Table */
              <table className="w-full table-fixed text-[10px] border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-[#002244] text-white font-semibold">
                    <th className="w-[45%] px-3 py-1.5 text-left">Gutter Shell Description</th>
                    <th className="w-[20%] px-2 py-1.5 text-center">Footage</th>
                    <th className="w-[17%] px-2 py-1.5 text-right">Unit Price / LF</th>
                    <th className="w-[18%] px-3 py-1.5 text-right font-bold text-[#69BE28]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {estimate.shells.map((shell, idx) => {
                    const calcs = calculateGutterShell(shell);
                    return (
                      <tr key={shell.id || idx}>
                        <td className="px-3 py-1.5 text-left">
                          <span className="font-bold text-[#002244]">Seamless Roll-Formed Gutter Shell</span>
                          <span className="block text-[9px] text-slate-500 font-mono">
                            {shell.manufacturer} {shell.color} {shell.gauge ? `(${shell.gauge})` : ''} {shell.isCustomerCoil ? '• Customer Supplied Coil' : ''}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-center font-mono font-medium">
                          {shell.customerLF > 0 ? shell.customerLF : shell.orderLF} LF
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono font-semibold text-[#002244]">
                          {shell.customerLF > 0 ? formatCurrency(calcs.customerLFS) : formatCurrency(calcs.priceChargedLF)} / LF
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-extrabold text-[#002244] bg-[#f0fdf4]">
                          {formatCurrency(calcs.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 4. CUSTOM PARTS TABLE (When parts exist in estimate) */}
        {hasParts && (
          <div className="mb-6 print-break-inside-avoid">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-[#002244] uppercase tracking-wider text-[11px] font-display flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#69BE28]" />
                Custom Sheet Metal &amp; Gutter Parts
              </h3>
              <span className="text-[10px] font-mono text-slate-500 font-semibold">
                Total Parts: {estimate.parts.length} Lines
              </span>
            </div>

            {activeMode === 'detailed' ? (
              /* Detailed Parts Table (Fits within 7.6" width perfectly) */
              <table className="w-full table-fixed text-[10px] border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-[#002244] text-white font-semibold">
                    <th className="w-[28%] px-2.5 py-1.5 text-left">Part Name &amp; Description</th>
                    <th className="w-[18%] px-2 py-1.5 text-left">Labor Setup</th>
                    <th className="w-[18%] px-2 py-1.5 text-left">Material Setup</th>
                    <th className="w-[12%] px-1.5 py-1.5 text-right">O/H &amp; Profit</th>
                    <th className="w-[10%] px-1.5 py-1.5 text-center">Qty</th>
                    <th className="w-[14%] px-2.5 py-1.5 text-right font-bold text-[#69BE28]">Unit / Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {estimate.parts.map((part, idx) => {
                    const calcs = calculatePart(part, estimate);
                    return (
                      <tr key={part.id || idx} className="hover:bg-slate-50/50">
                        <td className="px-2.5 py-1.5 text-left font-bold text-[#002244] truncate" title={part.name}>
                          <div>{part.name || `Custom Part #${idx + 1}`}</div>
                          <span className="text-[9px] text-slate-500 font-mono font-normal">Subtotal: {formatCurrency(calcs.subTotal)}</span>
                        </td>
                        <td className="px-2 py-1.5 text-left font-mono">
                          <div>{part.hours.toFixed(2)}h @ {formatCurrency(estimate.hourlyRate)}</div>
                          <span className="text-[9px] text-slate-500 font-medium font-mono">{formatCurrency(calcs.hoursCost)}</span>
                        </td>
                        <td className="px-2 py-1.5 text-left font-mono">
                          <div>{part.sheets} sht @ {formatCurrency(part.pricePerSheet)}</div>
                          <span className="text-[9px] text-slate-500 font-medium font-mono">{formatCurrency(calcs.materialCosts)}</span>
                        </td>
                        <td className="px-1.5 py-1.5 text-right font-mono">
                          <div className="text-[9px] text-slate-500">O/H: {formatCurrency(calcs.overhead)}</div>
                          <div className="text-[9px] text-[#69BE28] font-semibold">Prf: {formatCurrency(calcs.profit)}</div>
                        </td>
                        <td className="px-1.5 py-1.5 text-center font-mono font-bold text-[#002244]">
                          {part.quantity}
                          {part.uom ? <span className="text-[8px] font-normal text-slate-500 block">{part.uom}</span> : null}
                        </td>
                        <td className="px-2.5 py-1.5 text-right font-mono bg-[#f0fdf4]">
                          <div className="font-extrabold text-[#002244]">
                            {part.quantity > 0 ? formatCurrency(calcs.pricePerEa) : 'N/A'}
                            {part.uom ? <span className="text-[8px] font-normal text-slate-600">/{part.uom}</span> : null}
                          </div>
                          <span className="text-[9px] font-semibold text-slate-600 block">
                            Tot: {formatCurrency(calcs.grandTotal)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* Clean Client Parts Table */
              <table className="w-full table-fixed text-[10px] border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-[#002244] text-white font-semibold">
                    <th className="w-[45%] px-3 py-1.5 text-left">Item Description</th>
                    <th className="w-[20%] px-2 py-1.5 text-center">Quantity</th>
                    <th className="w-[17%] px-2 py-1.5 text-right">Unit Price</th>
                    <th className="w-[18%] px-3 py-1.5 text-right font-bold text-[#69BE28]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {estimate.parts.map((part, idx) => {
                    const calcs = calculatePart(part, estimate);
                    return (
                      <tr key={part.id || idx}>
                        <td className="px-3 py-1.5 text-left font-bold text-[#002244]">
                          {part.name || `Custom Part #${idx + 1}`}
                        </td>
                        <td className="px-2 py-1.5 text-center font-mono font-medium">
                          {part.quantity} {part.uom || 'EA'}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono font-semibold text-[#002244]">
                          {part.quantity > 0 ? formatCurrency(calcs.pricePerEa) : 'N/A'} {part.uom ? `/${part.uom}` : ''}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-extrabold text-[#002244] bg-[#f0fdf4]">
                          {formatCurrency(calcs.grandTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 5. Aggregate Grand Totals (Summary Table) */}
        <div className="flex justify-end mb-8 print-break-inside-avoid">
          <div className="w-full sm:w-76 space-y-1.5 text-xs border-t-2 border-[#002244] pt-3">
            {hasParts && (
              <>
                <div className="flex justify-between items-center py-0.5 text-[11px] text-slate-600">
                  <span className="font-medium">Parts Labor ({compTotals.partsTotalHours.toFixed(1)} hrs):</span>
                  <span className="font-mono">{formatCurrency(compTotals.partsTotalHoursCost)}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 text-[11px] text-slate-600">
                  <span className="font-medium">Parts Materials ({compTotals.partsTotalSheets.toFixed(1)} sht):</span>
                  <span className="font-mono">{formatCurrency(compTotals.partsTotalMaterialCosts)}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 text-[11px] text-slate-600">
                  <span className="font-medium">Parts Overhead &amp; Profit:</span>
                  <span className="font-mono">{formatCurrency(compTotals.partsTotalOverhead + compTotals.partsTotalProfit)}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 text-[11px] font-semibold text-[#002244] border-t border-slate-100">
                  <span>Parts Subtotal:</span>
                  <span className="font-mono">{formatCurrency(compTotals.partsGrandTotal)}</span>
                </div>
              </>
            )}

            {hasShells && (
              <div className="flex justify-between items-center py-0.5 text-[11px] font-semibold text-[#002244] border-t border-slate-100">
                <span>Gutter Shells ({compTotals.shellsTotalOrderLF} LF):</span>
                <span className="font-mono">{formatCurrency(compTotals.shellsGrandTotal)}</span>
              </div>
            )}

            {/* Comprehensive Grand Total */}
            <div className="flex justify-between items-center py-2 px-3 bg-[#f0fdf4] text-[#002244] font-extrabold rounded-lg border-2 border-[#69BE28] text-sm shadow-xs mt-2">
              <span className="uppercase tracking-tight text-[11px]">Grand Total Quote</span>
              <span className="font-mono text-base">{formatCurrency(compTotals.combinedGrandTotal)}</span>
            </div>
          </div>
        </div>

        {/* 6. Sign-off Footer block */}
        <div className="mt-8 border-t border-[#A5ACAF]/40 pt-6 print-break-inside-avoid text-xs">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-slate-400 h-6"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                Estimator Signature
              </p>
            </div>
            <div>
              <div className="border-b border-slate-400 h-6"></div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">
                Client Acceptance (Date)
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
