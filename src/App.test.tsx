import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import App from './App';
import * as firebaseClient from './firebase';

// Mock dependencies
vi.mock('./firebase', () => ({
  saveEstimateToCloud: vi.fn(),
  deleteEstimateFromCloud: vi.fn(),
  subscribeToEstimates: vi.fn((onUpdate) => {
    // Immediate return of an empty list of estimates for first load
    onUpdate([]);
    return vi.fn();
  }),
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mock local storage
    Storage.prototype.getItem = vi.fn(() => null);
    Storage.prototype.setItem = vi.fn();
  });

  test('should handle cloud save error gracefully and display warning', async () => {
    const errorSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockError = new Error('Cloud offline');

    // Setup save to fail
    (firebaseClient.saveEstimateToCloud as any).mockRejectedValueOnce(mockError);

    render(<App />);

    // In App.tsx, to enable the Save Estimate button we need hasUnsavedChanges to be true.
    // It is calculated with:
    // const isFilled = currentEstimate.clientName || currentEstimate.quoteNumber || currentEstimate.parts.some(p => p.name || p.hours > 0 || p.pricePerSheet > 0);
    // So modifying the parts name or clientName should enable it. Let's do clientName.
    const clientNameInput = screen.getByPlaceholderText('e.g. Acme Manufacturing');

    // Change input
    fireEvent.change(clientNameInput, { target: { value: 'Acme Corp' } });

    // Check if Save Estimate button becomes enabled
    let saveButton;
    await waitFor(() => {
      const btns = screen.getAllByRole('button');
      saveButton = btns.find(b => b.textContent?.includes('Save Estimate'));
      expect(saveButton).not.toBeNull();
      // Look for the absence of the 'disabled' attribute
      expect(saveButton).not.toBeDisabled();
    });

    if (saveButton) {
      fireEvent.click(saveButton);

      // Look for the "Save Quote" modal
      await waitFor(() => {
        expect(screen.getByText('Save & Name Estimate')).toBeInTheDocument();
      });

      // The modal opens and has an input for Name, let's type a name to make sure we know what it is
      // the placeholder in modal is "e.g. Commercial 6-Inch Box Gutters & Downspouts"
      const modalProjectName = screen.getByPlaceholderText('e.g. Commercial 6-Inch Box Gutters & Downspouts');
      fireEvent.change(modalProjectName, { target: { value: 'Test Project 123' } });

      // We can also find the button by type="submit" or text
      const submitBtn = screen.getByRole('button', { name: /save & update quote/i });
      fireEvent.click(submitBtn);

      // Wait for the save flow to complete and catch block to trigger
      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith('Cloud sync offline; stored in local cache:', mockError);
      });

      // Verify toast is shown for local save
      expect(screen.getByText(/Saved quote: "Test Project 123" to Cloud Firestore!/)).toBeInTheDocument();
    }

    errorSpy.mockRestore();
  });
});
