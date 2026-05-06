import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BuilderHeader } from '../../../src/email-builder/builder-header.js';
import { defaultEmailBuilderLabels } from '../../../src/email-builder/types.js';

const labels = defaultEmailBuilderLabels;

describe('BuilderHeader', () => {
  it('renders the preview label', () => {
    render(
      <BuilderHeader
        device="desktop"
        onDeviceChange={() => {}}
        onExport={() => {}}
        labels={labels}
      />
    );
    expect(screen.getByText(labels.preview)).toBeInTheDocument();
  });

  it('renders the export button with the exportHtml label', () => {
    render(
      <BuilderHeader
        device="desktop"
        onDeviceChange={() => {}}
        onExport={() => {}}
        labels={labels}
      />
    );
    expect(screen.getByText(labels.exportHtml)).toBeInTheDocument();
  });

  it('calls onExport when the export button is clicked', () => {
    const onExport = vi.fn();
    render(
      <BuilderHeader
        device="desktop"
        onDeviceChange={() => {}}
        onExport={onExport}
        labels={labels}
      />
    );
    fireEvent.click(screen.getByText(labels.exportHtml).closest('button') as HTMLElement);
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('renders the ViewControls with desktop and mobile radio buttons', () => {
    render(
      <BuilderHeader
        device="desktop"
        onDeviceChange={() => {}}
        onExport={() => {}}
        labels={labels}
      />
    );
    expect(screen.getByRole('radio', { name: labels.desktopPreview })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: labels.mobilePreview })).toBeInTheDocument();
  });

  it('calls onDeviceChange when mobile view is selected', () => {
    const onDeviceChange = vi.fn();
    render(
      <BuilderHeader
        device="desktop"
        onDeviceChange={onDeviceChange}
        onExport={() => {}}
        labels={labels}
      />
    );
    fireEvent.click(screen.getByRole('radio', { name: labels.mobilePreview }));
    expect(onDeviceChange).toHaveBeenCalledWith('mobile');
  });

  it('has the header data-slot attribute', () => {
    const { container } = render(
      <BuilderHeader
        device="desktop"
        onDeviceChange={() => {}}
        onExport={() => {}}
        labels={labels}
      />
    );
    expect(container.querySelector('[data-slot="email-builder-header"]')).toBeInTheDocument();
  });
});
