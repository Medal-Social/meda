import { describe, expect, it } from 'vitest';
import { createBlock } from '../../../src/email-builder/block-registry.js';
import { renderToEmailHtml } from '../../../src/email-builder/render-to-email-html.js';
import type { EmailDocument } from '../../../src/email-builder/types.js';

describe('renderToEmailHtml', () => {
  it('renders an HTML document with the right structure for a non-empty doc', () => {
    const doc: EmailDocument = {
      blocks: [
        createBlock('heading', { text: 'Hello' }),
        createBlock('text', { content: 'World' }),
        createBlock('button', { text: 'Click me', url: 'https://example.com' }),
      ],
      envelope: { subject: 'Greeting', preheader: 'preview text' },
    };
    const html = renderToEmailHtml(doc);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Greeting</title>');
    expect(html).toContain('preview text');
    expect(html).toContain('Hello');
    expect(html).toContain('Click me');
    expect(html).toContain('https://example.com');
    expect(html).toContain('<table');
  });

  it('escapes HTML in user content', () => {
    const doc: EmailDocument = {
      blocks: [createBlock('heading', { text: '<script>alert(1)</script>' })],
    };
    const html = renderToEmailHtml(doc);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renders a stable snapshot for a small document', () => {
    const heading = createBlock('heading', { text: 'Snapshot' });
    heading.id = 'h1';
    const doc: EmailDocument = { blocks: [heading], envelope: { subject: 'snap' } };
    const html = renderToEmailHtml(doc, { contentWidth: 600 });
    expect(html).toMatchSnapshot();
  });

  it('omits image blocks with no src', () => {
    const doc: EmailDocument = { blocks: [createBlock('image', { src: '' })] };
    const html = renderToEmailHtml(doc);
    expect(html).not.toContain('<img');
  });

  it('renders columns with column children', () => {
    const cols = createBlock('columns', { layout: '50-50' });
    cols.children = [
      [createBlock('heading', { text: 'A' })],
      [createBlock('heading', { text: 'B' })],
    ];
    const html = renderToEmailHtml({ blocks: [cols] });
    expect(html).toContain('>A<');
    expect(html).toContain('>B<');
  });
});
