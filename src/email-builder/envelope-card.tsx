'use client';

import { useId } from 'react';
import type { EmailEnvelope } from './types.js';

interface EnvelopeCardProps {
  envelope: EmailEnvelope | undefined;
  onChange: (next: EmailEnvelope) => void;
}

const fieldClass =
  'w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function EnvelopeCard({ envelope, onChange }: EnvelopeCardProps) {
  const e = envelope ?? {};
  const update = (patch: Partial<EmailEnvelope>) => onChange({ ...e, ...patch });
  const ids = {
    subject: useId(),
    fromName: useId(),
    fromEmail: useId(),
    replyTo: useId(),
    preheader: useId(),
  };
  return (
    <div data-slot="email-builder-envelope" className="flex flex-col gap-2 p-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={ids.subject} className="font-medium text-foreground text-xs">
          Subject
        </label>
        <input
          id={ids.subject}
          type="text"
          value={e.subject ?? ''}
          onChange={(ev) => update({ subject: ev.target.value })}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={ids.fromName} className="font-medium text-foreground text-xs">
          From name
        </label>
        <input
          id={ids.fromName}
          type="text"
          value={e.fromName ?? ''}
          onChange={(ev) => update({ fromName: ev.target.value })}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={ids.fromEmail} className="font-medium text-foreground text-xs">
          From email
        </label>
        <input
          id={ids.fromEmail}
          type="email"
          value={e.fromEmail ?? ''}
          onChange={(ev) => update({ fromEmail: ev.target.value })}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={ids.replyTo} className="font-medium text-foreground text-xs">
          Reply-to
        </label>
        <input
          id={ids.replyTo}
          type="email"
          value={e.replyTo ?? ''}
          onChange={(ev) => update({ replyTo: ev.target.value })}
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={ids.preheader} className="font-medium text-foreground text-xs">
          Preheader
        </label>
        <input
          id={ids.preheader}
          type="text"
          value={e.preheader ?? ''}
          onChange={(ev) => update({ preheader: ev.target.value })}
          className={fieldClass}
        />
      </div>
    </div>
  );
}
