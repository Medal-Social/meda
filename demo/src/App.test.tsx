import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('demo App', () => {
  it('renders the demo shell without crashing', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /the shell that runs medal/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });
});
