import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { WorkflowCard } from '../../../src/workflow-builder/index.js';
import type { WorkflowSummary } from '../../../src/workflow-builder/types.js';
import { WorkflowHeader } from '../../../src/workflow-builder/workflow-header.js';
import { WorkflowToolbox } from '../../../src/workflow-builder/workflow-toolbox.js';

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
