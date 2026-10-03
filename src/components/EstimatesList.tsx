import { useState } from 'react';
import { Database, Search, Calendar, Trash2, X, PlusCircle, Copy, Edit3, Printer, CheckCircle2 } from 'lucide-react';
import { Estimate } from '../types';
import { formatCurrency } from '../utils/calculations';

interface EstimatesListProps {
  estimates: Estimate[];
  currentEstimateId: string;
  onLoadEstimate: (id: string, openPrintPreview?: boolean) => void;
  onDeleteEstimate: (id: string) => void;
  onDuplicateEstimate: (id: string) => void;
  onCreateNew: () => void;
  onClose: () => void;
}

export default function EstimatesList({
  estimates,
  currentEstimateId,
  onLoadEstimate,
  onDeleteEstimate,
  onDuplicateEstimate,
  onCreateNew,
  onClose,
}: EstimatesListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchQuery.toLowerCase();
  const filtered = estimates.filter((e) => {
    return (
      e.name.toLowerCase().includes(query) ||
      e.clientName.toLowerCase().includes(query) ||
      e.quoteNumber.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#00162B] text-white w-96 max-w-full shadow-2xl relative border-l border-[#A5ACAF]/20 z-50">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#0A2C52] flex items-center justify-between bg-[#002244]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#69BE28]/15 rounded-lg border border-[#69BE28]/30">
            <Database className="w-5 h-5 text-[#69BE28]" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-white leading-tight">
              Saved Quotes &amp; Estimates
            </h2>
            <p className="text-[11px] text-[#A5ACAF]">
              {estimates.length} {estimates.length === 1 ? 'quote' : 'quotes'} available
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[#00162B] text-[#A5ACAF] hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3.5 border-b border-[#0A2C52] bg-[#001224]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A5ACAF] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by quote name, customer, #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#002244] border border-[#0A3663] text-xs pl-9 pr-3 py-2 rounded-lg focus:outline-hidden focus:border-[#69BE28] text-white placeholder:text-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Quote List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <p className="font-semibold text-slate-300 text-sm mb-1">No matching quotes found</p>
            <p>{searchQuery ? 'Try adjusting your search criteria' : 'Click "Save Estimate" to add your first quote!'}</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isCurrent = item.id === currentEstimateId;
            const totalSum = (item.parts || []).reduce((sum, part) => {
              const sub = (part.hours * item.hourlyRate) + (part.sheets * part.pricePerSheet);
              const oh = sub * (item.overheadPercent / 100);
              const pr = sub * (item.profitPercent / 100);
              return sum + sub + oh + pr;
            }, 0);

            return (
              <div
                key={item.id}
                onClick={() => onLoadEstimate(item.id, false)}
                className={`p-4 rounded-xl border transition-all text-left cursor-pointer ${
                  isCurrent
                    ? 'bg-[#002244] border-[#69BE28] text-white shadow-xl ring-2 ring-[#69BE28]/50'
                    : 'bg-[#001E3D] hover:bg-[#002852] border-[#0A3663] hover:border-[#A5ACAF]/50 text-slate-300 shadow-md'
                }`}
              >
                {/* Active Indicator Header Badge */}
                {isCurrent && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#69BE28] bg-[#69BE28]/10 px-2 py-0.5 rounded-md mb-2 border border-[#69BE28]/30 w-fit">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Currently Active in Workspace</span>
                  </div>
                )}

                {/* Quote Title & Reference */}
                <div className="flex justify-between items-start gap-2">
                  <span className="font-display font-bold text-sm leading-snug text-white block">
                    {item.name || 'Unnamed Quote'}
                  </span>
                  <span className="font-mono text-[10px] font-bold shrink-0 text-[#A5ACAF] bg-[#001224] px-2 py-0.5 rounded border border-[#0A3663]">
                    {item.quoteNumber || 'No Ref'}
                  </span>
                </div>

                {/* Customer */}
                <div className="text-xs text-[#A5ACAF] font-medium truncate mt-1">
                  Customer: <span className="text-slate-200 font-semibold">{item.clientName || 'Not specified'}</span>
                </div>

                {/* Pricing and Date */}
                <div className="mt-2.5 pt-2.5 border-t border-[#0A3663] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Est:</span>
                    <span className="font-mono text-sm font-extrabold text-[#69BE28]">
                      {formatCurrency(totalSum)}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A5ACAF] font-medium flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#A5ACAF]" />
                    {item.date}
                  </span>
                </div>

                {/* Direct Action Buttons on Every Card */}
                <div className="mt-3.5 pt-2.5 border-t border-[#0A3663] flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onLoadEstimate(item.id, false)}
                      className="px-3 py-1.5 bg-[#69BE28] hover:bg-[#5aa721] text-[#002244] font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                      title="Open this quote in the estimator to edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Open &amp; Edit</span>
                    </button>

                    <button
                      onClick={() => onLoadEstimate(item.id, true)}
                      className="px-2.5 py-1.5 bg-[#002244] hover:bg-[#0A2C52] text-white border border-[#A5ACAF]/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="Open directly in Print & Export preview mode"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#69BE28]" />
                      <span>Print</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateEstimate(item.id)}
                      className="p-1.5 hover:bg-[#001224] text-[#A5ACAF] hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Duplicate as new quote copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteEstimate(item.id)}
                      className="p-1.5 hover:bg-red-950/60 text-[#A5ACAF] hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete estimate permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#0A2C52] bg-[#001224] flex flex-col gap-2">
        <button
          onClick={onCreateNew}
          className="w-full bg-[#69BE28] hover:bg-[#5aa721] text-[#002244] rounded-xl py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-[#69BE28]/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Quote</span>
        </button>
      </div>
    </div>
  );
}
