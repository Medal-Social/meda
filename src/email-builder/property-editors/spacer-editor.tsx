'use client';

import type { SpacerBlockProps } from '../types.js';
import { Field, NumberInput } from './_shared.js';

interface Props {
  value: SpacerBlockProps;
  onChange: (patch: Partial<SpacerBlockProps>) => void;
}

export function SpacerPropertyEditor({ value, onChange }: Props) {
  return (
    <div data-slot="email-builder-property-spacer" className="flex flex-col gap-3">
      <Field label="Height (px)">
        <NumberInput
          value={value.height}
          min={1}
          max={400}
          onChange={(height) => onChange({ height })}
        />
      </Field>
    </div>
  );
}
