import { useState, useEffect } from 'react';
import { Printer, ArrowLeft, BookmarkCheck, CloudCheck, Cloud } from 'lucide-react';
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

// ----------------------------------------------------
// DEFAULT SEED ESTIMATE
// ----------------------------------------------------
const SEED_ESTIMATE: Estimate = {
  id: 'seed-estimate-id-1',
  name: 'Custom Base Plate & Bracket Assembly',
  clientName: 'Acme Steel Fabrication',
  quoteNumber: 'QT-2026-001',
  date: '2026-07-10',
  notes: 'Production run for custom structural mounting components.',
  hourlyRate: 100,
  overheadPercent: 34,
  profitPercent: 10,
  parts: [
    {
      id: 'part-1',
      name: 'Custom Flashing Bracket',
      uom: 'EA',
      hours: 2.50,
      sheets: 3,
      pricePerSheet: 45.00,
      quantity: 20,
    },
    {
      id: 'part-2',
      name: 'Corner Joiner 24G',
      uom: 'EA',
      hours: 1.25,
      sheets: 1,
      pricePerSheet: 28.50,
      quantity: 15,
    },
    {
      id: 'part-3',
      name: 'Heavy Duty Support Strap',
      uom: 'EA',
      hours: 4.00,
      sheets: 6,
      pricePerSheet: 32.00,
      quantity: 10,
    }
  ],
  shells: [],
  createdAt: '2026-07-10T15:15:00.000Z',
  updatedAt: '2026-07-10T15:15:00.000Z',
};

export default function App() {
  // ----------------------------------------------------
  // STATES
  // ----------------------------------------------------
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [currentEstimate, setCurrentEstimate] = useState<Estimate>(SEED_ESTIMATE);
  const [activePartId, setActivePartId] = useState<string | null>(null);
  const [activeShellId, setActiveShellId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shell' | 'parts'>('shell');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(true);

  // ----------------------------------------------------
  // PERSISTENCE ENGINE (FIRESTORE CLOUD + LOCAL CACHE)
  // ----------------------------------------------------
  useEffect(() => {
    // 1. Initial immediate local cache load for instant responsiveness
    const stored = localStorage.getItem('custom_parts_estimates');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Estimate[];
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
        if (cloudEstimates.length > 0) {
          setEstimates(cloudEstimates);
          localStorage.setItem('custom_parts_estimates', JSON.stringify(cloudEstimates));

          // If current estimate is loaded, sync matching cloud update if not dirty
          setCurrentEstimate((current) => {
            const foundInCloud = cloudEstimates.find((e) => e.id === current.id);
            if (foundInCloud && !hasUnsavedChanges) {
              return foundInCloud;
            }
            if (!foundInCloud && current.id === SEED_ESTIMATE.id) {
              return cloudEstimates[0];
            }
            return current;
          });
        } else {
          // Cloud empty: populate with seed
          saveEstimateToCloud(SEED_ESTIMATE).catch(() => {});
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
      setHasUnsavedChanges(true);
      return;
    }
    const isDifferent = JSON.stringify(savedVer) !== JSON.stringify(currentEstimate);
    setHasUnsavedChanges(isDifferent);
  }, [currentEstimate, estimates]);

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

  const handleUpdatePart = (partId: string, key: keyof PartItem, value: any) => {
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
  // ESTIMATE COLLECTION HANDLERS
  // ----------------------------------------------------
  const handleSaveEstimate = async () => {
    const saveItem: Estimate = {
      ...currentEstimate,
      updatedAt: new Date().toISOString(),
    };

    // 1. Optimistic local state + localStorage update
    setEstimates((prev) => {
      const idx = prev.findIndex((e) => e.id === saveItem.id);
      let updatedList = [...prev];
      if (idx !== -1) {
        updatedList[idx] = saveItem;
      } else {
        updatedList.push(saveItem);
      }
      localStorage.setItem('custom_parts_estimates', JSON.stringify(updatedList));
      return updatedList;
    });

    // 2. Cloud Firestore persistence
    try {
      await saveEstimateToCloud(saveItem);
      setIsCloudConnected(true);
    } catch (err) {
      console.warn('Cloud sync offline; stored in local cache:', err);
    }

    setSaveSuccessNotification(true);
    setTimeout(() => setSaveSuccessNotification(false), 3000);
  };

  const handleCreateNewEstimate = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const newEst: Estimate = {
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

    setCurrentEstimate(newEst);
    setActivePartId(newEst.parts[0].id);
    setIsPreviewMode(false);
  };

  const handleLoadEstimate = (id: string) => {
    const target = estimates.find((e) => e.id === id);
    if (target) {
      setCurrentEstimate(target);
      setActivePartId(target.parts.length > 0 ? target.parts[0].id : null);
      setIsPreviewMode(false);
    }
  };

  const handleDeleteEstimate = async (id: string) => {
    // 1. Local update
    setEstimates((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      localStorage.setItem('custom_parts_estimates', JSON.stringify(filtered));

      if (currentEstimate.id === id) {
        if (filtered.length > 0) {
          setCurrentEstimate(filtered[0]);
          setActivePartId(filtered[0].parts.length > 0 ? filtered[0].parts[0].id : null);
        } else {
          setCurrentEstimate(SEED_ESTIMATE);
          setActivePartId('part-1');
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
      const updatedList = [...prev, duplicated];
      localStorage.setItem('custom_parts_estimates', JSON.stringify(updatedList));
      return updatedList;
    });

    setCurrentEstimate(duplicated);
    setActivePartId(duplicated.parts.length > 0 ? duplicated.parts[0].id : null);

    try {
      await saveEstimateToCloud(duplicated);
    } catch (err) {
      console.warn('Saved clone locally, cloud sync pending:', err);
    }
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
    <div className="min-h-screen flex bg-slate-50 relative font-sans text-slate-900 selection:bg-blue-100 antialiased">
      {/* Save Success Banner */}
      {saveSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500/30 flex items-center gap-2.5 animate-bounce font-medium text-sm no-print">
          <BookmarkCheck className="w-5 h-5" />
          <span>Estimate saved successfully to Cloud Firestore!</span>
        </div>
      )}

      {/* ----------------------------------------------------
          ARCHIVE DRAWER / SIDEBAR (FIRESTORE & LOCAL)
         ---------------------------------------------------- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex no-print">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 animate-slide-in">
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
          <div className="bg-slate-900 text-white py-3.5 px-6 sticky top-0 z-30 flex items-center justify-between shadow-md no-print">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <p className="text-sm font-semibold tracking-wide">
                Print Preview Active: <span className="font-mono text-slate-350">{currentEstimate.quoteNumber}</span>
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsPreviewMode(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-755 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700/80 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Editor</span>
              </button>
              <button
                onClick={handlePrintTrigger}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer animate-pulse"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>

          {/* Centered Document Sheet */}
          <div className="flex-1 bg-slate-100 py-10 px-4 sm:px-6 overflow-y-auto">
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
            onSave={handleSaveEstimate}
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
            
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('shell')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'shell' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Gutter Shell Estimator
              </button>
              <button
                onClick={() => setActiveTab('parts')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'parts' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
          <footer className="no-print border-t border-slate-200 mt-auto bg-white py-4 text-center text-[11px] text-slate-400 font-sans tracking-wide">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span>Gutter Estimator &copy; 2026.</span>
                <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="font-mono text-[10px] text-slate-400">
                Cloud Sync: {isCloudConnected ? 'Connected (Firestore)' : 'Offline Cache'} &bull; Last Deployed: {formattedBuildDate}
              </p>
            </div>
          </footer>
        </div>
      )}

      {/* Embedded print sheet */}
      <div className="hidden print:block">
        <PrintDocument estimate={currentEstimate} totals={totals} />
      </div>
    </div>
  );
}
