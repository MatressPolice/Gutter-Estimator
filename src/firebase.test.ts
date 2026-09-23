import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteEstimateFromCloud, db } from './firebase';
import { deleteDoc, doc } from 'firebase/firestore';

// Mock the entire firebase/firestore module
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual as any,
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    doc: vi.fn(),
    deleteDoc: vi.fn(),
  };
});

// Mock the firebase/app module because firebase.ts calls initializeApp and getApps
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

describe('deleteEstimateFromCloud', () => {
  const MOCK_ID = 'test-estimate-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete the estimate successfully', async () => {
    // Setup the mock to resolve successfully
    vi.mocked(deleteDoc).mockResolvedValueOnce(undefined);
    const mockDocRef = {} as any;
    vi.mocked(doc).mockReturnValueOnce(mockDocRef);

    // Call the function
    await deleteEstimateFromCloud(MOCK_ID);

    // Verify
    expect(doc).toHaveBeenCalledWith(db, 'estimates', MOCK_ID);
    expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
  });

  it('should throw an error and log it if deletion fails', async () => {
    // Prevent console.error from littering the test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Setup the mock to reject with an error
    const mockError = new Error('Failed to delete document');
    vi.mocked(deleteDoc).mockRejectedValueOnce(mockError);
    const mockDocRef = {} as any;
    vi.mocked(doc).mockReturnValueOnce(mockDocRef);

    // Call the function and expect it to throw the same error
    await expect(deleteEstimateFromCloud(MOCK_ID)).rejects.toThrow('Failed to delete document');

    // Verify
    expect(doc).toHaveBeenCalledWith(db, 'estimates', MOCK_ID);
    expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    expect(consoleSpy).toHaveBeenCalledWith('Error deleting estimate from cloud:', mockError);

    // Cleanup
    consoleSpy.mockRestore();
  });
});
