import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkflowCard, WorkflowCardCompact } from '../index.js';
import type { WorkflowSummary } from '../types.js';

const wf: WorkflowSummary = {
  id: 'wf1',
  name: 'Welcome flow',
  description: 'Onboard new contacts.',
  status: 'active',
  triggerLabel: 'Contact created',
  meta: [{ label: 'Sent', value: '32' }],
  creatorName: 'Ali Lloyd',
  createdAt: Date.now() - 1000 * 60 * 30,
};

describe('WorkflowCard', () => {
  it('renders name, description, status and trigger', () => {
    render(<WorkflowCard workflow={wf} />);
    expect(screen.getByText('Welcome flow')).toBeInTheDocument();
    expect(screen.getByText('Onboard new contacts.')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('Contact created')).toBeInTheDocument();
  });

  it('triggers onClick', () => {
    const onClick = vi.fn();
    render(<WorkflowCard workflow={wf} onClick={onClick} />);
    fireEvent.click(screen.getByText('Welcome flow'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders meta rows', () => {
    render(<WorkflowCard workflow={wf} />);
    expect(screen.getByText('Sent:')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
  });
});

describe('WorkflowCardCompact', () => {
  it('renders compact card', () => {
    render(<WorkflowCardCompact workflow={wf} />);
    expect(screen.getByText('Welcome flow')).toBeInTheDocument();
    expect(screen.getByText('Contact created')).toBeInTheDocument();
  });

  it('triggers onClick', () => {
    const onClick = vi.fn();
    render(<WorkflowCardCompact workflow={wf} onClick={onClick} />);
    fireEvent.click(screen.getByText('Welcome flow'));
    expect(onClick).toHaveBeenCalled();
  });
});
