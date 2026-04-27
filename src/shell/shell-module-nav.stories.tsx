import type { Meta, StoryObj } from '@storybook/react-vite';
import { SHELL_MODULE } from '../__stories__/fixtures.js';
import { ShellModuleNav } from './shell-module-nav.js';

const meta = {
  title: 'Shell/ShellModuleNav',
  component: ShellModuleNav,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ width: 280, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShellModuleNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    module: SHELL_MODULE,
    ariaLabel: 'Mail navigation',
    headerClassName: 'mb-3',
    titleClassName: 'text-sm font-semibold',
    descriptionClassName: 'text-xs text-muted-foreground',
    itemsClassName: 'flex flex-col gap-1',
    itemClassName: 'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
    activeItemClassName: 'bg-primary/10 text-primary',
    inactiveItemClassName: 'text-foreground hover:bg-muted',
    itemLabelClassName: 'flex-1',
    itemDescriptionClassName: 'text-xs text-muted-foreground',
    itemShortcutClassName: 'text-[10px] text-muted-foreground',
    isItemActive: (item) => item.to === '/inbox',
    renderLink: ({ children, className, item }) => (
      <a key={item.to} href={item.to} className={className}>
        {children}
      </a>
    ),
  },
};
