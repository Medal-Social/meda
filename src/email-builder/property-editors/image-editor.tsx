'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils.js';
import type { EmailBuilderProps, ImageBlockProps } from '../types.js';
import { AlignmentToggle, Field, NumberInput, SpacingEditor, TextInput } from './_shared.js';

interface Props {
  value: ImageBlockProps;
  onChange: (patch: Partial<ImageBlockProps>) => void;
  renderMediaPicker?: EmailBuilderProps['renderMediaPicker'];
}

export function ImagePropertyEditor({ value, onChange, renderMediaPicker }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div data-slot="email-builder-property-image" className="flex flex-col gap-3">
      <Field label="Source URL" htmlFor="img-src">
        <TextInput id="img-src" value={value.src} onChange={(src) => onChange({ src })} />
      </Field>
      {renderMediaPicker ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={cn(
            'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 font-medium text-sm',
            'hover:bg-accent hover:text-accent-foreground'
          )}
        >
          Pick from media library
        </button>
      ) : null}
      {pickerOpen && renderMediaPicker
        ? renderMediaPicker({
            onPick: (url) => {
              onChange({ src: url });
              setPickerOpen(false);
            },
            onCancel: () => setPickerOpen(false),
          })
        : null}
      <Field label="Alt text" htmlFor="img-alt">
        <TextInput id="img-alt" value={value.alt} onChange={(alt) => onChange({ alt })} />
      </Field>
      <Field label="Link URL" htmlFor="img-link">
        <TextInput
          id="img-link"
          value={value.linkUrl}
          onChange={(linkUrl) => onChange({ linkUrl })}
        />
      </Field>
      <Field label="Width (px)">
        <NumberInput
          value={value.width}
          min={20}
          max={1200}
          onChange={(width) => onChange({ width })}
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
