'use client';

import type { FooterBlockProps } from '../types.js';
import {
  AlignmentToggle,
  ColorInput,
  Field,
  NumberInput,
  SpacingEditor,
  TextAreaInput,
  TextInput,
} from './_shared.js';

interface Props {
  value: FooterBlockProps;
  onChange: (patch: Partial<FooterBlockProps>) => void;
}

export function FooterPropertyEditor({ value, onChange }: Props) {
  return (
    <div data-slot="email-builder-property-footer" className="flex flex-col gap-3">
      <Field label="Company name">
        <TextInput
          value={value.companyName}
          onChange={(companyName) => onChange({ companyName })}
        />
      </Field>
      <Field label="Address">
        <TextInput value={value.address} onChange={(address) => onChange({ address })} />
      </Field>
      <Field label="Custom text">
        <TextAreaInput
          value={value.customText}
          onChange={(customText) => onChange({ customText })}
        />
      </Field>
      <Field label="Unsubscribe link text">
        <TextInput
          value={value.unsubscribeText}
          onChange={(unsubscribeText) => onChange({ unsubscribeText })}
        />
      </Field>
      <Field label="Text color">
        <ColorInput value={value.textColor} onChange={(textColor) => onChange({ textColor })} />
      </Field>
      <Field label="Font size (px)">
        <NumberInput
          value={value.fontSize}
          min={8}
          max={20}
          onChange={(fontSize) => onChange({ fontSize })}
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
