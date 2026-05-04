import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ViewControls } from '../view-controls.js';

describe('ViewControls', () => {
  it('renders desktop and mobile radio buttons', () => {
    render(
      <ViewControls
        device="desktop"
        onDeviceChange={() => {}}
        desktopLabel="Desktop preview"
        mobileLabel="Mobile preview"
      />
    );
    expect(screen.getByRole('radio', { name: 'Desktop preview' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Mobile preview' })).toBeInTheDocument();
  });

  it('marks desktop as checked when device is desktop', () => {
    render(
      <ViewControls
        device="desktop"
        onDeviceChange={() => {}}
        desktopLabel="Desktop preview"
        mobileLabel="Mobile preview"
      />
    );
    const desktop = screen.getByRole('radio', { name: 'Desktop preview' });
    const mobile = screen.getByRole('radio', { name: 'Mobile preview' });
    expect(desktop).toHaveAttribute('aria-checked', 'true');
    expect(mobile).toHaveAttribute('aria-checked', 'false');
  });

  it('marks mobile as checked when device is mobile', () => {
    render(
      <ViewControls
        device="mobile"
        onDeviceChange={() => {}}
        desktopLabel="Desktop preview"
        mobileLabel="Mobile preview"
      />
    );
    const desktop = screen.getByRole('radio', { name: 'Desktop preview' });
    const mobile = screen.getByRole('radio', { name: 'Mobile preview' });
    expect(mobile).toHaveAttribute('aria-checked', 'true');
    expect(desktop).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onDeviceChange with desktop when desktop button clicked', () => {
    const onDeviceChange = vi.fn();
    render(
      <ViewControls
        device="mobile"
        onDeviceChange={onDeviceChange}
        desktopLabel="Desktop preview"
        mobileLabel="Mobile preview"
      />
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Desktop preview' }));
    expect(onDeviceChange).toHaveBeenCalledWith('desktop');
  });

  it('calls onDeviceChange with mobile when mobile button clicked', () => {
    const onDeviceChange = vi.fn();
    render(
      <ViewControls
        device="desktop"
        onDeviceChange={onDeviceChange}
        desktopLabel="Desktop preview"
        mobileLabel="Mobile preview"
      />
    );
    fireEvent.click(screen.getByRole('radio', { name: 'Mobile preview' }));
    expect(onDeviceChange).toHaveBeenCalledWith('mobile');
  });

  it('has radiogroup role on the wrapper', () => {
    render(
      <ViewControls
        device="desktop"
        onDeviceChange={() => {}}
        desktopLabel="Desktop preview"
        mobileLabel="Mobile preview"
      />
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });
});
