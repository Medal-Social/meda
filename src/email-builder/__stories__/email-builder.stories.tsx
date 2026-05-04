import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { EmailBuilder } from '../email-builder.js';
import type { EmailDocument } from '../types.js';
import { columnsDocument, emptyDocument, welcomeDocument } from './fixtures.js';

function ControlledBuilder({ initial }: { initial: EmailDocument }) {
  const [doc, setDoc] = useState<EmailDocument>(initial);
  return (
    <div style={{ height: 700 }}>
      <EmailBuilder document={doc} onDocumentChange={setDoc} />
    </div>
  );
}

const meta: Meta<typeof EmailBuilder> = {
  title: 'Apps/Email/EmailBuilder',
  component: EmailBuilder,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof EmailBuilder>;

export const Welcome: Story = {
  render: () => <ControlledBuilder initial={welcomeDocument()} />,
};

export const Empty: Story = {
  render: () => <ControlledBuilder initial={emptyDocument()} />,
};

export const Columns: Story = {
  render: () => <ControlledBuilder initial={columnsDocument()} />,
};
