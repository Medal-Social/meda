import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import type { ShellAuthTheme } from './shell-auth-frame.js';
import { ShellAuthFrame, ShellAuthThemeToggle } from './shell-auth-frame.js';

function DemoSignInForm() {
  return (
    <form aria-label="Sign in form" className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold leading-tight text-foreground">Welcome back</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sign in to continue to your workspace.
        </p>
      </div>
      <label className="block text-sm font-medium text-foreground">
        Email
        <input
          className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25"
          placeholder="you@company.com"
          type="email"
        />
      </label>
      <label className="block text-sm font-medium text-foreground">
        Password
        <input
          className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25"
          placeholder="********"
          type="password"
        />
      </label>
      <button
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        type="button"
      >
        Sign in
      </button>
      <p className="text-center text-sm text-muted-foreground">
        New to Medal?{' '}
        <a className="font-semibold text-primary hover:text-foreground" href="#create-account">
          Create account
        </a>
      </p>
    </form>
  );
}

function DemoCreateAccountForm() {
  return (
    <form aria-label="Create account form" className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold leading-tight text-foreground">Create workspace</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Start from the same split shell with signup copy.
        </p>
      </div>
      <label className="block text-sm font-medium text-foreground">
        Work email
        <input
          className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25"
          placeholder="you@company.com"
          type="email"
        />
      </label>
      <button
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        type="button"
      >
        Continue
      </button>
    </form>
  );
}

function AuthStory(args: ComponentProps<typeof ShellAuthFrame>) {
  const [theme, setTheme] = useState<ShellAuthTheme>('dark');

  return (
    <div data-theme={theme}>
      <ShellAuthFrame
        {...args}
        actions={<ShellAuthThemeToggle value={theme} onValueChange={setTheme} />}
      />
    </div>
  );
}

const meta = {
  title: 'Shell v2/Auth',
  component: ShellAuthFrame,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    brandName: 'Medal',
    eyebrow: 'Customer shell',
    title: 'Run every customer workflow from one shell',
    description:
      'A branded split auth frame for login, signup, invite acceptance, and gated entry points.',
    children: <DemoSignInForm />,
  },
} satisfies Meta<typeof ShellAuthFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SplitLogin: Story = {
  render: AuthStory,
};

export const CreateAccount: Story = {
  args: {
    title: 'Start with the full operating shell',
    description:
      'Use the same auth frame when the entry point needs more brand presence than a compact dialog.',
    children: <DemoCreateAccountForm />,
  },
  render: AuthStory,
};
