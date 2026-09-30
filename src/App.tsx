import { useState, useEffect } from 'react';
import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Estimate, PartItem, EstimateTotals, GutterShellItem } from './types';
import { calculateEstimateTotals } from './utils/calculations';
import { APP_VERSION, BUILD_TIMESTAMP } from './version';
import { saveEstimateToCloud, deleteEstimateFromCloud, subscribeToEstimates } from './firebase';
import Header from './components/Header';
import RatesConfig from './components/RatesConfig';
import PartsTable from './components/PartsTable';
import GutterShellTable from './components/GutterShellTable';
import EstimatesList from './components/EstimatesList';
import PrintDocument from './components/PrintDocument';
import SaveEstimateModal from './components/SaveEstimateModal';

// ----------------------------------------------------
// DEFAULT BLANK ESTIMATE CREATOR
// ----------------------------------------------------
function createNewBlankEstimate(): Estimate {
  const dateStr = new Date().toISOString().split('T')[0];
  return {
    id: `estimate-${Date.now()}`,
    name: 'New Custom Parts Quote',
    clientName: '',
    quoteNumber: '',
    date: dateStr,
    hourlyRate: 100,
    overheadPercent: 34,
    profitPercent: 10,
    parts: [
      {
        id: `part-${Date.now()}`,
        name: '',
        uom: 'EA',
        hours: 0,
        sheets: 0,
        pricePerSheet: 0,
        quantity: 1,
      }
    ],
    shells: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function App() {
  // ----------------------------------------------------
  // STATES
  // ----------------------------------------------------
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [currentEstimate, setCurrentEstimate] = useState<Estimate>(createNewBlankEstimate);
  const [activePartId, setActivePartId] = useState<string | null>(null);
  const [activeShellId, setActiveShellId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shell' | 'parts'>('shell');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(true);

  // ----------------------------------------------------
  // PERSISTENCE ENGINE (FIRESTORE CLOUD + LOCAL CACHE)
  // ----------------------------------------------------
  useEffect(() => {
    // 1. Initial immediate local cache load (filtering out any old seed samples)
    const stored = localStorage.getItem('custom_parts_estimates');
    if (stored) {
      try {
        const parsed = (JSON.parse(stored) as Estimate[]).filter(
          (e) => e.id !== 'seed-estimate-id-1' && e.name !== 'Custom Base Plate & Bracket Assembly'
        );
        if (parsed.length > 0) {
          setEstimates(parsed);
          const sorted = [...parsed].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setCurrentEstimate(sorted[0]);
        }
      } catch (err) {
        console.error('Error reading saved estimates from local cache:', err);
      }
    }

    // 2. Real-time Cloud Firestore subscription
    const unsubscribe = subscribeToEstimates(
      (cloudEstimates) => {
        setIsCloudConnected(true);
        // Filter out any legacy seed estimates
        const cleaned = cloudEstimates.filter(
          (e) => e.id !== 'seed-estimate-id-1' && e.name !== 'Custom Base Plate & Bracket Assembly'
        );

        setEstimates(cleaned);
        localStorage.setItem('custom_parts_estimates', JSON.stringify(cleaned));

        if (cleaned.length > 0) {
          setCurrentEstimate((current) => {
            const foundInCloud = cleaned.find((e) => e.id === current.id);
            if (foundInCloud && !hasUnsavedChanges) {
              return foundInCloud;
            }
            if (!foundInCloud && current.id.startsWith('estimate-')) {
              // If user is currently editing a new unsaved quote, keep it
              return current;
            }
            return cleaned[0];
          });
        }
      },
      (err) => {
        console.warn('Firestore offline/fallback mode active:', err);
        setIsCloudConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Track unsaved changes relative to stored version
  useEffect(() => {
    const savedVer = estimates.find((e) => e.id === currentEstimate.id);
    if (!savedVer) {
      // If it's a blank fresh quote, only flag dirty if fields are filled
      const isFilled = currentEstimate.clientName || currentEstimate.quoteNumber || currentEstimate.parts.some(p => p.name || p.hours > 0 || p.pricePerSheet > 0);
      setHasUnsavedChanges(Boolean(isFilled));
      return;
    }
    const isDifferent = JSON.stringify(savedVer) !== JSON.stringify(currentEstimate);
    setHasUnsavedChanges(isDifferent);
  }, [currentEstimate, estimates]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ----------------------------------------------------
  // METRICS COMPUTATIONS
  // ----------------------------------------------------
  const totals: EstimateTotals = calculateEstimateTotals(currentEstimate.parts, {
    hourlyRate: currentEstimate.hourlyRate,
    overheadPercent: currentEstimate.overheadPercent,
    profitPercent: currentEstimate.profitPercent,
  });

  // ----------------------------------------------------
  // WORKSPACE ACTION HANDLERS
  // ----------------------------------------------------
  const handleUpdateMeta = (key: keyof Estimate, value: any) => {
    setCurrentEstimate((prev) => ({
      ...prev,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateRates = (
    key: 'hourlyRate' | 'overheadPercent' | 'profitPercent',
    value: number
  ) => {
    setCurrentEstimate((prev) => ({
      ...prev,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdatePart = <K extends keyof PartItem>(partId: string, key: K, value: PartItem[K]) => {
    setCurrentEstimate((prev) => {
      const updatedParts = prev.parts.map((part) => {
        if (part.id === partId) {
          return {
            ...part,
            [key]: value,
          };
        }
        return part;
      });

      return {
        ...prev,
        parts: updatedParts,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleAddPart = () => {
    setCurrentEstimate((prev) => {
      const newPart: PartItem = {
        id: `part-${Date.now()}`,
        name: '',
        uom: 'EA',
        hours: 0,
        sheets: 0,
        pricePerSheet: 0,
        quantity: 1,
      };

      const newParts = [...prev.parts, newPart];
      setActivePartId(newPart.id);

      return {
        ...prev,
        parts: newParts,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleDeletePart = (id: string) => {
    setCurrentEstimate((prev) => {
      const filtered = prev.parts.filter((p) => p.id !== id);
      if (activePartId === id) {
        setActivePartId(filtered.length > 0 ? filtered[0].id : null);
      }
      return {
        ...prev,
        parts: filtered,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleDuplicatePart = (id: string) => {
    setCurrentEstimate((prev) => {
      const index = prev.parts.findIndex((p) => p.id === id);
      if (index === -1) return prev;

      const source = prev.parts[index];
      const clone: PartItem = {
        ...source,
        id: `part-clone-${Date.now()}`,
        name: source.name ? `${source.name} (Copy)` : '',
      };

      const newParts = [...prev.parts];
      newParts.splice(index + 1, 0, clone);
      setActivePartId(clone.id);

      return {
        ...prev,
        parts: newParts,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleMovePart = (index: number, direction: 'up' | 'down') => {
    setCurrentEstimate((prev) => {
      const newParts = [...prev.parts];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newParts.length) return prev;

      const temp = newParts[index];
      newParts[index] = newParts[targetIndex];
      newParts[targetIndex] = temp;

      return {
        ...prev,
        parts: newParts,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleUpdateShell = (shellId: string, key: keyof GutterShellItem, value: any) => {
    setCurrentEstimate((prev) => {
      const updatedShells = (prev.shells || []).map((shell) => {
        if (shell.id === shellId) {
          return {
            ...shell,
            [key]: value,
          };
        }
        return shell;
      });
      return {
        ...prev,
        shells: updatedShells,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleAddShell = () => {
    setCurrentEstimate((prev) => {
      const newShell: GutterShellItem = {
        id: `shell-${Date.now()}`,
        manufacturer: '',
        color: '',
        gauge: '',
        pricePerSheet: 0,
        costPerLF: 0,
        orderLF: 0,
        slitCharge: 0,
        freight: 0,
        customerLF: 0,
        isCustomerCoil: false,
      };
      const newShells = [...(prev.shells || []), newShell];
      setActiveShellId(newShell.id);
      return {
        ...prev,
        shells: newShells,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleDeleteShell = (id: string) => {
    setCurrentEstimate((prev) => {
      const filtered = (prev.shells || []).filter((s) => s.id !== id);
      if (activeShellId === id) {
        setActiveShellId(filtered.length > 0 ? filtered[0].id : null);
      }
      return {
        ...prev,
        shells: filtered,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleDuplicateShell = (id: string) => {
    setCurrentEstimate((prev) => {
      const shells = prev.shells || [];
      const index = shells.findIndex((s) => s.id === id);
      if (index === -1) return prev;

      const source = shells[index];
      const clone: GutterShellItem = {
        ...source,
        id: `shell-clone-${Date.now()}`,
      };

      const newShells = [...shells];
      newShells.splice(index + 1, 0, clone);
      setActiveShellId(clone.id);

      return {
        ...prev,
        shells: newShells,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleMoveShell = (index: number, direction: 'up' | 'down') => {
    setCurrentEstimate((prev) => {
      const newShells = [...(prev.shells || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newShells.length) return prev;

      const temp = newShells[index];
      newShells[index] = newShells[targetIndex];
      newShells[targetIndex] = temp;

      return {
        ...prev,
        shells: newShells,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // ----------------------------------------------------
  // ESTIMATE COLLECTION & SAVING HANDLERS
  // ----------------------------------------------------
  const handleConfirmSaveFromModal = async (details: {
    name: string;
    clientName: string;
    quoteNumber: string;
    saveAsNew: boolean;
  }) => {
    setIsSaveModalOpen(false);

    let saveItem: Estimate;
    if (details.saveAsNew) {
      saveItem = {
        ...currentEstimate,
        id: `estimate-${Date.now()}`,
        name: details.name,
        clientName: details.clientName,
        quoteNumber: details.quoteNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      saveItem = {
        ...currentEstimate,
        name: details.name,
        clientName: details.clientName,
        quoteNumber: details.quoteNumber,
        updatedAt: new Date().toISOString(),
      };
    }

    // 1. Optimistic local state + localStorage update
    setEstimates((prev) => {
      const idx = prev.findIndex((e) => e.id === saveItem.id);
      let updatedList = [...prev];
      if (idx !== -1) {
        updatedList[idx] = saveItem;
      } else {
        updatedList.unshift(saveItem);
      }
      localStorage.setItem('custom_parts_estimates', JSON.stringify(updatedList));
      return updatedList;
    });

    setCurrentEstimate(saveItem);

    // 2. Cloud Firestore persistence
    try {
      await saveEstimateToCloud(saveItem);
      setIsCloudConnected(true);
    } catch (err) {
      console.warn('Cloud sync offline; stored in local cache:', err);
    }

    showToast(`Saved quote: "${saveItem.name}" to Cloud Firestore!`);
  };

  const handleCreateNewEstimate = () => {
    const newEst = createNewBlankEstimate();
    setCurrentEstimate(newEst);
    setActivePartId(newEst.parts[0].id);
    setIsPreviewMode(false);
    setIsSidebarOpen(false);
    showToast('Created fresh quote template!');
  };

  const handleLoadEstimate = (id: string, openPrintPreview = false) => {
    const target = estimates.find((e) => e.id === id);
    if (target) {
      setCurrentEstimate(target);
      setActivePartId(target.parts.length > 0 ? target.parts[0].id : null);
      setIsPreviewMode(openPrintPreview);
      setIsSidebarOpen(false);
      showToast(openPrintPreview ? `Opening print preview for "${target.name}"` : `Loaded "${target.name}" into workspace`);
    }
  };

  const handleDeleteEstimate = async (id: string) => {
    const target = estimates.find((e) => e.id === id);
    const targetName = target?.name || 'Quote';

    // 1. Local update
    setEstimates((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      localStorage.setItem('custom_parts_estimates', JSON.stringify(filtered));

      if (currentEstimate.id === id) {
        if (filtered.length > 0) {
          setCurrentEstimate(filtered[0]);
          setActivePartId(filtered[0].parts.length > 0 ? filtered[0].parts[0].id : null);
        } else {
          const fresh = createNewBlankEstimate();
          setCurrentEstimate(fresh);
          setActivePartId(fresh.parts[0]?.id || null);
        }
      }
      return filtered;
    });

    // 2. Cloud Firestore deletion
    try {
      await deleteEstimateFromCloud(id);
    } catch (err) {
      console.warn('Error removing from cloud database:', err);
    }

    showToast(`Deleted quote: "${targetName}"`);
  };

  const handleDuplicateEstimate = async (id: string) => {
    const target = estimates.find((e) => e.id === id);
    if (!target) return;

    const duplicated: Estimate = {
      ...target,
      id: `estimate-${Date.now()}`,
      quoteNumber: target.quoteNumber ? `${target.quoteNumber}-DUP` : '',
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEstimates((prev) => {
      const updatedList = [duplicated, ...prev];
      localStorage.setItem('custom_parts_estimates', JSON.stringify(updatedList));
      return updatedList;
    });

    setCurrentEstimate(duplicated);
    setActivePartId(duplicated.parts.length > 0 ? duplicated.parts[0].id : null);
    setIsSidebarOpen(false);

    try {
      await saveEstimateToCloud(duplicated);
    } catch (err) {
      console.warn('Saved clone locally, cloud sync pending:', err);
    }

    showToast(`Cloned quote: "${duplicated.name}"`);
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  const formattedBuildDate = (() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(BUILD_TIMESTAMP));
    } catch {
      return BUILD_TIMESTAMP;
    }
  })();

  return (
    <div className="min-h-screen flex bg-slate-50 relative font-sans text-[#002244] selection:bg-[#69BE28]/30 antialiased">
      {/* Toast Notification Banner (Seahawks Theme) */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#002244] text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-[#69BE28] flex items-center gap-2.5 animate-bounce font-medium text-sm no-print">
          <CheckCircle2 className="w-5 h-5 text-[#69BE28] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Save / Rename Quote Modal */}
      <SaveEstimateModal
        estimate={currentEstimate}
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirmSave={handleConfirmSaveFromModal}
      />

      {/* ----------------------------------------------------
          ARCHIVE DRAWER / SIDEBAR (FIRESTORE & LOCAL)
         ---------------------------------------------------- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex no-print">
          <div 
            className="fixed inset-0 bg-[#00162B]/75 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsSidebarOpen(false)} 
          />
          <div className="relative flex-1 flex flex-col max-w-sm w-full bg-[#00162B] animate-slide-in shadow-2xl">
            <EstimatesList
              estimates={estimates}
              currentEstimateId={currentEstimate.id}
              onLoadEstimate={handleLoadEstimate}
              onDeleteEstimate={handleDeleteEstimate}
              onDuplicateEstimate={handleDuplicateEstimate}
              onCreateNew={handleCreateNewEstimate}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          PRINT PREVIEW VIEW
         ---------------------------------------------------- */}
      {isPreviewMode ? (
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Preview banner floating */}
          <div className="bg-[#002244] text-white py-3.5 px-6 sticky top-0 z-30 flex items-center justify-between shadow-md no-print border-b border-[#A5ACAF]/30">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#69BE28] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#69BE28]"></span>
              </span>
              <div>
                <p className="text-sm font-bold tracking-wide">
                  Print Preview: <span className="text-[#69BE28]">{currentEstimate.name || 'Untitled Quote'}</span>
                </p>
                <p className="text-[11px] font-mono text-[#A5ACAF]">
                  Ref: {currentEstimate.quoteNumber || 'No Ref'} &bull; Client: {currentEstimate.clientName || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsPreviewMode(false)}
                className="px-4 py-2 bg-[#00162B] hover:bg-[#0A2C52] text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-[#A5ACAF]/40 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#69BE28]" />
                <span>Return to Editor</span>
              </button>
              <button
                onClick={handlePrintTrigger}
                className="px-5 py-2 bg-[#69BE28] hover:bg-[#5aa721] text-[#002244] rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#69BE28]/25 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>

          {/* Centered Document Sheet */}
          <div className="flex-1 bg-slate-100 py-10 px-4 sm:px-6 overflow-y-auto print:bg-white print:p-0 print:m-0 print:overflow-visible print:block">
            <PrintDocument estimate={currentEstimate} totals={totals} />
          </div>
        </div>
      ) : (
        /* ----------------------------------------------------
            STANDARD EDITING WORKSPACE
           ---------------------------------------------------- */
        <div className="flex-1 flex flex-col min-h-screen">
          <Header
            estimate={currentEstimate}
            totals={totals}
            onUpdateMeta={handleUpdateMeta}
            onNew={handleCreateNewEstimate}
            onSave={() => setIsSaveModalOpen(true)}
            onPrint={() => setIsPreviewMode(true)}
            hasUnsavedChanges={hasUnsavedChanges}
            onToggleSidebar={() => setIsSidebarOpen(true)}
            savedCount={estimates.length}
            appVersion={APP_VERSION}
            buildTimestamp={BUILD_TIMESTAMP}
            isCloudConnected={isCloudConnected}
          />

          {/* Main workspace scrollable area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Tabs (Seahawks Palette) */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('shell')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'shell' 
                    ? 'bg-[#002244] text-white shadow-md ring-1 ring-[#69BE28]' 
                    : 'bg-white text-[#002244] hover:bg-slate-100 border border-[#A5ACAF]/40'
                }`}
              >
                Gutter Shell Estimator
              </button>
              <button
                onClick={() => setActiveTab('parts')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'parts' 
                    ? 'bg-[#002244] text-white shadow-md ring-1 ring-[#69BE28]' 
                    : 'bg-white text-[#002244] hover:bg-slate-100 border border-[#A5ACAF]/40'
                }`}
              >
                Gutter Parts Estimator
              </button>
            </div>

            {/* Estimating Table */}
            <div className="space-y-6">
              {activeTab === 'parts' ? (
                <>
                  <RatesConfig
                    hourlyRate={currentEstimate.hourlyRate}
                    overheadPercent={currentEstimate.overheadPercent}
                    profitPercent={currentEstimate.profitPercent}
                    onUpdateRates={handleUpdateRates}
                  />
                  <PartsTable
                    parts={currentEstimate.parts}
                    hourlyRate={currentEstimate.hourlyRate}
                    overheadPercent={currentEstimate.overheadPercent}
                    profitPercent={currentEstimate.profitPercent}
                    activePartId={activePartId}
                    onSelectPart={setActivePartId}
                    onUpdatePart={handleUpdatePart}
                    onAddPart={handleAddPart}
                    onDeletePart={handleDeletePart}
                    onDuplicatePart={handleDuplicatePart}
                    onMovePart={handleMovePart}
                  />
                </>
              ) : (
                <GutterShellTable
                  shells={currentEstimate.shells || []}
                  activeShellId={activeShellId}
                  onSelectShell={setActiveShellId}
                  onUpdateShell={handleUpdateShell}
                  onAddShell={handleAddShell}
                  onDeleteShell={handleDeleteShell}
                  onDuplicateShell={handleDuplicateShell}
                  onMoveShell={handleMoveShell}
                />
              )}
            </div>
          </main>

          {/* Footer with App Version & Fixed Build Timestamp */}
          <footer className="no-print border-t border-slate-200 mt-auto bg-white py-4 text-center text-[11px] text-slate-500 font-sans tracking-wide">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#002244]">Gutter Estimator &copy; 2026.</span>
                <span className="font-mono text-[10px] bg-[#002244] text-white px-2 py-0.5 rounded border border-[#A5ACAF]/40">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="font-mono text-[10px] text-slate-500">
                Cloud Sync: <span className="font-semibold text-[#69BE28]">{isCloudConnected ? 'Connected (Firestore)' : 'Offline Cache'}</span> &bull; Last Deployed: {formattedBuildDate}
              </p>
            </div>
          </footer>
          {/* Embedded print sheet for printing directly from editor */}
          <div className="hidden print:block">
            <PrintDocument estimate={currentEstimate} totals={totals} />
          </div>
        </div>
      )}
    </div>
  );
}
