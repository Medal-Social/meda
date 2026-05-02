import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';
import { TwitterPreview } from '../index.js';

describe('post-preview responsive', () => {
  it('outer wrapper carries an @container class so children can use container queries', () => {
    const { container } = render(<TwitterPreview {...BASE_FIXTURE} />);
    const wrapper = container.querySelector('[data-slot="post-preview"]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toMatch(/@container/);
  });

  it('uses container-query Tailwind syntax (@[Npx]:) somewhere in the rendered tree', () => {
    const { container } = render(<TwitterPreview {...BASE_FIXTURE} />);
    const html = container.innerHTML;
    expect(html).toMatch(/@\[\d+px\]:/);
  });
});
