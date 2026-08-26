import React, { useState, useEffect } from 'react';
import { Save, Plus, X, Tag, User, Hash } from 'lucide-react';
import { Estimate } from '../types';

interface SaveEstimateModalProps {
  estimate: Estimate;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: (details: { name: string; clientName: string; quoteNumber: string; saveAsNew: boolean }) => void;
}

export default function SaveEstimateModal({
  estimate,
  isOpen,
  onClose,
  onConfirmSave,
}: SaveEstimateModalProps) {
  const [name, setName] = useState(estimate.name || '');
  const [clientName, setClientName] = useState(estimate.clientName || '');
  const [quoteNumber, setQuoteNumber] = useState(estimate.quoteNumber || '');

  useEffect(() => {
    if (isOpen) {
      setName(estimate.name || '');
      setClientName(estimate.clientName || '');
      setQuoteNumber(estimate.quoteNumber || '');
    }
  }, [isOpen, estimate]);

  if (!isOpen) return null;

  const handleSaveExisting = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSave({
      name: name.trim() || 'Custom Parts Quote',
      clientName: clientName.trim(),
      quoteNumber: quoteNumber.trim(),
      saveAsNew: false,
    });
  };

  const handleSaveAsNew = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSave({
      name: name.trim() || 'Custom Parts Quote (New)',
      clientName: clientName.trim(),
      quoteNumber: quoteNumber.trim() ? `${quoteNumber.trim()}-NEW` : '',
      saveAsNew: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00162B]/80 backdrop-blur-xs animate-fade-in no-print">
      <div 
        className="bg-[#001E3D] border-2 border-[#69BE28] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-white animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#002244] px-6 py-4 border-b border-[#0A3663] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#69BE28]/15 rounded-lg text-[#69BE28] border border-[#69BE28]/30">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Save &amp; Name Estimate
              </h3>
              <p className="text-xs text-[#A5ACAF]">
                Provide a name to easily find this quote later
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A5ACAF] hover:text-white hover:bg-[#00162B] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Inputs */}
        <form onSubmit={handleSaveExisting} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A5ACAF] mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#69BE28]" />
              Quote / Project Name <span className="text-[#69BE28]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Commercial 6-Inch Box Gutters & Downspouts"
              className="w-full px-3.5 py-2.5 bg-[#001224] border border-[#0A3663] focus:border-[#69BE28] focus:ring-1 focus:ring-[#69BE28] rounded-lg text-sm text-white font-medium placeholder:text-slate-500 outline-hidden transition-all"
              autoFocus
            />
            <p className="text-[11px] text-[#A5ACAF] mt-1">
              This name will appear in your quote archive and print documents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A5ACAF] mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#A5ACAF]" />
                Customer Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Roofing"
                className="w-full px-3.5 py-2 bg-[#001224] border border-[#0A3663] focus:border-[#69BE28] focus:ring-1 focus:ring-[#69BE28] rounded-lg text-sm text-white font-medium placeholder:text-slate-500 outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A5ACAF] mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#A5ACAF]" />
                Quote Number
              </label>
              <input
                type="text"
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                placeholder="e.g. QT-2026-088"
                className="w-full px-3.5 py-2 bg-[#001224] border border-[#0A3663] focus:border-[#69BE28] focus:ring-1 focus:ring-[#69BE28] rounded-lg text-sm text-white font-mono placeholder:text-slate-500 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-[#0A3663] flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              className="flex-1 bg-[#69BE28] hover:bg-[#5aa721] text-[#002244] font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#69BE28]/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Update Quote</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAsNew}
              className="bg-[#002244] hover:bg-[#0A2C52] text-white border border-[#A5ACAF]/40 font-semibold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Creates a brand new separate quote copy"
            >
              <Plus className="w-3.5 h-3.5 text-[#69BE28]" />
              <span>Save as New Copy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
