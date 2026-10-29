## 2025-02-27 - [Monolithic Hook Re-render Trigger]
**Learning:** The application uses a single monolithic hook (`useAppLogic`) to manage all application state AND UI state (like `activeTab`, `isSidebarOpen`, `isSaveModalOpen`). This means any UI state change triggers a full hook execution. Unmemoized derived state calculations (like `calculateEstimateTotals` which iterates over all parts) run unnecessarily on every tab switch or modal open.
**Action:** Always memoize derived state calculations within `useAppLogic` using `useMemo` since the hook evaluates frequently for unrelated UI updates.
