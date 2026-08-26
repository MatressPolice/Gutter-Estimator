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
    <div className="bg-white rounded-xl border border-[#A5ACAF]/40 p-5 shadow-xs no-print">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
        <Briefcase className="w-5 h-5 text-[#002244]" />
        <h2 className="font-display font-bold text-base text-[#002244]">
          Estimation Rates (Editable)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Hourly Rate */}
        <div className="bg-slate-50 p-4 rounded-lg border border-[#A5ACAF]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#002244] uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#002244]" />
                Hourly Labor Rate
              </span>
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 bg-[#00162B] text-white text-xs p-2.5 rounded-lg shadow-lg z-10 font-sans font-normal leading-relaxed border border-[#A5ACAF]/30">
                  The standard billable rate per hour of shop work. Multiplied by `#OfHours` to find the labor cost.
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3">
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
              className="block w-full rounded-md border border-[#A5ACAF]/40 pl-9 pr-3 py-1.5 text-sm font-medium text-slate-900 focus:border-[#002244] focus:ring-1 focus:ring-[#002244] focus:outline-hidden"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 font-semibold">
              / Hr
            </span>
          </div>
        </div>

        {/* Overhead Rate */}
        <div className="bg-slate-50 p-4 rounded-lg border border-[#A5ACAF]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#002244] uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-slate-600" />
                Overhead Percentage
              </span>
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 bg-[#00162B] text-white text-xs p-2.5 rounded-lg shadow-lg z-10 font-sans font-normal leading-relaxed border border-[#A5ACAF]/30">
                  Additional percentage added to the subtotal (labor + materials) to cover business operations, rent, wear-and-tear, utilities, and consumables.
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-3">
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
              className="block w-full rounded-md border border-[#A5ACAF]/40 pl-3 pr-8 py-1.5 text-sm font-medium text-slate-900 focus:border-[#002244] focus:ring-1 focus:ring-[#002244] focus:outline-hidden"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-sm font-medium text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* Profit Margin (Action Green) */}
        <div className="bg-[#f0fdf4] p-4 rounded-lg border border-[#69BE28]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#002244] uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-[#69BE28]" />
                Target Profit Margin
              </span>
              <div className="group relative">
                <HelpCircle className="w-4 h-4 text-[#69BE28] hover:text-[#5aa721] cursor-pointer" />
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 bg-[#00162B] text-white text-xs p-2.5 rounded-lg shadow-lg z-10 font-sans font-normal leading-relaxed border border-[#69BE28]/50">
                  Target net profit percentage added to the subtotal. Defaults to 10%.
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-3">
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
              className="block w-full rounded-md border border-[#69BE28]/50 pl-3 pr-8 py-1.5 text-sm font-bold text-[#002244] focus:border-[#69BE28] focus:ring-1 focus:ring-[#69BE28] focus:outline-hidden bg-white"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-sm font-bold text-[#69BE28]">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
