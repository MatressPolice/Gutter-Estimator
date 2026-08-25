import { DollarSign, Percent, Clock, Briefcase, HelpCircle } from 'lucide-react';

interface RatesConfigProps {
  hourlyRate: number;
  overheadPercent: number;
  profitPercent: number;
  onUpdateRates: (key: 'hourlyRate' | 'overheadPercent' | 'profitPercent', value: number) => void;
}

export default function RatesConfig({
  hourlyRate,
  overheadPercent,
  profitPercent,
  onUpdateRates,
}: RatesConfigProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs no-print">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
        <Briefcase className="w-5 h-5 text-blue-600" />
        <h2 className="font-display font-semibold text-base text-slate-900">
          Estimation Rates (Editable)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Hourly Rate */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Hourly Labor Rate
              </span>
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 bg-slate-800 text-white text-xs p-2.5 rounded-lg shadow-lg z-10 font-sans font-normal leading-relaxed">
                  The standard billable rate per hour of shop work. Multiplied by `#OfHours` to find the labor cost.
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Applies globally to all hours calculated.
            </p>
          </div>
          <div className="relative rounded-md shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <DollarSign className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="number"
              min="0"
              step="1"
              value={hourlyRate}
              onChange={(e) => onUpdateRates('hourlyRate', Math.max(0, Number(e.target.value)))}
              className="block w-full rounded-md border border-slate-200 pl-9 pr-3 py-1.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400">
              / Hr
            </span>
          </div>
        </div>

        {/* Overhead Rate */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-rose-500" />
                Overhead Percentage
              </span>
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 bg-slate-800 text-white text-xs p-2.5 rounded-lg shadow-lg z-10 font-sans font-normal leading-relaxed">
                  Additional percentage added to the subtotal (labor + materials) to cover business operations, rent, wear-and-tear, utilities, and consumables.
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Standard: 34% of Subtotal.
            </p>
          </div>
          <div className="relative rounded-md shadow-xs">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={overheadPercent}
              onChange={(e) => onUpdateRates('overheadPercent', Math.max(0, Math.min(100, Number(e.target.value))))}
              className="block w-full rounded-md border border-slate-200 pl-3 pr-8 py-1.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-sm font-medium text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-emerald-500" />
                Target Profit Margin
              </span>
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 bg-slate-800 text-white text-xs p-2.5 rounded-lg shadow-lg z-10 font-sans font-normal leading-relaxed">
                  Target net profit percentage added to the subtotal. Defaults to 10%.
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Standard: 10% of Subtotal.
            </p>
          </div>
          <div className="relative rounded-md shadow-xs">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={profitPercent}
              onChange={(e) => onUpdateRates('profitPercent', Math.max(0, Math.min(100, Number(e.target.value))))}
              className="block w-full rounded-md border border-slate-200 pl-3 pr-8 py-1.5 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-hidden"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-sm font-medium text-slate-400">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
