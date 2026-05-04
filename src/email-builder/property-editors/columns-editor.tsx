'use client';

import type { ColumnLayout, ColumnsBlockProps } from '../types.js';
import { ColorInput, Field, NumberInput, SelectInput, SpacingEditor } from './_shared.js';

interface Props {
  value: ColumnsBlockProps;
  onChange: (patch: Partial<ColumnsBlockProps>) => void;
}

export function ColumnsPropertyEditor({ value, onChange }: Props) {
  return (
    <div data-slot="email-builder-property-columns" className="flex flex-col gap-3">
      <Field label="Layout">
        <SelectInput<ColumnLayout>
          value={value.layout}
          options={[
            { value: '50-50', label: '2 columns (50/50)' },
            { value: '33-67', label: '2 columns (33/67)' },
            { value: '67-33', label: '2 columns (67/33)' },
            { value: '33-33-33', label: '3 columns' },
          ]}
          onChange={(layout) => onChange({ layout })}
        />
      </Field>
      <Field label="Vertical alignment">
        <SelectInput<'top' | 'middle' | 'bottom'>
          value={value.verticalAlignment}
          options={[
            { value: 'top', label: 'Top' },
            { value: 'middle', label: 'Middle' },
            { value: 'bottom', label: 'Bottom' },
          ]}
          onChange={(verticalAlignment) => onChange({ verticalAlignment })}
        />
      </Field>
      <Field label="Background color">
        <ColorInput
          value={value.backgroundColor === 'transparent' ? '#ffffff' : value.backgroundColor}
          onChange={(backgroundColor) => onChange({ backgroundColor })}
        />
      </Field>
      <Field label="Gap (px)">
        <NumberInput value={value.gap} min={0} max={64} onChange={(gap) => onChange({ gap })} />
      </Field>
      <Field label="Mobile stacking">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.mobileStacking}
            onChange={(e) => onChange({ mobileStacking: e.target.checked })}
          />
          Stack columns vertically on mobile
        </label>
      </Field>
      <Field label="Padding">
        <SpacingEditor value={value.padding} onChange={(padding) => onChange({ padding })} />
      </Field>
    </div>
  );
}
