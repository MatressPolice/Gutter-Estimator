import { useState } from 'react';
import { Database, Search, Calendar, Trash2, ExternalLink, X, PlusCircle, Copy } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-slate-900 text-white w-80 max-w-full shadow-2xl relative border-l border-slate-850 z-50">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          <h2 className="font-display font-semibold text-base text-slate-100">
            Estimate Archive
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search saved quotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-850 border border-slate-800 text-sm pl-9 pr-3 py-1.5 rounded-lg focus:outline-hidden focus:border-blue-500 text-slate-200 transition-colors"
          />
        </div>
      </div>

      {/* Quote List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <p className="font-medium mb-1">No estimates found</p>
            {searchQuery ? 'Try a different search term' : 'Click "Save Estimate" to add one!'}
          </div>
        ) : (
          filtered.map((item) => {
            const isCurrent = item.id === currentEstimateId;
            const totalSum = item.parts.reduce((sum, part) => {
              // Quick calc
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
                    ? 'bg-blue-600/15 border-blue-500/50 text-white shadow-inner'
                    : 'bg-slate-850 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="font-display font-semibold text-xs leading-tight text-white block truncate max-w-[160px]">
                    {item.name || 'Unnamed Quote'}
                  </span>
                  <span className="font-mono text-[10px] font-bold shrink-0 text-slate-400 bg-slate-950/30 px-1.5 py-0.5 rounded border border-slate-800">
                    {item.quoteNumber || 'No Ref'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-medium truncate mt-1">
                  {item.clientName || 'No Client Specified'}
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400">
                    {formatCurrency(totalSum)}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {item.date}
                  </span>
                </div>

                {/* Hover Actions */}
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-800/40 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateEstimate(item.id);
                    }}
                    className="px-2 py-1 hover:bg-slate-700/60 text-slate-400 hover:text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
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
                    className="px-2 py-1 hover:bg-red-900/40 text-slate-400 hover:text-red-400 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
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
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col gap-2">
        <button
          onClick={onCreateNew}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Quote</span>
        </button>
      </div>
    </div>
  );
}
