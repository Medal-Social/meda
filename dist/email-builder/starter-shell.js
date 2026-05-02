import { createBlock } from './block-registry.js';
/** A simple non-empty starter document used by stories and the empty-state CTA. */
export function createStarterDocument() {
    return {
        blocks: [
            createBlock('heading', { text: 'Welcome to your email' }),
            createBlock('text', {
                content: 'Use the palette on the left to add blocks. Click a block to edit its properties.',
            }),
            createBlock('button', { text: 'Get started', url: 'https://example.com' }),
            createBlock('divider'),
            createBlock('footer'),
        ],
        envelope: {
            subject: 'Hello from Meda',
            fromName: 'Meda',
            fromEmail: 'hello@example.com',
            preheader: 'A first look at the Meda email builder.',
        },
    };
}
