'use client';

import type { DividerBlockProps } from '../types.js';
import { ColorInput, Field, NumberInput, SelectInput, SpacingEditor } from './_shared.js';

interface Props {
  value: DividerBlockProps;
  onChange: (patch: Partial<DividerBlockProps>) => void;
}

export function DividerPropertyEditor({ value, onChange }: Props) {
  return (
    <div data-slot="email-builder-property-divider" className="flex flex-col gap-3">
      <Field label="Color">
        <ColorInput value={value.color} onChange={(color) => onChange({ color })} />
      </Field>
      <Field label="Thickness (px)">
        <NumberInput
          value={value.thickness}
          min={1}
          max={20}
          onChange={(thickness) => onChange({ thickness })}
        />
      </Field>
      <Field label="Width (%)">
        <NumberInput
          value={value.width}
          min={1}
          max={100}
          onChange={(width) => onChange({ width })}
        />
      </Field>
      <Field label="Style">
        <SelectInput<'solid' | 'dashed' | 'dotted'>
          value={value.style}
          options={[
            { value: 'solid', label: 'Solid' },
            { value: 'dashed', label: 'Dashed' },
            { value: 'dotted', label: 'Dotted' },
          ]}
          onChange={(style) => onChange({ style })}
        />
      </Field>
      <Field label="Padding">
        <SpacingEditor value={value.padding} onChange={(padding) => onChange({ padding })} />
      </Field>
    </div>
  );
}
