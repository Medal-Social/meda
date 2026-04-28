import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = { title: 'BannedParam', component: () => null } satisfies Meta<unknown>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  parameters: { themes: { themeOverride: 'dark' } },
};
export const WithViewport: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
