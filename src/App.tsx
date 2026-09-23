import { Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { APP_VERSION } from './version';
import { useAppLogic } from "./hooks/useAppLogic";
import Header from './components/Header';
import RatesConfig from './components/RatesConfig';
import PartsTable from './components/PartsTable';
import GutterShellTable from './components/GutterShellTable';
import EstimatesList from './components/EstimatesList';
import PrintDocument from './components/PrintDocument';
import SaveEstimateModal from './components/SaveEstimateModal';

export default function App() {
  const {
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
  } = useAppLogic();

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
            buildTimestamp={formattedBuildDate}
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
                    onSelectPart={(id) => setActivePartId(id)}
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
                  onSelectShell={(id) => setActiveShellId(id)}
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
