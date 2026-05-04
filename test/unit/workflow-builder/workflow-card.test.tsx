import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkflowCard, WorkflowCardCompact } from '../../../src/workflow-builder/index.js';
import type { WorkflowSummary } from '../../../src/workflow-builder/types.js';

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

  it('triggers onClick on Enter keydown', () => {
    const onClick = vi.fn();
    render(<WorkflowCard workflow={wf} onClick={onClick} />);
    const card = document.querySelector('[data-slot="workflow-card"]');
    if (!card) throw new Error('card not found');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });

  it('triggers onClick on Space keydown', () => {
    const onClick = vi.fn();
    render(<WorkflowCard workflow={wf} onClick={onClick} />);
    const card = document.querySelector('[data-slot="workflow-card"]');
    if (!card) throw new Error('card not found');
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalled();
  });

  it('does not trigger onClick on other key presses', () => {
    const onClick = vi.fn();
    render(<WorkflowCard workflow={wf} onClick={onClick} />);
    const card = document.querySelector('[data-slot="workflow-card"]');
    if (!card) throw new Error('card not found');
    fireEvent.keyDown(card, { key: 'Tab' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders meta rows', () => {
    render(<WorkflowCard workflow={wf} />);
    expect(screen.getByText('Sent:')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
  });

  it('renders draft status correctly', () => {
    render(<WorkflowCard workflow={{ ...wf, status: 'draft' }} />);
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('renders paused status correctly', () => {
    render(<WorkflowCard workflow={{ ...wf, status: 'paused' }} />);
    expect(screen.getByText('paused')).toBeInTheDocument();
  });

  it('renders with creatorAvatarUrl', () => {
    render(
      <WorkflowCard workflow={{ ...wf, creatorAvatarUrl: 'https://example.com/avatar.jpg' }} />
    );
    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toBe('https://example.com/avatar.jpg');
  });

  it('renders initials avatar when no creatorAvatarUrl', () => {
    render(
      <WorkflowCard workflow={{ ...wf, creatorName: 'Jane Doe', creatorAvatarUrl: undefined }} />
    );
    // Initials "JD" should be shown
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders without triggerLabel', () => {
    const { container } = render(<WorkflowCard workflow={{ ...wf, triggerLabel: undefined }} />);
    expect(container.querySelector('[data-slot="workflow-card"]')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<WorkflowCard workflow={{ ...wf, description: undefined }} />);
    expect(screen.getByText('Welcome flow')).toBeInTheDocument();
  });

  it('renders without createdAt or creatorName', () => {
    const { container } = render(
      <WorkflowCard workflow={{ ...wf, createdAt: undefined, creatorName: undefined }} />
    );
    expect(container.querySelector('[data-slot="workflow-card"]')).toBeInTheDocument();
  });

  it('renders without meta', () => {
    const { container } = render(<WorkflowCard workflow={{ ...wf, meta: undefined }} />);
    expect(container.querySelector('[data-slot="workflow-card"]')).toBeInTheDocument();
  });

  it('renders without onClick (no button role)', () => {
    const { container } = render(<WorkflowCard workflow={wf} />);
    const card = container.querySelector('[data-slot="workflow-card"]');
    expect(card?.getAttribute('role')).toBeNull();
  });

  it('renders createdAt as relative time', () => {
    render(<WorkflowCard workflow={{ ...wf, createdAt: Date.now() - 1000 * 60 * 60 * 2 }} />);
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('renders createdAt as days ago', () => {
    render(<WorkflowCard workflow={{ ...wf, createdAt: Date.now() - 1000 * 60 * 60 * 48 }} />);
    expect(screen.getByText('2d ago')).toBeInTheDocument();
  });

  it('renders createdAt as just now', () => {
    render(<WorkflowCard workflow={{ ...wf, createdAt: Date.now() - 30 * 1000 }} />);
    expect(screen.getByText('just now')).toBeInTheDocument();
  });

  it('renders with createdAt only (no creatorName) — covers creatorName false branch', () => {
    render(
      <WorkflowCard
        workflow={{ ...wf, creatorName: undefined, createdAt: Date.now() - 1000 * 60 * 5 }}
      />
    );
    expect(screen.getByText('5m ago')).toBeInTheDocument();
  });

  it('renders with creatorName only (no createdAt) — covers createdAt false branch', () => {
    render(<WorkflowCard workflow={{ ...wf, createdAt: undefined, creatorName: 'Sam' }} />);
    expect(screen.getByText('Sam')).toBeInTheDocument();
    // No relative time rendered
    expect(screen.queryByText(/ago/)).not.toBeInTheDocument();
  });

  it('getInitials handles name with empty part (double space) — covers ?? branch', () => {
    // Double-space name produces an empty split part, exercising `part[0] ?? ''`
    render(
      <WorkflowCard workflow={{ ...wf, creatorName: 'Ali  Lloyd', creatorAvatarUrl: undefined }} />
    );
    // Initials should be "AL" (from "Ali" and "Lloyd", the empty part contributes "")
    expect(screen.getByText('AL')).toBeInTheDocument();
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

  it('triggers onClick on Enter keydown', () => {
    const onClick = vi.fn();
    render(<WorkflowCardCompact workflow={wf} onClick={onClick} />);
    const card = document.querySelector('[data-slot="workflow-card-compact"]');
    if (!card) throw new Error('compact card not found');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalled();
  });

  it('triggers onClick on Space keydown', () => {
    const onClick = vi.fn();
    render(<WorkflowCardCompact workflow={wf} onClick={onClick} />);
    const card = document.querySelector('[data-slot="workflow-card-compact"]');
    if (!card) throw new Error('compact card not found');
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalled();
  });

  it('does not trigger onClick on other keys', () => {
    const onClick = vi.fn();
    render(<WorkflowCardCompact workflow={wf} onClick={onClick} />);
    const card = document.querySelector('[data-slot="workflow-card-compact"]');
    if (!card) throw new Error('compact card not found');
    fireEvent.keyDown(card, { key: 'Tab' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders description when provided', () => {
    render(<WorkflowCardCompact workflow={wf} />);
    expect(screen.getByText('Onboard new contacts.')).toBeInTheDocument();
  });

  it('renders without description', () => {
    const { container } = render(
      <WorkflowCardCompact workflow={{ ...wf, description: undefined }} />
    );
    expect(container.querySelector('[data-slot="workflow-card-compact"]')).toBeInTheDocument();
  });

  it('renders without triggerLabel', () => {
    const { container } = render(
      <WorkflowCardCompact workflow={{ ...wf, triggerLabel: undefined }} />
    );
    expect(container.querySelector('[data-slot="workflow-card-compact"]')).toBeInTheDocument();
  });

  it('renders paused status', () => {
    render(<WorkflowCardCompact workflow={{ ...wf, status: 'paused' }} />);
    expect(screen.getByText('paused')).toBeInTheDocument();
  });

  it('renders draft status', () => {
    render(<WorkflowCardCompact workflow={{ ...wf, status: 'draft' }} />);
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('renders without onClick (no button role)', () => {
    const { container } = render(<WorkflowCardCompact workflow={wf} />);
    const card = container.querySelector('[data-slot="workflow-card-compact"]');
    expect(card?.getAttribute('role')).toBeNull();
  });
});
