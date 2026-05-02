'use client';

import type { ButtonBlockProps } from '../types.js';
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
  value: ButtonBlockProps;
  onChange: (patch: Partial<ButtonBlockProps>) => void;
}

export function ButtonPropertyEditor({ value, onChange }: Props) {
  return (
    <div data-slot="email-builder-property-button" className="flex flex-col gap-3">
      <Field label="Text" htmlFor="btn-text">
        <TextInput id="btn-text" value={value.text} onChange={(text) => onChange({ text })} />
      </Field>
      <Field label="URL" htmlFor="btn-url">
        <TextInput id="btn-url" value={value.url} onChange={(url) => onChange({ url })} />
      </Field>
      <Field label="Background color">
        <ColorInput
          value={value.backgroundColor}
          onChange={(backgroundColor) => onChange({ backgroundColor })}
        />
      </Field>
      <Field label="Text color">
        <ColorInput value={value.textColor} onChange={(textColor) => onChange({ textColor })} />
      </Field>
      <Field label="Border radius (px)">
        <NumberInput
          value={value.borderRadius}
          min={0}
          max={64}
          onChange={(borderRadius) => onChange({ borderRadius })}
        />
      </Field>
      <Field label="Size">
        <SelectInput<'sm' | 'md' | 'lg'>
          value={value.size}
          options={[
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
          ]}
          onChange={(size) => onChange({ size })}
        />
      </Field>
      <Field label="Alignment">
        <AlignmentToggle
          value={value.alignment}
          onChange={(alignment) => onChange({ alignment })}
        />
      </Field>
      <Field label="Full width">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.fullWidth}
            onChange={(e) => onChange({ fullWidth: e.target.checked })}
          />
          Stretch to container width
        </label>
      </Field>
      <Field label="Padding">
        <SpacingEditor value={value.padding} onChange={(padding) => onChange({ padding })} />
      </Field>
    </div>
  );
}
