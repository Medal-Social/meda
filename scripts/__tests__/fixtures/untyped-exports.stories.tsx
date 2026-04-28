import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = { title: 'Untyped', component: () => null } satisfies Meta<unknown>;
export default meta;
type Story = StoryObj<typeof meta>;
// Untyped CSF: uses `=` instead of `: Story`. The lint must still see these
// or banned names slip past the gate.
export const DarkTheme = {} as Story;
export const Default = {} as Story;
