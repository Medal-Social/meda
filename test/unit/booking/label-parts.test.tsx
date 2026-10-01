import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fillLabel, joinLabelParts, renderLabel } from '../../../src/booking/index.js';

/** The text nodes directly under `element`, in order. */
function textNodes(element: Element): string[] {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '');
}

describe('renderLabel', () => {
  it('renders one text node per literal run and per value, like JSX `{a}{b}`', () => {
    const { container } = render(
      <p>{renderLabel('Total {total} · paid at the salon', { total: '840 kr' })}</p>
    );
    const p = container.querySelector('p') as HTMLParagraphElement;
    expect(textNodes(p)).toEqual(['Total ', '840 kr', ' · paid at the salon']);
    expect(p.childNodes).toHaveLength(3);

    // The same sentence written out in JSX lands the same nodes.
    const total = '840 kr';
    const { container: jsx } = render(<p>Total {total} · paid at the salon</p>);
    expect(textNodes(jsx.querySelector('p') as HTMLParagraphElement)).toEqual(textNodes(p));
  });

  it('reads the same text as fillLabel', () => {
    const template = '{count} of {total} · {label}';
    const values = { count: 3, total: 4, label: 'Stylist and time' };
    const { container } = render(<p>{renderLabel(template, values)}</p>);
    expect(container.textContent).toBe(fillLabel(template, values));
    expect(textNodes(container.querySelector('p') as HTMLParagraphElement)).toEqual([
      '3',
      ' of ',
      '4',
      ' · ',
      'Stylist and time',
    ]);
  });

  it('leaves an unknown placeholder as written and drops empty pieces', () => {
    const { container } = render(<p>{renderLabel('{a}{b} and {unknown}', { a: 'x', b: '' })}</p>);
    expect(textNodes(container.querySelector('p') as HTMLParagraphElement)).toEqual([
      'x',
      ' and ',
      '{unknown}',
    ]);
  });

  it('keeps a value as text, never markup', () => {
    const { container } = render(<p>{renderLabel('To {to}', { to: '<b>x</b>' })}</p>);
    expect(container.querySelector('b')).toBeNull();
    expect(container.textContent).toBe('To <b>x</b>');
  });
});

describe('joinLabelParts', () => {
  it('joins the present parts with the separator, each its own text node', () => {
    const { container } = render(
      <p>{joinLabelParts(['Cut', null, '', 'Ada', '390 kr'], ' · ')}</p>
    );
    expect(textNodes(container.querySelector('p') as HTMLParagraphElement)).toEqual([
      'Cut',
      ' · ',
      'Ada',
      ' · ',
      '390 kr',
    ]);
  });
});
