import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShellAuthFrame, ShellAuthThemeToggle } from './shell-auth-frame.js';

afterEach(() => {
  cleanup();
});

describe('ShellAuthFrame', () => {
  it('renders split auth chrome with brand, preview, actions, and form slot', () => {
    render(
      <ShellAuthFrame
        brandName="Medal"
        title="Run every customer workflow from one shell"
        description="A split auth entry point with the product preview on the brand side."
        actions={<button type="button">Theme</button>}
        preview={<div>Workspace preview</div>}
      >
        <form aria-label="Sign in form">FORM SLOT</form>
      </ShellAuthFrame>
    );

    expect(screen.getByTestId('shell-auth-frame')).toBeInTheDocument();
    expect(screen.getByText('Medal')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Run every customer workflow from one shell' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('A split auth entry point with the product preview on the brand side.')
    ).toBeInTheDocument();
    expect(screen.getByText('Workspace preview')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Sign in form' })).toHaveTextContent('FORM SLOT');
  });

  it('renders a default preview when no preview slot is provided', () => {
    render(
      <ShellAuthFrame title="Welcome back">
        <form aria-label="Default preview form" />
      </ShellAuthFrame>
    );

    expect(screen.getByTestId('shell-auth-default-preview')).toBeInTheDocument();
  });
});

describe('ShellAuthThemeToggle', () => {
  it('calls onValueChange and marks the active theme', () => {
    const onValueChange = vi.fn();

    render(<ShellAuthThemeToggle value="dark" onValueChange={onValueChange} />);

    expect(screen.getByRole('button', { name: 'Light theme' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByRole('button', { name: 'Dark theme' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Light theme' }));

    expect(onValueChange).toHaveBeenCalledWith('light');
  });
});
