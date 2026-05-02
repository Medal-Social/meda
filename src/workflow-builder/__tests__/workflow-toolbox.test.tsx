import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkflowToolbox } from '../index.js';

describe('WorkflowToolbox', () => {
  it('renders default items', () => {
    render(<WorkflowToolbox onAddNode={() => undefined} />);
    expect(screen.getByText('Trigger')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Condition')).toBeInTheDocument();
    expect(screen.getByText('Delay')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  it('calls onAddNode when an item is clicked', () => {
    const onAdd = vi.fn();
    render(<WorkflowToolbox onAddNode={onAdd} />);
    fireEvent.click(screen.getByText('Action'));
    expect(onAdd).toHaveBeenCalledWith('action');
  });

  it('respects custom labels override', () => {
    render(
      <WorkflowToolbox
        onAddNode={() => undefined}
        labels={{ addAction: 'Run task', toolboxTitle: 'Steps' }}
      />
    );
    expect(screen.getByText('Steps')).toBeInTheDocument();
    expect(screen.getByText('Run task')).toBeInTheDocument();
  });

  it('shows read-only hint when readOnly', () => {
    render(<WorkflowToolbox readOnly labels={{ toolboxReadOnlyHint: 'Locked' }} />);
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.queryByText('Trigger')).not.toBeInTheDocument();
  });
});
