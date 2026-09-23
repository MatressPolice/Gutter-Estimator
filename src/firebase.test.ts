import { describe, it, expect, vi, beforeEach } from 'vitest';
import { subscribeToEstimates } from './firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// Mock Firebase config to avoid the "Firebase: No Firebase App '[DEFAULT]' has been created" error
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
  describe('subscribeToEstimates', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should successfully subscribe and call onUpdate when data is received', () => {
      // Setup fake data
      const mockEstimatesData = [
        { id: '1', amount: 100 },
        { id: '2', amount: 200 }
      ];

      // Simulate a snapshot with the fake data
      const mockSnapshot = {
        docs: mockEstimatesData.map(data => ({
          data: () => data
        }))
      };

      // Mock onSnapshot to immediately trigger its success callback with the mock data
      vi.mocked(onSnapshot).mockImplementationOnce((q, onNext: any, onError: any) => {
        onNext(mockSnapshot);
        return vi.fn(); // Return an unsubscribe function
      });

      // Spies for the callbacks
      const onUpdateMock = vi.fn();
      const onErrorMock = vi.fn();

      // Call the function
      const unsubscribe = subscribeToEstimates(onUpdateMock, onErrorMock);

      // Verify
      expect(onSnapshot).toHaveBeenCalled();
      expect(onUpdateMock).toHaveBeenCalledWith(mockEstimatesData);
      expect(onErrorMock).not.toHaveBeenCalled();
      expect(unsubscribe).toBeInstanceOf(Function);
    });

    it('should call onError when onSnapshot encounters an error', () => {
      const mockError = new Error('Test error');

      // Mock onSnapshot to immediately trigger its error callback
      vi.mocked(onSnapshot).mockImplementationOnce((q, onNext: any, onError: any) => {
        onError(mockError);
        return vi.fn();
      });

      // Spies for the callbacks
      const onUpdateMock = vi.fn();
      const onErrorMock = vi.fn();

      // Call the function
      subscribeToEstimates(onUpdateMock, onErrorMock);

      // Verify
      expect(onSnapshot).toHaveBeenCalled();
      expect(onUpdateMock).not.toHaveBeenCalled();
      expect(onErrorMock).toHaveBeenCalledWith(mockError);
    });

    it('should not crash if onError is not provided and an error occurs', () => {
      const mockError = new Error('Test error');

      // Mock onSnapshot to immediately trigger its error callback
      vi.mocked(onSnapshot).mockImplementationOnce((q, onNext: any, onError: any) => {
        onError(mockError);
        return vi.fn();
      });

      // Spy for the callback
      const onUpdateMock = vi.fn();

      // Ensure console.warn doesn't pollute the test output, but verify it's called
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Call the function (should not throw)
      expect(() => {
        subscribeToEstimates(onUpdateMock);
      }).not.toThrow();

      // Verify
      expect(onSnapshot).toHaveBeenCalled();
      expect(onUpdateMock).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Firestore subscription warning:', mockError);

      consoleWarnSpy.mockRestore();
    });
  });
});
