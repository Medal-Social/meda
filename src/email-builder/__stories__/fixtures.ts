import { createBlock } from '../block-registry.js';
import type { EmailDocument } from '../types.js';

export function welcomeDocument(): EmailDocument {
  return {
    blocks: [
      createBlock('heading', { text: 'Welcome to Meda', level: 1 }),
      createBlock('text', {
        content:
          'Thanks for joining Meda. Use this email to introduce your product to a new subscriber.',
      }),
      createBlock('button', { text: 'Open dashboard', url: 'https://example.com' }),
      createBlock('divider'),
      createBlock('social'),
      createBlock('footer'),
    ],
    envelope: {
      subject: 'Welcome to Meda',
      fromName: 'Meda',
      fromEmail: 'hello@example.com',
      preheader: 'Get started in less than a minute.',
    },
  };
}

export function emptyDocument(): EmailDocument {
  return { blocks: [], envelope: {} };
}

export function columnsDocument(): EmailDocument {
  const cols = createBlock('columns', { layout: '50-50' });
  cols.children = [
    [
      createBlock('heading', { text: 'Left', level: 3 }),
      createBlock('text', { content: 'Left column body.' }),
    ],
    [
      createBlock('heading', { text: 'Right', level: 3 }),
      createBlock('text', { content: 'Right column body.' }),
    ],
  ];
  return {
    blocks: [createBlock('heading', { text: 'Two-up layout' }), cols, createBlock('footer')],
    envelope: {},
  };
}
