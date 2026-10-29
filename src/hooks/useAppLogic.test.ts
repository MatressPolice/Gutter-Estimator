import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppLogic } from './useAppLogic';
import * as firebase from '../firebase';

vi.mock('../firebase', () => ({
  saveEstimateToCloud: vi.fn(),
  deleteEstimateFromCloud: vi.fn(),
  subscribeToEstimates: vi.fn((onData, onError) => {
    return () => {}; // return unsubscribe function
  })
}));

describe('useAppLogic', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with a blank estimate and empty estimates list', () => {
    const { result } = renderHook(() => useAppLogic());

    expect(result.current.currentEstimate).toBeDefined();
    expect(result.current.currentEstimate.name).toBe('New Custom Parts Quote');
    expect(result.current.estimates).toEqual([]);
    expect(result.current.currentEstimate.parts).toHaveLength(1);
    expect(result.current.currentEstimate.shells).toHaveLength(0);
  });

  it('updates metadata using handleUpdateMeta', () => {
    const { result } = renderHook(() => useAppLogic());

    act(() => {
      result.current.handleUpdateMeta('clientName', 'Test Client');
    });

    expect(result.current.currentEstimate.clientName).toBe('Test Client');
  });

  it('updates rates using handleUpdateRates', () => {
    const { result } = renderHook(() => useAppLogic());

    act(() => {
      result.current.handleUpdateRates('hourlyRate', 150);
    });

    expect(result.current.currentEstimate.hourlyRate).toBe(150);
  });

  describe('part management', () => {
    it('adds a part using handleAddPart', () => {
      const { result } = renderHook(() => useAppLogic());
      const initialPartsCount = result.current.currentEstimate.parts.length;

      act(() => {
        result.current.handleAddPart();
      });

      expect(result.current.currentEstimate.parts).toHaveLength(initialPartsCount + 1);
    });

    it('updates a part using handleUpdatePart', () => {
      const { result } = renderHook(() => useAppLogic());
      const partId = result.current.currentEstimate.parts[0].id;

      act(() => {
        result.current.handleUpdatePart(partId, 'name', 'Updated Part');
      });

      expect(result.current.currentEstimate.parts[0].name).toBe('Updated Part');
    });

    it('deletes a part using handleDeletePart', () => {
      const { result } = renderHook(() => useAppLogic());
      const partId = result.current.currentEstimate.parts[0].id;
      const initialPartsCount = result.current.currentEstimate.parts.length;

      act(() => {
        result.current.handleDeletePart(partId);
      });

      expect(result.current.currentEstimate.parts).toHaveLength(initialPartsCount - 1);
    });
  });

  describe('shell management', () => {
    it('adds a shell using handleAddShell', () => {
      const { result } = renderHook(() => useAppLogic());
      const initialShellsCount = result.current.currentEstimate.shells?.length || 0;

      act(() => {
        result.current.handleAddShell();
      });

      expect(result.current.currentEstimate.shells).toHaveLength(initialShellsCount + 1);
    });

    it('updates a shell using handleUpdateShell', () => {
      const { result } = renderHook(() => useAppLogic());

      act(() => {
        result.current.handleAddShell();
      });

      const shellId = result.current.currentEstimate.shells![0].id;

      act(() => {
        result.current.handleUpdateShell(shellId, 'manufacturer', 'Test Manufacturer');
      });

      expect(result.current.currentEstimate.shells![0].manufacturer).toBe('Test Manufacturer');
    });

    it('deletes a shell using handleDeleteShell', () => {
      const { result } = renderHook(() => useAppLogic());

      act(() => {
        result.current.handleAddShell();
      });

      const shellId = result.current.currentEstimate.shells![0].id;
      const initialShellsCount = result.current.currentEstimate.shells!.length;

      act(() => {
        result.current.handleDeleteShell(shellId);
      });

      expect(result.current.currentEstimate.shells).toHaveLength(initialShellsCount - 1);
    });
  });

  describe('estimate lifecycle', () => {
    it('creates a new estimate using handleCreateNewEstimate', () => {
      const { result } = renderHook(() => useAppLogic());

      // First make some changes
      act(() => {
        result.current.handleUpdateMeta('clientName', 'Test Client');
      });

      // Then create new
      act(() => {
        result.current.handleCreateNewEstimate();
      });

      expect(result.current.currentEstimate.clientName).toBe('');
      expect(result.current.currentEstimate.name).toBe('New Custom Parts Quote');
    });

    it('saves a new estimate using handleConfirmSaveFromModal', async () => {
      const { result } = renderHook(() => useAppLogic());

      await act(async () => {
        await result.current.handleConfirmSaveFromModal({
          name: 'Saved Quote',
          clientName: 'New Client',
          quoteNumber: 'Q-001',
          saveAsNew: true
        });
      });

      expect(result.current.currentEstimate.name).toBe('Saved Quote');
      expect(result.current.currentEstimate.clientName).toBe('New Client');
      expect(result.current.currentEstimate.quoteNumber).toBe('Q-001');
      expect(result.current.estimates).toHaveLength(1);

      const stored = JSON.parse(localStorage.getItem('custom_parts_estimates') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Saved Quote');

      expect(firebase.saveEstimateToCloud).toHaveBeenCalledTimes(1);
    });
  });


  describe('firebase subscription', () => {
    it('updates estimates when firestore subscription triggers onData', () => {
      const mockEstimates = [
        {
          id: 'estimate-cloud-1',
          name: 'Cloud Estimate 1',
          clientName: 'Cloud Client',
          quoteNumber: 'CQ-01',
          date: '2023-01-01',
          hourlyRate: 100,
          overheadPercent: 34,
          profitPercent: 10,
          parts: [],
          shells: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      // Re-mock to capture the onData callback
      let onDataCallback: any = null;
      vi.mocked(firebase.subscribeToEstimates).mockImplementation((onData, onError) => {
        onDataCallback = onData;
        return () => {};
      });

      const { result } = renderHook(() => useAppLogic());

      act(() => {
        if (onDataCallback) {
          onDataCallback(mockEstimates);
        }
      });

      expect(result.current.estimates).toHaveLength(1);
      expect(result.current.estimates[0].name).toBe('Cloud Estimate 1');
      expect(result.current.estimates[0].id).toBe('estimate-cloud-1');
    });
  });
});
