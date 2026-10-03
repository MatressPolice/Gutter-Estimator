import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchEstimatesFromCloud, subscribeToEstimates, saveEstimateToCloud, deleteEstimateFromCloud, db } from './firebase';
import { collection, query, orderBy, onSnapshot, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Estimate } from './types';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn()
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: { uid: 'test-user-id' } })),
  signInAnonymously: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback({ uid: 'test-user-id' });
    return vi.fn();
  }),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  enableIndexedDbPersistence: vi.fn()
}));

describe('firebase.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveEstimateToCloud', () => {
    const mockEstimate: Estimate = {
      id: 'test-id',
      name: 'Test Estimate',
      clientName: 'Test Client',
      quoteNumber: 'Q-100',
      date: '2026-10-03',
      hourlyRate: 100,
      overheadPercent: 20,
      profitPercent: 10,
      parts: [],
      shells: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should successfully save an estimate to the cloud', async () => {
      const mockDocRef = { id: 'test-id' };
      vi.mocked(doc).mockReturnValue(mockDocRef as any);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      await saveEstimateToCloud(mockEstimate);

      expect(doc).toHaveBeenCalled();
      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          ...mockEstimate,
          updatedAt: expect.any(String),
        }),
        { merge: true }
      );
    });

    it('should throw an error and log it when save fails', async () => {
      const mockDocRef = { id: 'test-id' };
      const mockError = new Error('Failed to save');

      vi.mocked(doc).mockReturnValue(mockDocRef as any);
      vi.mocked(setDoc).mockRejectedValue(mockError);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(saveEstimateToCloud(mockEstimate)).rejects.toThrow('Failed to save');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving estimate to cloud:', mockError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchEstimatesFromCloud', () => {
    it('should return an empty array and log an error when getDocs throws', async () => {
      const error = new Error('Network error');
      vi.mocked(getDocs).mockRejectedValueOnce(error);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await fetchEstimatesFromCloud();

      expect(getDocs).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching estimates from cloud:', error);
      expect(result).toEqual([]);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('subscribeToEstimates', () => {
    it('should successfully subscribe and call onUpdate when data is received', () => {
      const mockEstimatesData = [
        { id: '1', amount: 100 },
        { id: '2', amount: 200 }
      ];

      const mockSnapshot = {
        docs: mockEstimatesData.map(data => ({
          data: () => data
        }))
      };

      vi.mocked(onSnapshot).mockImplementationOnce((q, onNext: any, onError: any) => {
        onNext(mockSnapshot);
        return vi.fn();
      });

      const onUpdateMock = vi.fn();
      const onErrorMock = vi.fn();

      const unsubscribe = subscribeToEstimates(onUpdateMock, onErrorMock);

      expect(onSnapshot).toHaveBeenCalled();
      expect(onUpdateMock).toHaveBeenCalledWith(mockEstimatesData);
      expect(onErrorMock).not.toHaveBeenCalled();
      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it('should call onError when onSnapshot encounters an error', () => {
      const mockError = new Error('Test error');

      vi.mocked(onSnapshot).mockImplementationOnce((q, onNext: any, onError: any) => {
        onError(mockError);
        return vi.fn();
      });

      const onUpdateMock = vi.fn();
      const onErrorMock = vi.fn();

      subscribeToEstimates(onUpdateMock, onErrorMock);

      expect(onSnapshot).toHaveBeenCalled();
      expect(onUpdateMock).not.toHaveBeenCalled();
      expect(onErrorMock).toHaveBeenCalledWith(mockError);
    });

    it('should not crash if onError is not provided and an error occurs', () => {
      const mockError = new Error('Test error');

      vi.mocked(onSnapshot).mockImplementationOnce((q, onNext: any, onError: any) => {
        onError(mockError);
        return vi.fn();
      });

      const onUpdateMock = vi.fn();
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => {
        subscribeToEstimates(onUpdateMock);
      }).not.toThrow();

      expect(onSnapshot).toHaveBeenCalled();
      expect(onUpdateMock).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Firestore subscription warning:', mockError);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('deleteEstimateFromCloud', () => {
    const MOCK_ID = 'test-estimate-123';

    it('should delete the estimate successfully', async () => {
      vi.mocked(deleteDoc).mockResolvedValueOnce(undefined);
      const mockDocRef = {} as any;
      vi.mocked(doc).mockReturnValueOnce(mockDocRef);

      await deleteEstimateFromCloud(MOCK_ID);

      expect(doc).toHaveBeenCalledWith(db, 'estimates', MOCK_ID);
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should throw an error and log it if deletion fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockError = new Error('Failed to delete document');
      vi.mocked(deleteDoc).mockRejectedValueOnce(mockError);
      const mockDocRef = {} as any;
      vi.mocked(doc).mockReturnValueOnce(mockDocRef);

      await expect(deleteEstimateFromCloud(MOCK_ID)).rejects.toThrow('Failed to delete document');

      expect(doc).toHaveBeenCalledWith(db, 'estimates', MOCK_ID);
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting estimate from cloud:', mockError);

      consoleSpy.mockRestore();
    });
  });
});
