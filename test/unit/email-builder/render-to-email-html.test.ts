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

  it('renders without a preheader when preheader is empty', () => {
    const doc: EmailDocument = { blocks: [], envelope: { subject: 'No preheader', preheader: '' } };
    const html = renderToEmailHtml(doc);
    expect(html).not.toContain('mso-hide:all');
    expect(html).toContain('<title>No preheader</title>');
  });

  it('renders when envelope is undefined', () => {
    const doc: EmailDocument = { blocks: [] };
    const html = renderToEmailHtml(doc);
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('applies brand options', () => {
    const doc: EmailDocument = {
      blocks: [createBlock('heading', { text: 'Branded' })],
    };
    const html = renderToEmailHtml(doc, {
      brand: { fontHeading: 'Georgia', brandColor: '#ff0000' },
      backgroundColor: '#eeeeee',
      contentBackgroundColor: '#ffffff',
    });
    expect(html).toContain('#eeeeee');
  });

  it('renders a social block with icon URLs', () => {
    const social = createBlock('social');
    social.props = {
      ...social.props,
      links: [
        {
          platform: 'Twitter',
          url: 'https://twitter.com',
          iconUrl: 'https://img.example.com/tw.png',
        },
        { platform: 'Facebook', url: 'https://facebook.com' },
        { platform: 'Empty', url: '' },
      ],
      iconSize: 32,
      spacing: 8,
    };
    const html = renderToEmailHtml({ blocks: [social] });
    expect(html).toContain('https://twitter.com');
    expect(html).toContain('https://img.example.com/tw.png');
    expect(html).toContain('Facebook');
    // Empty url link should be filtered out
    expect(html).not.toContain('Empty');
  });

  it('renders social block returning empty string when all links have no url', () => {
    const social = createBlock('social');
    social.props = {
      ...social.props,
      links: [{ platform: 'Twitter', url: '' }],
    };
    const html = renderToEmailHtml({ blocks: [social] });
    // renderSocial returns '' so no Twitter text
    expect(html).not.toContain('Twitter');
  });

  it('renders a footer block with all fields', () => {
    const footer = createBlock('footer');
    footer.props = {
      ...footer.props,
      companyName: 'Acme Corp',
      address: '123 Main St',
      customText: 'Custom text here',
      unsubscribeText: 'Unsubscribe',
      textColor: '#888888',
      fontSize: 12,
    };
    const html = renderToEmailHtml({ blocks: [footer] });
    expect(html).toContain('Acme Corp');
    expect(html).toContain('123 Main St');
    expect(html).toContain('Custom text here');
    expect(html).toContain('Unsubscribe');
    expect(html).toContain('{{unsubscribeUrl}}');
  });

  it('renders a footer block with no optional fields', () => {
    const footer = createBlock('footer');
    footer.props = {
      ...footer.props,
      companyName: '',
      address: '',
      customText: '',
      unsubscribeText: '',
    };
    const html = renderToEmailHtml({ blocks: [footer] });
    // No unsubscribe link when unsubscribeText is empty
    expect(html).not.toContain('{{unsubscribeUrl}}');
  });

  it('renders an image block with a link URL', () => {
    const image = createBlock('image');
    image.props = {
      ...image.props,
      src: 'https://img.example.com/photo.jpg',
      alt: 'A photo',
      linkUrl: 'https://example.com',
      width: 600,
      height: 'auto',
    };
    const html = renderToEmailHtml({ blocks: [image] });
    expect(html).toContain('<a href="https://example.com">');
    expect(html).toContain('<img src="https://img.example.com/photo.jpg"');
  });

  it('renders an image block with a numeric height', () => {
    const image = createBlock('image');
    image.props = {
      ...image.props,
      src: 'https://img.example.com/banner.jpg',
      alt: 'Banner',
      linkUrl: '',
      width: 600,
      height: 200,
    };
    const html = renderToEmailHtml({ blocks: [image] });
    expect(html).toContain('height="200"');
  });

  it('renders a button with fullWidth', () => {
    const button = createBlock('button');
    button.props = { ...button.props, fullWidth: true, size: 'lg' };
    const html = renderToEmailHtml({ blocks: [button] });
    expect(html).toContain('width="100%"');
  });

  it('renders a button using brand color when backgroundColor is empty', () => {
    const button = createBlock('button');
    button.props = { ...button.props, backgroundColor: '', size: 'sm' };
    const html = renderToEmailHtml({ blocks: [button] }, { brand: { brandColor: '#123456' } });
    expect(html).toContain('#123456');
  });

  it('renders a text block with multi-paragraph content', () => {
    const text = createBlock('text');
    text.props = { ...text.props, content: 'Line 1\n\nLine 2' };
    const html = renderToEmailHtml({ blocks: [text] });
    expect(html).toContain('<p style="margin: 0 0 12px 0;">Line 1</p>');
    expect(html).toContain('<p style="margin: 0 0 12px 0;">Line 2</p>');
  });

  it('renders a heading with a font family from props', () => {
    const heading = createBlock('heading');
    heading.props = { ...heading.props, fontFamily: 'Arial' };
    const html = renderToEmailHtml({ blocks: [heading] });
    expect(html).toContain('font-family: Arial');
  });

  it('renders a divider block', () => {
    const divider = createBlock('divider');
    const html = renderToEmailHtml({ blocks: [divider] });
    expect(html).toContain('border-top:');
  });

  it('renders a spacer block', () => {
    const spacer = createBlock('spacer');
    spacer.props = { ...spacer.props, height: 40 };
    const html = renderToEmailHtml({ blocks: [spacer] });
    expect(html).toContain('height="40"');
  });

  it('returns empty string for unknown block kind via renderBlock default', () => {
    // Force an unknown kind through the union escape hatch
    const badBlock = { id: 'x', kind: 'unknown' as 'heading', props: {} as never };
    const html = renderToEmailHtml({ blocks: [badBlock] });
    // The unknown block renders nothing but the outer shell still renders
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('renders columns without gap on last column', () => {
    const cols = createBlock('columns', { layout: '33-33-33', gap: 16 });
    cols.children = [
      [createBlock('heading', { text: 'Col1' })],
      [createBlock('heading', { text: 'Col2' })],
      [createBlock('heading', { text: 'Col3' })],
    ];
    const html = renderToEmailHtml({ blocks: [cols] });
    expect(html).toContain('Col1');
    expect(html).toContain('Col3');
  });

  it('renders columns with transparent background', () => {
    const cols = createBlock('columns', { backgroundColor: 'transparent' });
    const html = renderToEmailHtml({ blocks: [cols] });
    // transparent => no background-color style in td
    expect(html).not.toContain('background-color: transparent');
  });

  it('renders a button with default fallback color (no backgroundColor and no brandColor)', () => {
    const button = createBlock('button');
    button.props = { ...button.props, backgroundColor: '', size: 'md' };
    // No brand.brandColor — falls back to #4F46E5
    const html = renderToEmailHtml({ blocks: [button] }, { brand: {} });
    expect(html).toContain('#4F46E5');
  });

  it('renders a text block with a fontFamily from brand.fontBody', () => {
    const text = createBlock('text');
    text.props = { ...text.props, fontFamily: '' };
    const html = renderToEmailHtml({ blocks: [text] }, { brand: { fontBody: 'Georgia' } });
    expect(html).toContain('font-family: Georgia');
  });

  it('renders a text block with its own fontFamily (overrides brand)', () => {
    const text = createBlock('text');
    text.props = { ...text.props, fontFamily: 'Arial', content: 'Test' };
    const html = renderToEmailHtml({ blocks: [text] });
    expect(html).toContain('font-family: Arial');
  });

  it('renders columns with fewer children than widths (missing columns fall back to empty)', () => {
    const cols = createBlock('columns', { layout: '33-33-33', gap: 8 });
    // Only one child column provided — others default to []
    cols.children = [[createBlock('heading', { text: 'Only first' })]];
    const html = renderToEmailHtml({ blocks: [cols] });
    expect(html).toContain('Only first');
  });

  it('renders a heading with fontFamily from brand.fontHeading when heading fontFamily is empty', () => {
    const heading = createBlock('heading');
    heading.props = { ...heading.props, fontFamily: '' };
    const html = renderToEmailHtml({ blocks: [heading] }, { brand: { fontHeading: 'Palatino' } });
    expect(html).toContain('font-family: Palatino');
  });

  it('renders columns with no children property (children defaults to [])', () => {
    const cols = createBlock('columns', { layout: '50-50' });
    // Deliberately omit children — should default to empty columns
    delete (cols as { children?: unknown[] }).children;
    const html = renderToEmailHtml({ blocks: [cols] });
    expect(html).toContain('<table');
  });

  it('renders columns with a non-transparent background color', () => {
    const cols = createBlock('columns', { backgroundColor: '#eeeeee' });
    const html = renderToEmailHtml({ blocks: [cols] });
    expect(html).toContain('background-color: #eeeeee');
  });
});
