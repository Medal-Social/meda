'use client';

import type { ComponentPropsWithoutRef } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils.js';

// remark-gfm renders task-list `[ ]` / `[x]` as unlabelled disabled checkboxes,
// which fails the axe `label` rule. Override the `input` renderer to add an
// aria-label derived from the checked state — keeps the checkbox semantics
// for AT users while satisfying the contrast/label gate.
const DEFAULT_COMPONENTS: Components = {
  input: ({ type, checked, ...rest }) => {
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={checked}
          aria-label={checked ? 'task complete' : 'task incomplete'}
          {...rest}
        />
      );
    }
    return <input type={type} {...rest} />;
  },
};

export interface MarkdownViewProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: string;
  /**
   * Override or extend the default react-markdown component map.
   * Spread defaults are applied first, so caller overrides win.
   */
  components?: Components;
}

/**
 * MarkdownView wraps `react-markdown` with `remark-gfm` and `rehype-highlight`,
 * and applies a consistent prose stylesheet using meda design tokens.
 *
 * The markdown libraries are listed as **optional peer dependencies**. Install
 * them in your app if you import this component:
 *
 * ```bash
 * pnpm add react-markdown remark-gfm rehype-highlight
 * ```
 */
export function MarkdownView({ children, className, components, ...props }: MarkdownViewProps) {
  return (
    <div
      data-slot="markdown-view"
      className={cn(
        // Base prose
        'text-sm leading-relaxed text-foreground',
        // Headings
        '[&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-foreground first:[&_h1]:mt-0',
        '[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground first:[&_h2]:mt-0',
        '[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground first:[&_h3]:mt-0',
        '[&_h4]:mt-3 [&_h4]:mb-1.5 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-foreground first:[&_h4]:mt-0',
        // Paragraphs and inline
        '[&_p]:my-3 first:[&_p]:mt-0 last:[&_p]:mb-0',
        '[&_strong]:font-semibold [&_strong]:text-foreground',
        '[&_em]:italic',
        '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:no-underline',
        // Lists
        '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1',
        '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1',
        '[&_li]:text-foreground',
        // Blockquote
        '[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
        // Code
        '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:text-foreground',
        '[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-3',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        // Tables (GFM)
        '[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
        '[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold',
        '[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1',
        // Horizontal rule
        '[&_hr]:my-6 [&_hr]:border-border',
        // Images
        '[&_img]:my-3 [&_img]:rounded-md [&_img]:border [&_img]:border-border',
        className
      )}
      {...props}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{ ...DEFAULT_COMPONENTS, ...components }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
