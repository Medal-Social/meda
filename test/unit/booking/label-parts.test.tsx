import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  fillLabel,
  fillLabelPieces,
  joinLabelParts,
  labelParts,
  labelText,
  renderLabel,
} from '../../../src/booking/index.js';

/** The text nodes directly under `element`, in order. */
function textNodes(element: Element): string[] {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '');
}

function nodesOf(children: React.ReactNode): string[] {
  const { container } = render(<p>{children}</p>);
  return textNodes(container.querySelector('p') as HTMLParagraphElement);
}

describe('renderLabel', () => {
  it('renders a string as ONE text node, like a template literal', () => {
    expect(nodesOf(renderLabel('Total {total} · paid at the salon', { total: '840 kr' }))).toEqual([
      'Total 840 kr · paid at the salon',
    ]);
    const total = '840 kr';
    expect(nodesOf(`Total ${total} · paid at the salon`)).toEqual([
      'Total 840 kr · paid at the salon',
    ]);
  });

  it('renders an array as one text node per element, like JSX `{a}{b}`', () => {
    const nodes = nodesOf(
      renderLabel(['Total ', '{total}', ' · ', 'paid at the salon'], { total: '840 kr' })
    );
    expect(nodes).toEqual(['Total ', '840 kr', ' · ', 'paid at the salon']);
    const total = '840 kr';
    expect(
      nodesOf(
        <>
          Total {total}
          {' · '}paid at the salon
        </>
      )
    ).toEqual(nodes);
  });

  it('fills every element with the same values, holes and text mixed', () => {
    const values = { step: 3, total: 4, label: 'Stylist and time' };
    // A hole with no break, a break with no hole, a run that ends mid-literal.
    expect(nodesOf(renderLabel(['Step {step} of {total}', ' · ', '{label}'], values))).toEqual([
      'Step 3 of 4',
      ' · ',
      'Stylist and time',
    ]);
    expect(
      nodesOf(
        renderLabel(['{label}', ' with {who}', ' – pick a time'], { label: 'Cut', who: 'Ada' })
      )
    ).toEqual(['Cut', ' with Ada', ' – pick a time']);
    expect(nodesOf(renderLabel('In and out in {minutes} min', { minutes: 30 }))).toEqual([
      'In and out in 30 min',
    ]);
  });

  it('reads the same text as fillLabel in both forms', () => {
    const values = { count: 3, total: 4, label: 'Stylist and time' };
    for (const template of [
      '{count} of {total} · {label}',
      ['{count}', ' of ', '{total}', ' · {label}'],
    ]) {
      const { container } = render(<p>{renderLabel(template, values)}</p>);
      expect(container.textContent).toBe(fillLabel(template, values));
    }
  });

  it('drops empty elements, and is null when nothing is left', () => {
    expect(nodesOf(renderLabel(['', '{a}', '{b}', ' and {unknown}'], { a: 'x', b: '' }))).toEqual([
      'x',
      ' and {unknown}',
    ]);
    expect(renderLabel(['', '{a}'], { a: '' })).toBeNull();
    expect(renderLabel('{a}', { a: '' })).toBeNull();
    expect(renderLabel([], {})).toBeNull();
    expect(renderLabel('Plain')).toBe('Plain');
  });

  it('keeps a value as text, never markup', () => {
    const { container } = render(<p>{renderLabel(['To ', '{to}'], { to: '<b>x</b>' })}</p>);
    expect(container.querySelector('b')).toBeNull();
    expect(container.textContent).toBe('To <b>x</b>');
  });
});

describe('fillLabel, labelText and fillLabelPieces', () => {
  it('flatten an array into plain text', () => {
    expect(labelText('One')).toBe('One');
    expect(labelText(['Step ', '{step}'])).toBe('Step {step}');
    expect(fillLabel(['Step ', '{step}', ' of {total}'], { step: 1, total: 4 })).toBe(
      'Step 1 of 4'
    );
    expect(fillLabel('Hi {name} {unknown}', { name: 'Ada' })).toBe('Hi Ada {unknown}');
  });

  it('fillLabelPieces lists the text nodes a label renders as', () => {
    expect(fillLabelPieces('Hi {name}', { name: 'Ada' })).toEqual(['Hi Ada']);
    expect(fillLabelPieces(['Hi ', '{name}', ''], { name: 'Ada' })).toEqual(['Hi ', 'Ada']);
    expect(fillLabelPieces('{name}', { name: '' })).toEqual([]);
  });
});

describe('labelParts', () => {
  const trigger = <button type="button">Log in</button>;

  it('keeps a string’s text runs whole around an element', () => {
    const { container } = render(
      <p>{labelParts('Have an account, {who}? {trigger} – faster', { trigger, who: 'Ada' })}</p>
    );
    const p = container.querySelector('p') as HTMLParagraphElement;
    expect(textNodes(p)).toEqual(['Have an account, Ada? ', ' – faster']);
    expect(p.querySelector('button')?.textContent).toBe('Log in');
  });

  it('keeps an array’s elements apart, splitting only around an element', () => {
    const { container } = render(
      <p>{labelParts(['Have an account? ', '{trigger} – ', 'faster'], { trigger })}</p>
    );
    const p = container.querySelector('p') as HTMLParagraphElement;
    expect(textNodes(p)).toEqual(['Have an account? ', ' – ', 'faster']);
    expect(p.childNodes).toHaveLength(4);
  });

  it('leaves an unknown placeholder as written', () => {
    expect(nodesOf(labelParts('Call {unknown}', { trigger }))).toEqual(['Call {unknown}']);
  });
});

describe('joinLabelParts', () => {
  it('joins plain parts into ONE text node by default', () => {
    expect(nodesOf(joinLabelParts(['Cut', null, '', false, 'Ada', 390], ' · '))).toEqual([
      'Cut · Ada · 390',
    ]);
  });

  it('drops a label that fills to nothing, so no separator doubles', () => {
    expect(
      nodesOf(joinLabelParts(['Cut', renderLabel('{a}', { a: '' }), [], 'Ada'], ' · '))
    ).toEqual(['Cut · Ada']);
    expect(joinLabelParts([null, ''], ' · ')).toBeNull();
  });

  it('keeps pieces as soon as one part is split', () => {
    expect(
      nodesOf(
        joinLabelParts([renderLabel(['{a}', ' for ', '{b}'], { a: 'Cut', b: 'Ola' }), 'Ada'], ' · ')
      )
    ).toEqual(['Cut', ' for ', 'Ola', ' · ', 'Ada']);
  });

  it('follows an explicit pieces option either way', () => {
    expect(nodesOf(joinLabelParts(['Cut', 'Ada', '390 kr'], ' · ', { pieces: true }))).toEqual([
      'Cut',
      ' · ',
      'Ada',
      ' · ',
      '390 kr',
    ]);
    expect(
      nodesOf(
        joinLabelParts(
          [renderLabel(['{a}', ' for ', '{b}'], { a: 'Cut', b: 'Ola' }), 'Ada'],
          ' · ',
          {
            pieces: false,
          }
        )
      )
    ).toEqual(['Cut for Ola · Ada']);
  });

  it('renders a part that holds an element in pieces even when asked for one node', () => {
    const { container } = render(
      <p>{joinLabelParts(['Cut', <b key="b">Ada</b>], ' · ', { pieces: false })}</p>
    );
    const p = container.querySelector('p') as HTMLParagraphElement;
    expect(textNodes(p)).toEqual(['Cut', ' · ']);
    expect(p.querySelector('b')?.textContent).toBe('Ada');
    expect(
      nodesOf(joinLabelParts([['Cut', <i key="i">x</i>], 'Ada'], ' · ', { pieces: false }))
    ).toEqual(['Cut', ' · ', 'Ada']);
  });
});
