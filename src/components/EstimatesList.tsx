import { useState } from 'react';
import { Database, Search, Calendar, Trash2, X, PlusCircle, Copy } from 'lucide-react';
import { Estimate } from '../types';
import { formatCurrency } from '../utils/calculations';

interface EstimatesListProps {
  estimates: Estimate[];
  currentEstimateId: string;
  onLoadEstimate: (id: string) => void;
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

  const filtered = estimates.filter((e) => {
    const query = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(query) ||
      e.clientName.toLowerCase().includes(query) ||
      e.quoteNumber.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#00162B] text-white w-80 max-w-full shadow-2xl relative border-l border-[#A5ACAF]/20 z-50">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#0A2C52] flex items-center justify-between bg-[#002244]">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#69BE28]" />
          <h2 className="font-display font-bold text-base text-white">
            Estimate Archive
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#00162B] text-[#A5ACAF] hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-[#0A2C52] bg-[#001224]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A5ACAF] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search saved quotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#002244] border border-[#0A3663] text-sm pl-9 pr-3 py-1.5 rounded-lg focus:outline-hidden focus:border-[#69BE28] text-white transition-colors"
          />
        </div>
      </div>

      {/* Quote List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            <p className="font-medium mb-1">No estimates found</p>
            {searchQuery ? 'Try a different search term' : 'Click "Save Estimate" to add one!'}
          </div>
        ) : (
          filtered.map((item) => {
            const isCurrent = item.id === currentEstimateId;
            const totalSum = item.parts.reduce((sum, part) => {
              const sub = (part.hours * item.hourlyRate) + (part.sheets * part.pricePerSheet);
              const oh = sub * (item.overheadPercent / 100);
              const pr = sub * (item.profitPercent / 100);
              return sum + sub + oh + pr;
            }, 0);

            return (
              <div
                key={item.id}
                onClick={() => onLoadEstimate(item.id)}
                className={`group p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                  isCurrent
                    ? 'bg-[#002244] border-[#69BE28] text-white shadow-lg ring-1 ring-[#69BE28]/40'
                    : 'bg-[#001E3D] hover:bg-[#002852] border-[#0A3663] hover:border-[#A5ACAF]/40 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="font-display font-bold text-xs leading-tight text-white block truncate max-w-[160px]">
                    {item.name || 'Unnamed Quote'}
                  </span>
                  <span className="font-mono text-[10px] font-bold shrink-0 text-[#A5ACAF] bg-[#001224] px-1.5 py-0.5 rounded border border-[#0A3663]">
                    {item.quoteNumber || 'No Ref'}
                  </span>
                </div>

                <div className="text-[11px] text-[#A5ACAF] font-medium truncate mt-1">
                  {item.clientName || 'No Client Specified'}
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-[#0A3663] flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-[#69BE28]">
                    {formatCurrency(totalSum)}
                  </span>
                  <span className="text-[9px] text-[#A5ACAF] font-medium flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#A5ACAF]" />
                    {item.date}
                  </span>
                </div>

                {/* Hover Actions */}
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-[#0A3663] pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateEstimate(item.id);
                    }}
                    className="px-2 py-1 hover:bg-[#001224] text-[#A5ACAF] hover:text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    title="Duplicate estimate as new copy"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Clone</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEstimate(item.id);
                    }}
                    className="px-2 py-1 hover:bg-red-950/60 text-[#A5ACAF] hover:text-red-400 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    title="Delete estimate permanently"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
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
          className="w-full bg-[#69BE28] hover:bg-[#5aa721] text-white rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Quote</span>
        </button>
      </div>
    </div>
  );
}
