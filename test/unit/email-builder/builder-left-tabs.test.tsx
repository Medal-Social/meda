import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BuilderLeftTabs } from '../../../src/email-builder/builder-left-tabs.js';
import { defaultEmailBuilderLabels } from '../../../src/email-builder/types.js';

const labels = defaultEmailBuilderLabels;

describe('BuilderLeftTabs', () => {
  it('renders blocks and envelope tabs', () => {
    render(
      <BuilderLeftTabs
        labels={labels}
        blocksContent={<div>blocks content</div>}
        envelopeContent={<div>envelope content</div>}
      />
    );
    expect(screen.getByRole('tab', { name: labels.blocksTab })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: labels.envelopeTab })).toBeInTheDocument();
  });

  it('shows blocks content by default', () => {
    render(
      <BuilderLeftTabs
        labels={labels}
        blocksContent={<div>blocks content</div>}
        envelopeContent={<div>envelope content</div>}
      />
    );
    expect(screen.getByText('blocks content')).toBeInTheDocument();
  });

  it('switches to envelope content when envelope tab is clicked', () => {
    render(
      <BuilderLeftTabs
        labels={labels}
        blocksContent={<div>blocks content</div>}
        envelopeContent={<div>envelope content</div>}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: labels.envelopeTab }));
    expect(screen.getByText('envelope content')).toBeInTheDocument();
  });

  it('renders the design tab when designContent is provided', () => {
    render(
      <BuilderLeftTabs
        labels={labels}
        blocksContent={<div>blocks content</div>}
        designContent={<div>design content</div>}
        envelopeContent={<div>envelope content</div>}
      />
    );
    expect(screen.getByRole('tab', { name: labels.designTab })).toBeInTheDocument();
  });

  it('shows design content when design tab is clicked', () => {
    render(
      <BuilderLeftTabs
        labels={labels}
        blocksContent={<div>blocks content</div>}
        designContent={<div>design content</div>}
        envelopeContent={<div>envelope content</div>}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: labels.designTab }));
    expect(screen.getByText('design content')).toBeInTheDocument();
  });

  it('marks the active tab with aria-selected=true', () => {
    render(
      <BuilderLeftTabs
        labels={labels}
        blocksContent={<div>blocks content</div>}
        envelopeContent={<div>envelope content</div>}
      />
    );
    expect(screen.getByRole('tab', { name: labels.blocksTab })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: labels.envelopeTab })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('updates aria-selected when a different tab is clicked', () => {
    render(
      <BuilderLeftTabs
        labels={labels}
        blocksContent={<div>blocks content</div>}
        envelopeContent={<div>envelope content</div>}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: labels.envelopeTab }));
    expect(screen.getByRole('tab', { name: labels.envelopeTab })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: labels.blocksTab })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });
});
