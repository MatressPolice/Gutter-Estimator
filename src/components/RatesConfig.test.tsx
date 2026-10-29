import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RatesConfig from './RatesConfig';

describe('RatesConfig', () => {
  const mockOnUpdateRates = vi.fn();

  const defaultProps = {
    hourlyRate: 50,
    overheadPercent: 20,
    profitPercent: 15,
    onUpdateRates: mockOnUpdateRates,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with given props', () => {
    render(<RatesConfig {...defaultProps} />);

    // Check title
    expect(screen.getByText('Estimation Rates (Editable)')).toBeInTheDocument();

    // Check if inputs have correct values
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(3);

    // Hourly Rate input
    expect(inputs[0]).toHaveValue(50);
    // Overhead Percent input
    expect(inputs[1]).toHaveValue(20);
    // Profit Percent input
    expect(inputs[2]).toHaveValue(15);
  });

  describe('Hourly Labor Rate', () => {
    it('calls onUpdateRates when value changes', () => {
      render(<RatesConfig {...defaultProps} />);
      const inputs = screen.getAllByRole('spinbutton');

      fireEvent.change(inputs[0], { target: { value: '60' } });
      expect(mockOnUpdateRates).toHaveBeenCalledWith('hourlyRate', 60);
    });

    it('bounds negative values to 0', () => {
      render(<RatesConfig {...defaultProps} />);
      const inputs = screen.getAllByRole('spinbutton');

      fireEvent.change(inputs[0], { target: { value: '-10' } });
      expect(mockOnUpdateRates).toHaveBeenCalledWith('hourlyRate', 0);
    });
  });

  describe('Overhead Percentage', () => {
    it('calls onUpdateRates when value changes', () => {
      render(<RatesConfig {...defaultProps} />);
      const inputs = screen.getAllByRole('spinbutton');

      fireEvent.change(inputs[1], { target: { value: '30' } });
      expect(mockOnUpdateRates).toHaveBeenCalledWith('overheadPercent', 30);
    });

    it('bounds negative values to 0', () => {
      render(<RatesConfig {...defaultProps} />);
      const inputs = screen.getAllByRole('spinbutton');

      fireEvent.change(inputs[1], { target: { value: '-5' } });
      expect(mockOnUpdateRates).toHaveBeenCalledWith('overheadPercent', 0);
    });

    it('bounds values greater than 100 to 100', () => {
      render(<RatesConfig {...defaultProps} />);
      const inputs = screen.getAllByRole('spinbutton');

      fireEvent.change(inputs[1], { target: { value: '150' } });
      expect(mockOnUpdateRates).toHaveBeenCalledWith('overheadPercent', 100);
    });
  });

  describe('Target Profit Margin', () => {
    it('calls onUpdateRates when value changes', () => {
      render(<RatesConfig {...defaultProps} />);
      const inputs = screen.getAllByRole('spinbutton');

      fireEvent.change(inputs[2], { target: { value: '25' } });
      expect(mockOnUpdateRates).toHaveBeenCalledWith('profitPercent', 25);
    });

    it('bounds negative values to 0', () => {
      render(<RatesConfig {...defaultProps} />);
      const inputs = screen.getAllByRole('spinbutton');

      fireEvent.change(inputs[2], { target: { value: '-15' } });
      expect(mockOnUpdateRates).toHaveBeenCalledWith('profitPercent', 0);
    });

    it('bounds values greater than 100 to 100', () => {
      render(<RatesConfig {...defaultProps} />);
      const inputs = screen.getAllByRole('spinbutton');

      fireEvent.change(inputs[2], { target: { value: '200' } });
      expect(mockOnUpdateRates).toHaveBeenCalledWith('profitPercent', 100);
    });
  });
});
