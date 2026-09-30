import { memo } from 'react';
import { Plus, Trash2, Copy, MoveUp, MoveDown, AlertCircle } from 'lucide-react';
import { GutterShellItem } from '../types';
import { calculateGutterShell, formatCurrency } from '../utils/calculations';

interface GutterShellTableProps {
  shells: GutterShellItem[];
  activeShellId: string | null;
  onSelectShell: (id: string) => void;
  onUpdateShell: (id: string, key: keyof GutterShellItem, value: any) => void;
  onAddShell: () => void;
  onDeleteShell: (id: string) => void;
  onDuplicateShell: (id: string) => void;
  onMoveShell: (index: number, direction: 'up' | 'down') => void;
}


interface GutterShellRowProps {
  shell: GutterShellItem;
  index: number;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelectShell: (id: string) => void;
  onUpdateShell: (id: string, key: keyof GutterShellItem, value: any) => void;
  onDuplicateShell: (id: string) => void;
  onMoveShell: (index: number, direction: 'up' | 'down') => void;
  onDeleteShell: (id: string) => void;
}

const GutterShellRow = memo(function GutterShellRow({
  shell,
  index,
  isSelected,
  isFirst,
  isLast,
  onSelectShell,
  onUpdateShell,
  onDuplicateShell,
  onMoveShell,
  onDeleteShell,
}: GutterShellRowProps) {
  const calcs = calculateGutterShell(shell);

  return (
    <tr
      onClick={() => onSelectShell(shell.id)}
      className={`group divide-x divide-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer text-[11px] ${
        isSelected ? 'bg-[#002244]/5 border-l-4 border-l-[#69BE28]' : 'border-l-4 border-l-transparent'
      }`}
    >
                    {/* Material Specs */}
                    <td className="px-3 py-2.5 align-top bg-white">
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="text"
                          value={shell.manufacturer}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateShell(shell.id, 'manufacturer', e.target.value)}
                          placeholder="Manufacturer"
                          className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#002244] focus:ring-1 focus:ring-[#002244] rounded px-2 py-1.5 font-medium outline-hidden transition-all text-[#002244] text-xs shadow-2xs"
                        />
                        <input
                          type="text"
                          value={shell.color}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateShell(shell.id, 'color', e.target.value)}
                          placeholder="Color"
                          className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#002244] focus:ring-1 focus:ring-[#002244] rounded px-2 py-1.5 font-medium outline-hidden transition-all text-[#002244] text-xs shadow-2xs"
                        />
                        <select
                          value={shell.gauge}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateShell(shell.id, 'gauge', e.target.value as any)}
                          className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#002244] focus:ring-1 focus:ring-[#002244] rounded px-2 py-1.5 font-medium outline-hidden transition-all text-[#002244] text-xs shadow-2xs"
                        >
                          <option value="" disabled>Select Gauge...</option>
                          <option value="22 Gauge">22 Gauge</option>
                          <option value="24 Gauge">24 Gauge</option>
                          <option value=".032">.032</option>
                        </select>
                        <label
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-center gap-1.5 mt-0.5 cursor-pointer select-none text-[10px] font-semibold rounded px-2 py-1 border transition-colors ${
                            shell.isCustomerCoil
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!shell.isCustomerCoil}
                            onChange={(e) => onUpdateShell(shell.id, 'isCustomerCoil', e.target.checked)}
                            className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Customer Coil</span>
                        </label>
                      </div>
                    </td>

                    {/* Base Costs */}
                    <td className="px-3 py-2.5 align-top bg-slate-50/30">
                      <div className="flex flex-col gap-1.5">
                        {shell.isCustomerCoil ? (
                          <div className="bg-amber-50/80 border border-amber-200 text-amber-800 text-[10px] p-2 rounded text-center font-medium my-auto">
                            <span className="block font-bold uppercase tracking-wider text-[9px] text-amber-900">Bypassed</span>
                            Customer Supplied Coil
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-[#002244] font-medium">$PerSheet:</span>
                              <div className="relative">
                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-orange-500 font-mono font-bold">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={shell.pricePerSheet || ''}
                                  placeholder="0.00"
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => onUpdateShell(shell.id, 'pricePerSheet', Number(e.target.value))}
                                  className="w-16 text-right bg-white border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded pl-4 pr-1.5 py-0.5 font-mono outline-hidden font-bold text-orange-950 transition-all shadow-2xs"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-[#002244] font-medium">Cost/LF:</span>
                              <div className="relative">
                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-orange-500 font-mono font-bold">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={shell.pricePerSheet > 0 ? (shell.pricePerSheet / 20).toFixed(2) : (shell.costPerLF || '')}
                                  disabled={shell.pricePerSheet > 0}
                                  placeholder={shell.pricePerSheet > 0 ? '' : '0.00'}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => onUpdateShell(shell.id, 'costPerLF', Number(e.target.value))}
                                  className={`w-16 text-right bg-white border ${shell.pricePerSheet > 0 ? 'border-slate-200 text-slate-500 bg-slate-50' : 'border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'} rounded pl-4 pr-1.5 py-0.5 font-mono outline-hidden font-bold transition-all shadow-2xs ${shell.pricePerSheet > 0 ? '' : 'text-orange-950'}`}
                                />
                              </div>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-[#002244] font-medium">OrderLF:</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={shell.orderLF || ''}
                            placeholder="0"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onUpdateShell(shell.id, 'orderLF', Number(e.target.value))}
                            className="w-16 text-right bg-white border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded px-1.5 py-0.5 font-mono outline-hidden font-bold text-orange-950 transition-all shadow-2xs"
                          />
                        </div>
                        <div className="flex justify-between items-center text-[11px] mt-0.5 pt-1 border-t border-slate-200 text-[#002244] bg-slate-100/60 px-1.5 py-1 rounded">
                          <span className="font-semibold">SubTotal:</span>
                          <span className="font-mono font-bold">{formatCurrency(calcs.subTotal)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Add-ons & Total Cost */}
                    <td className="px-3 py-2.5 align-top bg-slate-50/30">
                      <div className="flex flex-col gap-1.5">
                        {shell.isCustomerCoil ? (
                          <div className="bg-slate-100/80 border border-slate-200 text-slate-500 text-[10px] p-2 rounded text-center font-medium my-auto">
                            No slit/freight charges
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-[#002244] font-medium">Slit Charge:</span>
                              <div className="relative">
                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-orange-500 font-mono font-bold">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={shell.slitCharge || ''}
                                  placeholder="0.00"
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => onUpdateShell(shell.id, 'slitCharge', Number(e.target.value))}
                                  className="w-16 text-right bg-white border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded pl-4 pr-1.5 py-0.5 font-mono outline-hidden font-bold text-orange-950 transition-all shadow-2xs"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-[#002244] font-medium">Freight:</span>
                              <div className="relative">
                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-orange-500 font-mono font-bold">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={shell.freight || ''}
                                  placeholder="0.00"
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => onUpdateShell(shell.id, 'freight', Number(e.target.value))}
                                  className="w-16 text-right bg-white border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded pl-4 pr-1.5 py-0.5 font-mono outline-hidden font-bold text-orange-950 transition-all shadow-2xs"
                                />
                              </div>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between items-center text-[11px] mt-0.5 pt-1 border-t border-slate-200 text-[#002244] bg-slate-100/60 px-1.5 py-1 rounded">
                          <span className="font-semibold">Total Cost:</span>
                          <span className="font-mono font-bold">{formatCurrency(calcs.totalCost)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-[#002244] px-1.5 py-0.5">
                          <span className="font-semibold">Total Cost/LF:</span>
                          {shell.isCustomerCoil ? (
                            <span className="font-mono text-slate-400">$0.00</span>
                          ) : shell.orderLF > 0 ? (
                            <span className="font-mono font-bold text-[#002244]">{formatCurrency(calcs.totalCostLF)}</span>
                          ) : (
                            <span className="flex items-center gap-1 font-medium text-rose-400 text-[10px]">
                              <AlertCircle className="w-3 h-3" />
                              <span>#DIV/0!</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Markups & Totals */}
                    <td className="px-3 py-2.5 align-top bg-slate-50/50">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-600 pl-1">
                          <span>Markup ({shell.isCustomerCoil ? '43% Labor' : '43%'}):</span>
                          <span className="font-mono">{shell.isCustomerCoil || shell.orderLF > 0 ? formatCurrency(calcs.markup) : '#DIV/0!'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-600 pl-1">
                          <span>Labor:</span>
                          <span className="font-mono">{formatCurrency(calcs.labor)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-[#002244] font-medium mt-1">
                          <span>Price Charged/LF:</span>
                          <span className="font-mono font-semibold">{shell.isCustomerCoil || shell.orderLF > 0 ? formatCurrency(calcs.priceChargedLF) : '#DIV/0!'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-0.5 pt-1 border-t border-slate-200 font-bold text-[#002244]">
                          <span>TOTAL:</span>
                          <span className="font-mono text-sm">{shell.orderLF > 0 ? formatCurrency(calcs.total) : '#DIV/0!'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Customer Pricing (Action Green Accent) */}
                    <td className="px-3 py-2.5 align-top bg-white">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-600 font-medium">CustomerLF:</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={shell.customerLF || ''}
                            placeholder="0"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onUpdateShell(shell.id, 'customerLF', Number(e.target.value))}
                            className="w-16 text-right bg-white border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded px-1.5 py-0.5 font-mono outline-hidden font-bold text-orange-950 transition-all shadow-2xs"
                          />
                        </div>
                        <div className={`flex justify-between items-center text-[11px] mt-0.5 pt-1 border-t px-1.5 py-1 rounded ${shell.customerLF > 0 ? 'bg-[#f0fdf4] border-[#69BE28]/40 text-[#002244]' : 'bg-rose-50 border-rose-200 text-rose-950'}`}>
                          <span className="font-bold text-[#002244]">CustomerLF$:</span>
                          {shell.customerLF > 0 ? (
                            <span className="font-mono font-extrabold text-sm tracking-tight text-[#002244]">
                              {formatCurrency(calcs.customerLFS)}
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
                    <td className="px-2 py-2 align-middle text-center bg-white no-print">
                      <div className="flex flex-col items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onDuplicateShell(shell.id)}
                          className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-[#002244] rounded transition-colors cursor-pointer"
                          title="Duplicate row"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <div className="flex gap-1">
                          <button
                            onClick={() => onMoveShell(index, 'up')}
                            disabled={isFirst}
                            className="p-1 hover:bg-slate-200 text-slate-500 hover:text-[#002244] disabled:opacity-30 rounded transition-colors cursor-pointer"
                            title="Move row up"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onMoveShell(index, 'down')}
                            disabled={isLast}
                            className="p-1 hover:bg-slate-200 text-slate-500 hover:text-[#002244] disabled:opacity-30 rounded transition-colors cursor-pointer"
                            title="Move row down"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => onDeleteShell(shell.id)}
                          className="p-1.5 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded transition-colors cursor-pointer mt-2"
                          title="Delete row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
    </tr>
  );
});

export default function GutterShellTable({
  shells,
  activeShellId,
  onSelectShell,
  onUpdateShell,
  onAddShell,
  onDeleteShell,
  onDuplicateShell,
  onMoveShell,
}: GutterShellTableProps) {
  return (
    <div className="bg-white rounded-xl border border-[#A5ACAF]/40 shadow-xs overflow-hidden">
      {/* Table Title and Actions */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/70 no-print">
        <div>
          <h2 className="font-display font-bold text-base text-[#002244] flex items-center gap-2">
            Gutter Shell Estimating Sheet
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Adjust orange-framed inputs to recalculate pricing.
          </p>
        </div>
        <button
          onClick={onAddShell}
          className="px-4 py-2 bg-[#69BE28] hover:bg-[#5aa721] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#69BE28]/25 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Shell / Line</span>
        </button>
      </div>

      {/* Spreadsheet Container */}
      <div className="overflow-x-auto bg-white rounded-b-xl shadow-xs">
        <table className="w-full text-left border-collapse min-w-[900px]">
          {/* Table Headers */}
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 divide-x divide-slate-100">
              <th className="w-[160px] px-3 py-2 font-display text-[#002244] bg-slate-50">Material Specs</th>
              <th className="min-w-[150px] px-3 py-2 font-display text-[#002244] bg-slate-100/70">Base Costs</th>
              <th className="min-w-[150px] px-3 py-2 font-display text-[#002244] bg-slate-50">Add-ons & Total Cost</th>
              <th className="min-w-[160px] px-3 py-2 font-display text-[#002244] bg-slate-100/70">Markups & Totals</th>
              <th className="min-w-[140px] px-3 py-2 font-display text-[#002244] bg-[#f0fdf4]">Customer Pricing</th>
              <th className="w-[50px] px-2 py-2 text-center text-slate-500 bg-slate-50 no-print">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200">
            {shells.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400 bg-slate-50/30">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <AlertCircle className="w-10 h-10 text-slate-300" />
                    <p className="font-medium text-[#002244]">No gutter shells listed in this estimate.</p>
                    <button
                      onClick={onAddShell}
                      className="mt-1 text-sm font-bold text-[#69BE28] hover:text-[#5aa721] underline cursor-pointer"
                    >
                      Click here to add your first shell row
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              shells.map((shell, index) => (
                <GutterShellRow
                  key={shell.id}
                  shell={shell}
                  index={index}
                  isSelected={activeShellId === shell.id}
                  isFirst={index === 0}
                  isLast={index === shells.length - 1}
                  onSelectShell={onSelectShell}
                  onUpdateShell={onUpdateShell}
                  onDuplicateShell={onDuplicateShell}
                  onMoveShell={onMoveShell}
                  onDeleteShell={onDeleteShell}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
