import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarkdownView } from './markdown-view.js';

const meta = {
  title: 'Foundations/Primitives/MarkdownView',
  component: MarkdownView,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof MarkdownView>;

export default meta;

type Story = StoryObj<typeof meta>;

const PROSE = `# Plan title

This is a short paragraph with **bold**, *italic*, and a [link](https://example.com).

## Sub-heading

A longer paragraph follows. It can include \`inline code\` and references to other items.

- Bullet one
- Bullet two with **emphasis**
- Bullet three

1. Numbered first
2. Numbered second

> A pull-quote that highlights an important detail.

\`\`\`ts
export function greet(name: string) {
  return \`hello, \${name}\`;
}
\`\`\`

---

Final paragraph after a horizontal rule.`;

const GFM = `## GFM features

| Status | Owner | ETA |
| --- | --- | --- |
| In flight | Ali | 2026-05-12 |
| Review | Sam | 2026-05-15 |
| Done | Mira | 2026-05-08 |

- [x] Draft spec
- [x] Implementation
- [ ] Ship to prod`;

export const Default: Story = {
  args: {
    children: PROSE,
  },
  render: (args) => (
    <article className="max-w-2xl rounded-md border border-border p-4">
      <MarkdownView {...args} />
    </article>
  ),
};

export const GfmTablesAndTaskList: Story = {
  args: {
    children: GFM,
  },
  render: (args) => (
    <article className="max-w-2xl rounded-md border border-border p-4">
      <MarkdownView {...args} />
    </article>
  ),
};

export const ShortNote: Story = {
  args: {
    children: 'A single paragraph rendering — no surrounding margins above or below.',
  },
  render: (args) => (
    <article className="max-w-md rounded-md border border-border p-4">
      <MarkdownView {...args} />
    </article>
  ),
};
