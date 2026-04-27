import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ZIndexTable } from './ZIndexTable';

describe('ZIndexTable', () => {
  it('renders the z-index ladder in ascending order', () => {
    render(<ZIndexTable />);
    expect(screen.getByText('shell-header')).toBeInTheDocument();
    expect(screen.getByText('shell-fullscreen')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });
});
