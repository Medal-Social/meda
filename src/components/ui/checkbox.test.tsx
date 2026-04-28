import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './checkbox.js';

describe('Checkbox', () => {
  it('renders with accessible role', () => {
    render(<Checkbox aria-label="Select row" />);
    expect(screen.getByRole('checkbox', { name: 'Select row' })).toBeInTheDocument();
  });

  it('forwards indeterminate to ARIA state', () => {
    render(<Checkbox aria-label="Select" indeterminate />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  });

  it('toggles when clicked', async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Select" onCheckedChange={onChange} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('checkbox'));
    });
    // base-ui onCheckedChange(checked, event) — assert the first arg is true
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });
});
