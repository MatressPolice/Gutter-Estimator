import { Save, Plus, Printer, Database } from 'lucide-react';
import { Estimate, EstimateTotals } from '../types';
import GutterLogo from './GutterLogo';

interface HeaderProps {
  estimate: Estimate;
  totals: EstimateTotals;
  onUpdateMeta: <K extends keyof Estimate>(key: K, value: Estimate[K]) => void;
  onNew: () => void;
  onSave: () => void;
  onPrint: () => void;
  hasUnsavedChanges: boolean;
  onToggleSidebar: () => void;
  savedCount: number;
  appVersion: string;
  buildTimestamp: string;
  isCloudConnected?: boolean;
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
  appVersion,
  buildTimestamp,
  isCloudConnected = true,
}: HeaderProps) {
  const formattedBuildDate = (() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(buildTimestamp));
    } catch {
      return buildTimestamp;
    }
  })();

  return (
    <header className="bg-white border-b border-[#A5ACAF]/40 no-print sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-3.5 mb-3.5">
          <div className="flex items-center gap-3">
            <GutterLogo variant="seahawks" size={46} />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display font-extrabold text-2xl text-[#002244] tracking-tight">
                  Gutter Estimator
                </h1>
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#002244] border border-[#A5ACAF]/40 rounded-full text-xs font-mono font-semibold text-white shadow-2xs"
                  title={`Version ${appVersion} • Deployed on ${formattedBuildDate}`}
                >
                  <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-[#69BE28] animate-pulse' : 'bg-[#A5ACAF]'}`} />
                  <span>v{appVersion}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Updated: {formattedBuildDate}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onToggleSidebar}
              className="px-3 py-2 bg-slate-50 hover:bg-[#002244]/5 border border-[#A5ACAF]/60 text-[#002244] rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Cloud & Local Saved Estimates"
            >
              <Database className="w-4 h-4 text-[#002244]" />
              <span>Quotes</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#69BE28] text-white text-[11px] font-mono font-bold rounded-md">
                {savedCount}
              </span>
            </button>

            <button
              onClick={onNew}
              className="px-3 py-2 bg-slate-50 hover:bg-[#002244]/5 border border-[#A5ACAF]/60 text-[#002244] rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#002244]" />
              <span>New</span>
            </button>

            <button
              onClick={onSave}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-[#69BE28] hover:bg-[#5aa721] text-white shadow-md shadow-[#69BE28]/25 ring-1 ring-[#69BE28]'
                  : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              disabled={!hasUnsavedChanges}
            >
              <Save className="w-4 h-4" />
              <span>Save Estimate</span>
              {hasUnsavedChanges && (
                <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" title="Unsaved changes" />
              )}
            </button>

            <button
              onClick={onPrint}
              className="px-4 py-2 bg-[#002244] hover:bg-[#00162B] text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer border border-[#002244]"
            >
              <Printer className="w-4 h-4 text-[#69BE28]" />
              <span>Print & Preview</span>
            </button>
          </div>
        </div>

        {/* Quote Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#002244] uppercase tracking-wider mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={estimate.name}
              onChange={(e) => onUpdateMeta('name', e.target.value)}
              placeholder="e.g. Brackets & Custom Fittings"
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#002244] focus:ring-1 focus:ring-[#002244] rounded-lg text-sm font-medium text-slate-900 transition-all outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#002244] uppercase tracking-wider mb-1">
              Customer Name
            </label>
            <input
              type="text"
              value={estimate.clientName}
              onChange={(e) => onUpdateMeta('clientName', e.target.value)}
              placeholder="e.g. Acme Manufacturing"
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#002244] focus:ring-1 focus:ring-[#002244] rounded-lg text-sm font-medium text-slate-900 transition-all outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#002244] uppercase tracking-wider mb-1">
              Quote Number
            </label>
            <input
              type="text"
              value={estimate.quoteNumber}
              onChange={(e) => onUpdateMeta('quoteNumber', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#002244] focus:ring-1 focus:ring-[#002244] rounded-lg text-sm font-mono font-semibold text-[#002244] transition-all outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#002244] uppercase tracking-wider mb-1">
              Estimate Date
            </label>
            <input
              type="date"
              value={estimate.date}
              onChange={(e) => onUpdateMeta('date', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#002244] focus:ring-1 focus:ring-[#002244] rounded-lg text-sm font-medium text-slate-900 transition-all outline-hidden"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
