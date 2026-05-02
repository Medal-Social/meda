import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkflowHeader } from '../workflow-header.js';

describe('WorkflowHeader', () => {
  it('renders name and status', () => {
    render(<WorkflowHeader name="My flow" status="active" />);
    expect(screen.getByText('My flow')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls onSave when Save is clicked', () => {
    const onSave = vi.fn();
    render(<WorkflowHeader name="Flow" onSave={onSave} />);
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalled();
  });

  it('shows Pause when status is active', () => {
    const onPause = vi.fn();
    render(<WorkflowHeader name="Flow" status="active" onPause={onPause} />);
    fireEvent.click(screen.getByText('Pause'));
    expect(onPause).toHaveBeenCalled();
  });

  it('hides actions in readOnly mode', () => {
    render(<WorkflowHeader name="Flow" status="active" onSave={() => undefined} readOnly />);
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('respects custom labels', () => {
    render(
      <WorkflowHeader name="Flow" onSave={() => undefined} labels={{ saveAction: 'Persist' }} />
    );
    expect(screen.getByText('Persist')).toBeInTheDocument();
  });
});
