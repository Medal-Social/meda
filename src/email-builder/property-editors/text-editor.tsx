'use client';

import type { ReactNode } from 'react';
import { EMAIL_FONT_OPTIONS } from '../internal/email-font-options.js';
import type { TextBlockProps } from '../types.js';
import {
  AlignmentToggle,
  ColorInput,
  Field,
  NumberInput,
  SelectInput,
  SpacingEditor,
  TextAreaInput,
} from './_shared.js';

interface Props {
  value: TextBlockProps;
  onChange: (patch: Partial<TextBlockProps>) => void;
  /** Optional rich-text editor slot (Lexical, etc.). Defaults to a textarea. */
  renderEditor?: (ctx: { value: string; onChange: (next: string) => void }) => ReactNode;
}

export function TextPropertyEditor({ value, onChange, renderEditor }: Props) {
  const onContent = (content: string) => onChange({ content });
  return (
    <div data-slot="email-builder-property-text" className="flex flex-col gap-3">
      <Field label="Content" htmlFor="text-content">
        {renderEditor ? (
          renderEditor({ value: value.content, onChange: onContent })
        ) : (
          <TextAreaInput id="text-content" value={value.content} onChange={onContent} rows={5} />
        )}
      </Field>
      <Field label="Alignment">
        <AlignmentToggle
          value={value.alignment}
          onChange={(alignment) => onChange({ alignment })}
        />
      </Field>
      <Field label="Color" htmlFor="text-color">
        <ColorInput id="text-color" value={value.color} onChange={(color) => onChange({ color })} />
      </Field>
      <Field label="Font family">
        <SelectInput
          value={value.fontFamily}
          options={EMAIL_FONT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(fontFamily) => onChange({ fontFamily })}
        />
      </Field>
      <Field label="Font size (px)">
        <NumberInput
          value={value.fontSize}
          min={10}
          max={48}
          onChange={(fontSize) => onChange({ fontSize })}
        />
      </Field>
      <Field label="Padding">
        <SpacingEditor value={value.padding} onChange={(padding) => onChange({ padding })} />
      </Field>
    </div>
  );
}
