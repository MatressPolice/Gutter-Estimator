import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchEstimatesFromCloud } from './firebase';
import { getDocs } from 'firebase/firestore';

// Mock firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

vi.mock('firebase/firestore', () => {
  return {
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
  };
});

describe('fetchEstimatesFromCloud', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an empty array and log an error when getDocs throws', async () => {
    // Arrange
    const error = new Error('Network error');
    vi.mocked(getDocs).mockRejectedValueOnce(error);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    const result = await fetchEstimatesFromCloud();

    // Assert
    expect(getDocs).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching estimates from cloud:', error);
    expect(result).toEqual([]);

    consoleErrorSpy.mockRestore();
  });
});
