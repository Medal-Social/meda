import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = { title: 'Clean', component: () => null } satisfies Meta<unknown>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithIcon: Story = {};
