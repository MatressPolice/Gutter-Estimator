import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveEstimateToCloud } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Estimate } from './types';

// Mock firebase/app
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

// Mock firebase/firestore
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
  enableIndexedDbPersistence: vi.fn(),
}));

describe('firebase', () => {
  describe('saveEstimateToCloud', () => {
    const mockEstimate: Estimate = {
      id: 'test-id',
      clientName: 'Test Client',
      type: 'shell',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    };

    beforeEach(() => {
      vi.clearAllMocks();
      // Suppress console.error in tests
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

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

      await expect(saveEstimateToCloud(mockEstimate)).rejects.toThrow('Failed to save');

      expect(console.error).toHaveBeenCalledWith('Error saving estimate to cloud:', mockError);
    });
  });
});
