import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';
import {
  FacebookPreview,
  GoogleBusinessPreview,
  InstagramPreview,
  LinkedInPreview,
  ThreadsPreview,
} from '../index.js';

const opt: Array<[string, (p: object) => ReactElement]> = [
  ['facebook', (p) => <FacebookPreview {...(p as never)} />],
  ['google_business', (p) => <GoogleBusinessPreview {...(p as never)} />],
  ['instagram', (p) => <InstagramPreview {...(p as never)} />],
  ['linkedin', (p) => <LinkedInPreview {...(p as never)} />],
  ['threads', (p) => <ThreadsPreview {...(p as never)} />],
];

describe('post-preview dark mode', () => {
  for (const [name, Component] of opt) {
    it(`${name} renders inside a .dark parent without crashing and uses dark: variants`, () => {
      const { container } = render(
        <div className="dark">
          <Component {...BASE_FIXTURE} />
        </div>
      );
      // Wrapper must mount with the platform's outer slot.
      expect(container.querySelector('[data-slot="post-preview"]')).not.toBeNull();
      expect(container.innerHTML).toMatch(/dark:/);
    });
  }
});
