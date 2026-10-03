import { Plus, AlertCircle } from 'lucide-react';
import { PartItem } from '../types';
import PartRow from './parts-table/PartRow';

interface PartsTableProps {
  parts: PartItem[];
  hourlyRate: number;
  overheadPercent: number;
  profitPercent: number;
  activePartId: string | null;
  onSelectPart: (id: string) => void;
  onUpdatePart: <K extends keyof PartItem>(id: string, key: K, value: PartItem[K]) => void;
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
    <div className="bg-white rounded-xl border border-[#A5ACAF]/40 shadow-xs overflow-hidden">
      {/* Table Title and Actions */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/70 no-print">
        <div>
          <h2 className="font-display font-bold text-base text-[#002244] flex items-center gap-2">
            Estimating Sheet
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            Adjust orange-framed inputs to recalculate pricing.
          </p>
        </div>
        <button
          onClick={onAddPart}
          className="px-4 py-2 bg-[#69BE28] hover:bg-[#5aa721] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#69BE28]/25 transition-all cursor-pointer"
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
              <th className="w-[160px] px-3 py-2 font-display text-[#002244] bg-slate-50">Part Name</th>
              <th className="min-w-[140px] px-3 py-2 font-display text-[#002244] bg-slate-100/70">Labor Setup</th>
              <th className="min-w-[140px] px-3 py-2 font-display text-[#002244] bg-slate-50">Material Setup</th>
              <th className="min-w-[160px] px-3 py-2 font-display text-[#002244] bg-slate-100/70">Markups & Totals</th>
              <th className="min-w-[140px] px-3 py-2 font-display text-[#002244] bg-[#f0fdf4]">Unit Pricing</th>
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
                    <p className="font-medium text-[#002244]">No parts listed in this estimate.</p>
                    <button
                      onClick={onAddPart}
                      className="mt-1 text-sm font-bold text-[#69BE28] hover:text-[#5aa721] underline cursor-pointer"
                    >
                      Click here to add your first part row
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              parts.map((part, index) => (
                <PartRow
                  key={part.id}
                  part={part}
                  index={index}
                  totalParts={parts.length}
                  hourlyRate={hourlyRate}
                  overheadPercent={overheadPercent}
                  profitPercent={profitPercent}
                  isSelected={activePartId === part.id}
                  onSelectPart={onSelectPart}
                  onUpdatePart={onUpdatePart}
                  onDeletePart={onDeletePart}
                  onDuplicatePart={onDuplicatePart}
                  onMovePart={onMovePart}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
