'use client';

import { EMAIL_FONT_OPTIONS } from '../internal/email-font-options.js';
import type { HeadingBlockProps } from '../types.js';
import {
  AlignmentToggle,
  ColorInput,
  Field,
  NumberInput,
  SelectInput,
  SpacingEditor,
  TextInput,
} from './_shared.js';

interface Props {
  value: HeadingBlockProps;
  onChange: (patch: Partial<HeadingBlockProps>) => void;
}

export function HeadingPropertyEditor({ value, onChange }: Props) {
  return (
    <div data-slot="email-builder-property-heading" className="flex flex-col gap-3">
      <Field label="Text" htmlFor="heading-text">
        <TextInput id="heading-text" value={value.text} onChange={(text) => onChange({ text })} />
      </Field>
      <Field label="Level" htmlFor="heading-level">
        <SelectInput<'1' | '2' | '3'>
          id="heading-level"
          value={String(value.level) as '1' | '2' | '3'}
          options={[
            { value: '1', label: 'H1' },
            { value: '2', label: 'H2' },
            { value: '3', label: 'H3' },
          ]}
          onChange={(v) => onChange({ level: Number(v) as 1 | 2 | 3 })}
        />
      </Field>
      <Field label="Alignment">
        <AlignmentToggle
          value={value.alignment}
          onChange={(alignment) => onChange({ alignment })}
        />
      </Field>
      <Field label="Color" htmlFor="heading-color">
        <ColorInput
          id="heading-color"
          value={value.color}
          onChange={(color) => onChange({ color })}
        />
      </Field>
      <Field label="Font family" htmlFor="heading-font">
        <SelectInput
          id="heading-font"
          value={value.fontFamily}
          options={EMAIL_FONT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          onChange={(fontFamily) => onChange({ fontFamily })}
        />
      </Field>
      <Field label="Font weight">
        <SelectInput<'400' | '500' | '600' | '700'>
          value={String(value.fontWeight) as '400' | '500' | '600' | '700'}
          options={[
            { value: '400', label: 'Regular' },
            { value: '500', label: 'Medium' },
            { value: '600', label: 'Semibold' },
            { value: '700', label: 'Bold' },
          ]}
          onChange={(v) => onChange({ fontWeight: Number(v) as 400 | 500 | 600 | 700 })}
        />
      </Field>
      <Field label="Font size (px)" htmlFor="heading-fs">
        <NumberInput
          id="heading-fs"
          value={value.fontSize}
          min={10}
          max={96}
          onChange={(fontSize) => onChange({ fontSize })}
        />
      </Field>
      <Field label="Padding">
        <SpacingEditor value={value.padding} onChange={(padding) => onChange({ padding })} />
      </Field>
    </div>
  );
}
