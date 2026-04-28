import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = { title: 'Banned', component: () => null } satisfies Meta<unknown>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const DarkTheme: Story = {};
export const MobileCombined: Story = {};
