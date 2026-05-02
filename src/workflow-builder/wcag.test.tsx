import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { WorkflowCard, WorkflowHeader, WorkflowToolbox } from './index.js';
import type { WorkflowSummary } from './types.js';

const sample: WorkflowSummary = {
  id: 'wf1',
  name: 'Welcome flow',
  status: 'active',
  triggerLabel: 'Contact created',
};

describe('workflow-builder a11y', () => {
  it('WorkflowToolbox has no axe violations', async () => {
    const { container } = render(<WorkflowToolbox onAddNode={() => undefined} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('WorkflowHeader has no axe violations', async () => {
    const { container } = render(
      <WorkflowHeader name="Demo" status="active" onSave={() => undefined} />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('WorkflowCard has no axe violations', async () => {
    const { container } = render(<WorkflowCard workflow={sample} onClick={() => undefined} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
