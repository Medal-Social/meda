import { render } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { welcomeDocument } from '../../../src/email-builder/__stories__/fixtures.js';
import { EmailBuilder } from '../../../src/email-builder/email-builder.js';
import type { EmailDocument } from '../../../src/email-builder/types.js';

beforeAll(() => {
  if (!('PointerEvent' in window)) {
    // @ts-expect-error - polyfill PointerEvent for jsdom
    window.PointerEvent = MouseEvent;
  }
});

function Harness({ initial }: { initial: EmailDocument }) {
  const [doc, setDoc] = useState<EmailDocument>(initial);
  return <EmailBuilder document={doc} onDocumentChange={setDoc} />;
}

describe('EmailBuilder a11y', () => {
  it('has no axe violations on a populated document', async () => {
    const { container } = render(<Harness initial={welcomeDocument()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
