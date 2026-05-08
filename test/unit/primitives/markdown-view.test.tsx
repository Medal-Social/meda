import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownView } from '../../../src/primitives/markdown-view.js';

describe('MarkdownView', () => {
  it('renders headings, paragraphs, and lists', () => {
    render(<MarkdownView>{`# Title\n\nA paragraph.\n\n- one\n- two`}</MarkdownView>);

    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('A paragraph.')).toBeInTheDocument();
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
  });

  it('renders inline emphasis and links', () => {
    render(
      <MarkdownView>{'A **bold** and *italic* and [link](https://example.com).'}</MarkdownView>
    );

    expect(screen.getByText('bold').tagName).toBe('STRONG');
    expect(screen.getByText('italic').tagName).toBe('EM');
    const link = screen.getByRole('link', { name: 'link' });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders GFM tables via remark-gfm', () => {
    render(<MarkdownView>{`| Status | Owner |\n| --- | --- |\n| Done | Ali |`}</MarkdownView>);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Owner' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Done' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Ali' })).toBeInTheDocument();
  });

  it('renders code blocks with syntax-highlight classes via rehype-highlight', () => {
    render(<MarkdownView>{'```ts\nconst x: number = 1;\n```'}</MarkdownView>);

    const code = screen.getByText(/const/).closest('code');
    expect(code).not.toBeNull();
    // rehype-highlight always adds the `hljs` class to highlighted code blocks
    expect(code?.className).toMatch(/hljs/);
  });

  it('forwards className overrides to the wrapper', () => {
    render(
      <MarkdownView className="custom-prose" data-testid="md">
        plain text
      </MarkdownView>
    );

    expect(screen.getByTestId('md')).toHaveClass('custom-prose');
    expect(screen.getByTestId('md')).toHaveAttribute('data-slot', 'markdown-view');
  });
});
