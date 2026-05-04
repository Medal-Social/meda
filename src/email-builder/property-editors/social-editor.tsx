'use client';

import { Plus, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import type { SocialBlockProps, SocialLink } from '../types.js';
import { AlignmentToggle, Field, NumberInput, SpacingEditor, TextInput } from './_shared.js';

interface Props {
  value: SocialBlockProps;
  onChange: (patch: Partial<SocialBlockProps>) => void;
}

export function SocialPropertyEditor({ value, onChange }: Props) {
  const updateLink = (index: number, patch: Partial<SocialLink>) => {
    const links = value.links.map((l, i) => (i === index ? { ...l, ...patch } : l));
    onChange({ links });
  };
  const removeLink = (index: number) => {
    onChange({ links: value.links.filter((_, i) => i !== index) });
  };
  const addLink = () => {
    onChange({ links: [...value.links, { platform: 'twitter', url: 'https://' }] });
  };
  return (
    <div data-slot="email-builder-property-social" className="flex flex-col gap-3">
      <Field label="Links">
        <div className="flex flex-col gap-2">
          {value.links.map((link, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: row identity is positional
            <div key={i} className="flex flex-col gap-1.5 rounded-md border border-input p-2">
              <TextInput
                value={link.platform}
                placeholder="Platform"
                onChange={(platform) => updateLink(i, { platform })}
              />
              <TextInput
                value={link.url}
                placeholder="https://"
                onChange={(url) => updateLink(i, { url })}
              />
              <TextInput
                value={link.iconUrl ?? ''}
                placeholder="Icon URL (optional)"
                onChange={(iconUrl) => updateLink(i, { iconUrl })}
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className={cn(
                  'inline-flex h-8 items-center justify-center gap-1 rounded-md text-destructive text-xs hover:bg-destructive/10'
                )}
                aria-label="Remove link"
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-input border-dashed text-sm hover:bg-accent"
          >
            <Plus className="size-4" /> Add link
          </button>
        </div>
      </Field>
      <Field label="Icon size (px)">
        <NumberInput
          value={value.iconSize}
          min={12}
          max={64}
          onChange={(iconSize) => onChange({ iconSize })}
        />
      </Field>
      <Field label="Spacing (px)">
        <NumberInput
          value={value.spacing}
          min={0}
          max={48}
          onChange={(spacing) => onChange({ spacing })}
        />
      </Field>
      <Field label="Alignment">
        <AlignmentToggle
          value={value.alignment}
          onChange={(alignment) => onChange({ alignment })}
        />
      </Field>
      <Field label="Padding">
        <SpacingEditor value={value.padding} onChange={(padding) => onChange({ padding })} />
      </Field>
    </div>
  );
}
