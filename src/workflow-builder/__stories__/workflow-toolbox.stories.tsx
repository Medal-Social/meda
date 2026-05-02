import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkflowToolbox } from '../index.js';

const meta: Meta<typeof WorkflowToolbox> = {
  title: 'WorkflowBuilder/WorkflowToolbox',
  component: WorkflowToolbox,
};
export default meta;
type Story = StoryObj<typeof WorkflowToolbox>;

export const Default: Story = {
  render: () => (
    <div style={{ height: 480, width: 256 }}>
      <WorkflowToolbox onAddNode={() => undefined} />
    </div>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <div style={{ height: 480, width: 256 }}>
      <WorkflowToolbox readOnly />
    </div>
  ),
};
