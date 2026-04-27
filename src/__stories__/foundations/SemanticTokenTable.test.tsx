import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SemanticTokenTable } from './SemanticTokenTable';

describe('SemanticTokenTable', () => {
  it('renders a row per semantic token in the requested group', () => {
    render(<SemanticTokenTable group="shape" />);
    const table = screen.getByRole('table');
    expect(within(table).getByText('background')).toBeInTheDocument();
    expect(within(table).getByText('foreground')).toBeInTheDocument();
    expect(within(table).getByText('primary')).toBeInTheDocument();
  });

  it('shows the description column', () => {
    render(<SemanticTokenTable group="shape" />);
    expect(screen.getByText('Default page canvas.')).toBeInTheDocument();
  });

  it('does not include tokens from other groups', () => {
    render(<SemanticTokenTable group="status" />);
    expect(screen.queryByText('background')).not.toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
  });
});
