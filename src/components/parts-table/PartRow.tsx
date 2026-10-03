import React, { useMemo } from 'react';
import { Plus, Trash2, Copy, MoveUp, MoveDown, AlertCircle } from 'lucide-react';
import { PartItem } from '../../types';
import { calculatePart, formatCurrency } from '../../utils/calculations';
import DivZeroWarning from '../DivZeroWarning';

interface PartRowProps {
  key?: string;
  part: PartItem;
  index: number;
  totalParts: number;
  hourlyRate: number;
  overheadPercent: number;
  profitPercent: number;
  isSelected: boolean;
  onSelectPart: (id: string) => void;
  onUpdatePart: (id: string, key: keyof PartItem, value: any) => void;
  onDeletePart: (id: string) => void;
  onDuplicatePart: (id: string) => void;
  onMovePart: (index: number, direction: 'up' | 'down') => void;
}

function PartRow({
  part,
  index,
  totalParts,
  hourlyRate,
  overheadPercent,
  profitPercent,
  isSelected,
  onSelectPart,
  onUpdatePart,
  onDeletePart,
  onDuplicatePart,
  onMovePart,
}: PartRowProps) {
  const calcs = useMemo(
    () => calculatePart(part, { hourlyRate, overheadPercent, profitPercent }),
    [part, hourlyRate, overheadPercent, profitPercent]
  );

  return (
    <tr
      onClick={() => onSelectPart(part.id)}
      className={`group divide-x divide-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer ${
        isSelected ? 'bg-[#002244]/5 border-l-4 border-l-[#69BE28]' : 'border-l-4 border-l-transparent'
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
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#002244] focus:ring-1 focus:ring-[#002244] rounded px-2 py-1.5 font-medium outline-hidden transition-all text-[#002244] text-xs shadow-2xs"
          />
          <div className="flex items-center justify-between text-[11px] px-1">
            <span className="text-slate-500 font-semibold tracking-wide text-[10px]">UOM:</span>
            <select
              value={part.uom || ''}
              onChange={(e) => onUpdatePart(part.id, 'uom', e.target.value as 'EA' | 'LF')}
              onClick={(e) => e.stopPropagation()}
              className="w-16 bg-white border border-slate-200 focus:border-[#002244] focus:ring-1 focus:ring-[#002244] rounded px-1.5 py-0.5 text-[10px] font-bold text-[#002244] shadow-2xs outline-hidden cursor-pointer"
            >
              <option value="" disabled></option>
              <option value="EA">EA</option>
              <option value="LF">LF</option>
            </select>
          </div>
        </div>
      </td>

      {/* Labor Setup */}
      <td className="px-3 py-2.5 align-top bg-slate-50/30">
        <div className="flex flex-col gap-1.5">

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#002244] font-medium">#OfHours:</span>
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
            <span className="text-slate-600">$/Hour:</span>
            <span className="font-mono text-[#002244] font-medium">{formatCurrency(hourlyRate)}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] mt-0.5 pt-1 border-t border-slate-200 text-[#002244] bg-slate-100/60 px-1.5 py-1 rounded">
            <span className="font-semibold">Hours$:</span>
            <span className="font-mono font-bold">{formatCurrency(calcs.hoursCost)}</span>
          </div>
        </div>
      </td>

      {/* Material Setup */}
      <td className="px-3 py-2.5 align-top bg-slate-50/30">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#002244] font-medium">#Sheets:</span>
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
            <span className="text-[#002244] font-medium">$PerSheet:</span>
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
          <div className="flex justify-between items-center text-[11px] mt-0.5 pt-1 border-t border-slate-200 text-[#002244] bg-slate-100/60 px-1.5 py-1 rounded">
            <span className="font-semibold">Mat. Costs:</span>
            <span className="font-mono font-bold">{formatCurrency(calcs.materialCosts)}</span>
          </div>
        </div>
      </td>

      {/* Markups & Totals */}
      <td className="px-3 py-2.5 align-top bg-slate-50/50">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#002244] font-medium">SubTotal:</span>
            <span className="font-mono text-[#002244] bg-white px-1 py-0.5 rounded border border-slate-200 font-semibold">{formatCurrency(calcs.subTotal)}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-600 pl-1">
            <span>+ {overheadPercent}% Overhead:</span>
            <span className="font-mono">{formatCurrency(calcs.overhead)}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#69BE28] font-bold pl-1">
            <span>+ {profitPercent}% Profit:</span>
            <span className="font-mono">{formatCurrency(calcs.profit)}</span>
          </div>
          <div className="flex justify-between items-center text-xs mt-0.5 pt-1 border-t border-slate-200 font-bold text-[#002244]">
            <span>TOTAL:</span>
            <span className="font-mono text-sm">{formatCurrency(calcs.grandTotal)}</span>
          </div>
        </div>
      </td>

      {/* Unit Pricing (Action Green Accent) */}
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

          <div className={`flex justify-between items-center text-[11px] mt-0.5 pt-1 border-t px-1.5 py-1 rounded ${part.quantity > 0 ? 'bg-[#f0fdf4] border-[#69BE28]/40 text-[#002244]' : 'bg-rose-50 border-rose-200 text-rose-950'}`}>
            <span className="font-bold text-[#002244]">Price{part.uom ? `/${part.uom}` : ''}:</span>
            {part.quantity > 0 ? (
              <span className="font-mono font-extrabold text-sm tracking-tight text-[#002244]">
                {formatCurrency(calcs.pricePerEa)}
              </span>
            ) : (
              <DivZeroWarning />
            )}
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="px-2 py-2.5 align-middle text-center bg-white no-print">
        <div className="flex flex-col items-center justify-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onDuplicatePart(part.id)}
            className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-[#002244] rounded transition-colors cursor-pointer"
            title="Duplicate row"
          >
            <Copy className="w-4 h-4" />
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => onMovePart(index, 'up')}
              disabled={index === 0}
              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-[#002244] disabled:opacity-30 rounded transition-colors cursor-pointer"
              title="Move row up"
            >
              <MoveUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMovePart(index, 'down')}
              disabled={index === totalParts - 1}
              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-[#002244] disabled:opacity-30 rounded transition-colors cursor-pointer"
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
}

export default React.memo(PartRow);
