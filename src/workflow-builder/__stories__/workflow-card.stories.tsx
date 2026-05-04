import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkflowCard, WorkflowCardCompact } from '../index.js';
import { SAMPLE_WORKFLOWS } from './fixtures.js';

const meta: Meta<typeof WorkflowCard> = {
  title: 'Apps/Workflow/Card',
  component: WorkflowCard,
};
export default meta;
type Story = StoryObj<typeof WorkflowCard>;

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 720 }}>
      {SAMPLE_WORKFLOWS.map((wf) => (
        <WorkflowCard key={wf.id} workflow={wf} onClick={() => undefined} />
      ))}
    </div>
  ),
};

export const Compact: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      {SAMPLE_WORKFLOWS.map((wf) => (
        <WorkflowCardCompact key={wf.id} workflow={wf} onClick={() => undefined} />
      ))}
    </div>
  ),
};
