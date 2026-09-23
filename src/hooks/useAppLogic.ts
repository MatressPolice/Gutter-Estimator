import { useState, useEffect } from 'react';
import { Estimate, PartItem, EstimateTotals, GutterShellItem } from '../types';
import { calculateEstimateTotals } from '../utils/calculations';
import { BUILD_TIMESTAMP } from '../version';
import { saveEstimateToCloud, deleteEstimateFromCloud, subscribeToEstimates } from '../firebase';

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

export function useAppLogic() {
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


  return {
    estimates,
    currentEstimate,
    activePartId,
    activeShellId,
    activeTab,
    isSidebarOpen,
    isPreviewMode,
    isSaveModalOpen,
    hasUnsavedChanges,
    toastMessage,
    isCloudConnected,
    totals,
    formattedBuildDate,
    setActiveTab,
    setActivePartId,
    setActiveShellId,

    setIsPreviewMode,
    setIsSidebarOpen,
    setIsSaveModalOpen,
    handleUpdateMeta,
    handleUpdateRates,
    handleUpdatePart,
    handleAddPart,
    handleDeletePart,
    handleDuplicatePart,
    handleMovePart,
    handleUpdateShell,
    handleAddShell,
    handleDeleteShell,
    handleDuplicateShell,
    handleMoveShell,
    handleConfirmSaveFromModal,
    handleCreateNewEstimate,
    handleLoadEstimate,
    handleDeleteEstimate,
    handleDuplicateEstimate,
    handlePrintTrigger
  };
}
