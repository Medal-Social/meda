import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PlatformChrome } from './platform-chrome.js';

describe('PlatformChrome', () => {
  it('wraps children in a section labelled by the platform name', () => {
    render(
      <PlatformChrome platform="Instagram">
        <div data-testid="content">post body</div>
      </PlatformChrome>
    );
    expect(screen.getByRole('region', { name: 'Instagram preview' })).toContainElement(
      screen.getByTestId('content')
    );
  });

  it('renders without phone frame by default', () => {
    render(
      <PlatformChrome platform="X">
        <div>x</div>
      </PlatformChrome>
    );
    const region = screen.getByRole('region', { name: 'X preview' });
    expect(region).not.toHaveAttribute('data-phone-frame', 'true');
  });

  it('renders the phone frame when showPhoneFrame is true', () => {
    render(
      <PlatformChrome platform="Instagram" showPhoneFrame>
        <div>ig</div>
      </PlatformChrome>
    );
    const region = screen.getByRole('region', { name: 'Instagram preview' });
    expect(region).toHaveAttribute('data-phone-frame', 'true');
    // Status bar is inside
    expect(screen.getByText('9:41')).toBeInTheDocument();
  });

  it('forwards className to the outer wrapper', () => {
    render(
      <PlatformChrome platform="X" className="custom-class">
        <div />
      </PlatformChrome>
    );
    expect(screen.getByRole('region', { name: 'X preview' })).toHaveClass('custom-class');
  });
});
