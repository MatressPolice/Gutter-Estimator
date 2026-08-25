import { Plus, Trash2, Copy, MoveUp, MoveDown, HelpCircle, AlertCircle } from 'lucide-react';
import { PartItem, PartCalculations } from '../types';
import { calculatePart, formatCurrency } from '../utils/calculations';

interface PartsTableProps {
  parts: PartItem[];
  hourlyRate: number;
  overheadPercent: number;
  profitPercent: number;
  activePartId: string | null;
  onSelectPart: (id: string) => void;
  onUpdatePart: (id: string, key: keyof PartItem, value: any) => void;
  onAddPart: () => void;
  onDeletePart: (id: string) => void;
  onDuplicatePart: (id: string) => void;
  onMovePart: (index: number, direction: 'up' | 'down') => void;
}

export default function PartsTable({
  parts,
  hourlyRate,
  overheadPercent,
  profitPercent,
  activePartId,
  onSelectPart,
  onUpdatePart,
  onAddPart,
  onDeletePart,
  onDuplicatePart,
  onMovePart,
}: PartsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Title and Actions */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 no-print">
        <div>
          <h2 className="font-display font-semibold text-base text-slate-900 flex items-center gap-2">
            Estimating Sheet
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Adjust orange-framed inputs to recalculate pricing.
          </p>
        </div>
        <button
          onClick={onAddPart}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Part / Line</span>
        </button>
      </div>

      {/* Spreadsheet Container */}
      <div className="overflow-x-auto bg-white rounded-b-xl shadow-xs">
        <table className="w-full text-left border-collapse min-w-[800px]">
          {/* Table Headers */}
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 divide-x divide-slate-100">
              <th className="w-[160px] px-3 py-2 font-display text-slate-500 bg-slate-50">Part Name</th>
              <th className="min-w-[140px] px-3 py-2 font-display text-sky-800 bg-sky-50/80">Labor Setup</th>
              <th className="min-w-[140px] px-3 py-2 font-display text-rose-800 bg-rose-50/80">Material Setup</th>
              <th className="min-w-[160px] px-3 py-2 font-display text-violet-800 bg-violet-50/80">Markups & Totals</th>
              <th className="min-w-[140px] px-3 py-2 font-display text-slate-500 bg-slate-50">Unit Pricing</th>
              <th className="w-[50px] px-2 py-2 text-center text-slate-500 bg-slate-50 no-print">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200">
            {parts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 bg-slate-50/30">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <AlertCircle className="w-10 h-10 text-slate-300" />
                    <p className="font-medium text-slate-500">No parts listed in this estimate.</p>
                    <button
                      onClick={onAddPart}
                      className="mt-1 text-sm font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      Click here to add your first part row
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              parts.map((part, index) => {
                const calcs = calculatePart(part, { hourlyRate, overheadPercent, profitPercent });
                const isSelected = activePartId === part.id;

                return (
                  <tr
                    key={part.id}
                    onClick={() => onSelectPart(part.id)}
                    className={`group divide-x divide-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/20 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Part Name */}
                    <td className="px-3 py-2.5 align-top bg-white">
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={part.name.match(/^\[PART\d+\]$/i) ? '' : part.name}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdatePart(part.id, 'name', e.target.value)}
                          className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded px-2 py-1.5 font-medium outline-hidden transition-all text-slate-900 text-xs shadow-2xs"
                        />
                        <div className="flex items-center justify-between text-[11px] px-1">
                          <span className="text-slate-500 font-semibold tracking-wide text-[10px]">UOM:</span>
                          <select
                            value={part.uom || ''}
                            onChange={(e) => onUpdatePart(part.id, 'uom', e.target.value as 'EA' | 'LF')}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 bg-white border border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs outline-hidden cursor-pointer"
                          >
                            <option value="" disabled></option>
                            <option value="EA">EA</option>
                            <option value="LF">LF</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* Labor Setup */}
                    <td className="px-3 py-2.5 align-top bg-sky-50/30">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-sky-900 font-medium">#OfHours:</span>
                          <input
                            type="number"
                            min="0"
                            step="0.25"
                            value={part.hours || ''}
                            placeholder="0.0"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onUpdatePart(part.id, 'hours', Number(e.target.value))}
                            className="w-16 text-right bg-white border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded px-1.5 py-0.5 font-mono outline-hidden font-bold text-orange-950 transition-all shadow-2xs"
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-sky-700">$/Hour:</span>
                          <span className="font-mono text-sky-700">{formatCurrency(hourlyRate)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] mt-0.5 pt-1 border-t border-sky-200/60 text-sky-950 bg-sky-100/50 px-1.5 py-1 rounded border-sky-200">
                          <span className="font-semibold">Hours$:</span>
                          <span className="font-mono font-bold">{formatCurrency(calcs.hoursCost)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Material Setup */}
                    <td className="px-3 py-2.5 align-top bg-rose-50/30">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-rose-900 font-medium">#Sheets:</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={part.sheets || ''}
                            placeholder="0"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onUpdatePart(part.id, 'sheets', Number(e.target.value))}
                            className="w-16 text-right bg-white border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded px-1.5 py-0.5 font-mono outline-hidden font-bold text-orange-950 transition-all shadow-2xs"
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-rose-900 font-medium">$PerSheet:</span>
                          <div className="relative">
                            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-orange-500 font-mono font-bold">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={part.pricePerSheet || ''}
                              placeholder="0.00"
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => onUpdatePart(part.id, 'pricePerSheet', Number(e.target.value))}
                              className="w-20 text-right bg-white border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded pl-4 pr-1.5 py-0.5 font-mono outline-hidden font-bold text-orange-950 transition-all shadow-2xs"
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[11px] mt-0.5 pt-1 border-t border-rose-200/60 text-rose-950 bg-rose-100/50 px-1.5 py-1 rounded border-rose-200">
                          <span className="font-semibold">Mat. Costs:</span>
                          <span className="font-mono font-bold">{formatCurrency(calcs.materialCosts)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Markups & Totals */}
                    <td className="px-3 py-2.5 align-top bg-violet-50/30">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-violet-900 font-medium">SubTotal:</span>
                          <span className="font-mono text-violet-950 bg-violet-100/60 px-1 py-0.5 rounded border border-violet-200/50">{formatCurrency(calcs.subTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-violet-700 pl-1">
                          <span>+ {overheadPercent}% Overhead:</span>
                          <span className="font-mono">{formatCurrency(calcs.overhead)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-violet-700 pl-1">
                          <span>+ {profitPercent}% Profit:</span>
                          <span className="font-mono">{formatCurrency(calcs.profit)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-0.5 pt-1 border-t border-violet-200/80 font-bold text-violet-950">
                          <span>TOTAL:</span>
                          <span className="font-mono text-sm">{formatCurrency(calcs.grandTotal)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Unit Pricing */}
                    <td className="px-3 py-2.5 align-top bg-white">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-600 font-medium">Quantity{part.uom ? ` (${part.uom})` : ''}:</span>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={part.quantity || ''}
                            placeholder="1"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onUpdatePart(part.id, 'quantity', Number(e.target.value))}
                            className="w-16 text-right bg-white border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded px-1.5 py-0.5 font-mono outline-hidden font-bold text-orange-950 transition-all shadow-2xs"
                          />
                        </div>
                        
                        <div className={`flex justify-between items-center text-[11px] mt-0.5 pt-1 border-t px-1.5 py-1 rounded ${part.quantity > 0 ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-rose-50/40 border-rose-200 text-rose-950'}`}>
                          <span className="font-semibold text-slate-700">Price{part.uom ? `/${part.uom}` : ''}:</span>
                          {part.quantity > 0 ? (
                            <span className="font-mono font-bold text-sm tracking-tight text-emerald-900">
                              {formatCurrency(calcs.pricePerEa)}
                            </span>
                          ) : (
                            <span className="flex items-center justify-end gap-1 font-medium text-rose-500 text-[10px]">
                              <AlertCircle className="w-3 h-3" />
                              <span>#DIV/0!</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-2 py-2.5 align-middle text-center bg-white no-print">
                      <div className="flex flex-col items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onDuplicatePart(part.id)}
                          className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer"
                          title="Duplicate row"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onMovePart(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded transition-colors cursor-pointer"
                            title="Move row up"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onMovePart(index, 'down')}
                            disabled={index === parts.length - 1}
                            className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded transition-colors cursor-pointer"
                            title="Move row down"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => onDeletePart(part.id)}
                          className="p-1.5 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded transition-colors cursor-pointer mt-2"
                          title="Delete row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
