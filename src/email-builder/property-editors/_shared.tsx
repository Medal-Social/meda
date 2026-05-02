'use client';

import type { ChangeEvent, ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';
import { cn } from '../../lib/utils.js';
import type { Alignment, SpacingValue } from '../types.js';

/**
 * Wraps a labeled control. If `htmlFor` is set, the label uses it. Otherwise
 * the field auto-injects `aria-label` on the immediate child element so axe
 * passes without the consumer manually wiring ids everywhere.
 */
export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  const enhanced =
    !htmlFor && isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          'aria-label': label,
        })
      : children;
  return (
    <div data-slot="email-builder-field" className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-medium text-foreground text-xs">
        {label}
      </label>
      {enhanced}
    </div>
  );
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  'aria-label'?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

export function TextAreaInput({
  id,
  value,
  onChange,
  rows = 4,
  'aria-label': ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  'aria-label'?: string;
}) {
  return (
    <textarea
      id={id}
      value={value}
      rows={rows}
      aria-label={ariaLabel}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

export function NumberInput({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  'aria-label': ariaLabel,
}: {
  id?: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  'aria-label'?: string;
}) {
  return (
    <input
      id={id}
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      aria-label={ariaLabel}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const n = Number(e.target.value);
        if (!Number.isNaN(n)) onChange(n);
      }}
      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

export function ColorInput({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 cursor-pointer rounded border border-input bg-transparent"
        aria-label="Color picker"
      />
      <input
        type="text"
        value={value}
        aria-label="Color value (hex)"
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

export function SelectInput<T extends string>({
  id,
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
}: {
  id?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  'aria-label'?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function AlignmentToggle({
  value,
  onChange,
}: {
  value: Alignment;
  onChange: (next: Alignment) => void;
}) {
  const options: Alignment[] = ['left', 'center', 'right'];
  return (
    <div
      role="radiogroup"
      aria-label="Alignment"
      className="inline-flex rounded-md border border-input p-0.5"
    >
      {options.map((opt) => (
        // biome-ignore lint/a11y/useSemanticElements: visual toggle group
        <button
          key={opt}
          type="button"
          role="radio"
          aria-checked={value === opt}
          onClick={() => onChange(opt)}
          className={cn(
            'rounded px-3 py-1.5 text-xs capitalize',
            value === opt
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function SpacingEditor({
  value,
  onChange,
}: {
  value: SpacingValue;
  onChange: (next: SpacingValue) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => {
        const label = (side[0]?.toUpperCase() + side.slice(1)) as string;
        return (
          <div key={side} data-slot="email-builder-field" className="flex flex-col gap-1.5">
            <span className="font-medium text-foreground text-xs">{label}</span>
            <input
              type="number"
              value={value[side]}
              min={0}
              aria-label={`${label} padding`}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const n = Number(e.target.value);
                if (!Number.isNaN(n)) onChange({ ...value, [side]: n });
              }}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        );
      })}
    </div>
  );
}
