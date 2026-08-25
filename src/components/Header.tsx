import { FileText, Save, Plus, Printer, Trash2, Database, AlertCircle } from 'lucide-react';
import { Estimate, EstimateTotals } from '../types';
import { formatCurrency } from '../utils/calculations';

interface HeaderProps {
  estimate: Estimate;
  totals: EstimateTotals;
  onUpdateMeta: (key: keyof Estimate, value: any) => void;
  onNew: () => void;
  onSave: () => void;
  onPrint: () => void;
  hasUnsavedChanges: boolean;
  onToggleSidebar: () => void;
  savedCount: number;
}

export default function Header({
  estimate,
  totals,
  onUpdateMeta,
  onNew,
  onSave,
  onPrint,
  hasUnsavedChanges,
  onToggleSidebar,
  savedCount,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 no-print sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
                Gutter Estimator
              </h1>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onToggleSidebar}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Saved Estimates"
            >
              <Database className="w-4 h-4" />
              <span>Quotes ({savedCount})</span>
            </button>

            <button
              onClick={onNew}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </button>

            <button
              onClick={onSave}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              disabled={!hasUnsavedChanges}
            >
              <Save className="w-4 h-4" />
              <span>Save Estimate</span>
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse ml-0.5" title="Unsaved changes" />
              )}
            </button>

            <button
              onClick={onPrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print & Preview</span>
            </button>
          </div>
        </div>

        {/* Quote Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={estimate.name}
              onChange={(e) => onUpdateMeta('name', e.target.value)}
              placeholder="e.g. Brackets & Custom Fittings"
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm font-medium text-slate-850 transition-all outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={estimate.clientName}
              onChange={(e) => onUpdateMeta('clientName', e.target.value)}
              placeholder="e.g. Acme Manufacturing"
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm font-medium text-slate-850 transition-all outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Quote Number
            </label>
            <input
              type="text"
              value={estimate.quoteNumber}
              onChange={(e) => onUpdateMeta('quoteNumber', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm font-mono text-slate-850 transition-all outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Estimate Date
            </label>
            <input
              type="date"
              value={estimate.date}
              onChange={(e) => onUpdateMeta('date', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-sm font-medium text-slate-850 transition-all outline-hidden"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
