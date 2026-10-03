import { Plus, AlertCircle } from 'lucide-react';
import { GutterShellItem } from '../types';
import GutterShellTableRow from './GutterShellTableRow';

interface GutterShellTableProps {
  shells: GutterShellItem[];
  activeShellId: string | null;
  onSelectShell: (id: string) => void;
  onUpdateShell: <K extends keyof GutterShellItem>(id: string, key: K, value: GutterShellItem[K]) => void;
  onAddShell: () => void;
  onDeleteShell: (id: string) => void;
  onDuplicateShell: (id: string) => void;
  onMoveShell: (index: number, direction: 'up' | 'down') => void;
}

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
                <GutterShellTableRow
                  key={shell.id}
                  shell={shell}
                  index={index}
                  isSelected={activeShellId === shell.id}
                  totalShells={shells.length}
                  onSelectShell={onSelectShell}
                  onUpdateShell={onUpdateShell}
                  onDeleteShell={onDeleteShell}
                  onDuplicateShell={onDuplicateShell}
                  onMoveShell={onMoveShell}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
