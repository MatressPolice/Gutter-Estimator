import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchEstimatesFromCloud, subscribeToEstimates } from './firebase';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn()
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
  enableIndexedDbPersistence: vi.fn()
}));

describe('firebase.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
