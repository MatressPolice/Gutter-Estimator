import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, test, expect } from 'vitest';
import DivZeroWarning from './DivZeroWarning';

describe('DivZeroWarning Component', () => {
  test('renders default styling and text', () => {
    render(<DivZeroWarning />);
    const element = screen.getByText('#DIV/0!');
    expect(element).toBeInTheDocument();
    // testing parent wrapper classes since text is inside a child span
    expect(element.parentElement).toHaveClass('justify-end', 'text-rose-500');
  });

  test('applies custom className', () => {
    render(<DivZeroWarning className="custom-class text-blue-500" />);
    const element = screen.getByText('#DIV/0!');
    expect(element.parentElement).toHaveClass('custom-class', 'text-blue-500');
    expect(element.parentElement).not.toHaveClass('justify-end', 'text-rose-500');
  });
});
