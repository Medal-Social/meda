'use client';

import type { ComponentProps } from 'react';
import { cn } from '../lib/utils.js';

export type FieldOrientation = 'vertical' | 'horizontal';

export interface FieldProps extends ComponentProps<'div'> {
  /**
   * `vertical` (default) stacks label, control, description and error.
   * `horizontal` puts a checkbox/switch beside its label.
   */
  orientation?: FieldOrientation;
  /**
   * Dims the label. A disabled control inside the field does this on its
   * own (`:has(:disabled)`); the prop is for fields whose control cannot be.
   */
  disabled?: boolean;
}

export type FieldLabelProps = ComponentProps<'label'>;
export type FieldDescriptionProps = ComponentProps<'p'>;
export type FieldSetProps = ComponentProps<'fieldset'>;
export type FieldLegendProps = ComponentProps<'legend'>;

export interface FieldErrorProps extends ComponentProps<'p'> {
  /**
   * Several messages at once (e.g. from a schema validator). Each renders as
   * its own `<p data-slot="field-error">` inside one wrapper that takes `id`
   * and the other props; duplicates are shown once.
   */
  errors?: readonly string[];
}

const ORIENTATION_CLASSES: Record<FieldOrientation, string> = {
  vertical: '',
  horizontal: 'grid-cols-[auto_1fr] items-center',
};

function FieldRoot({ orientation = 'vertical', disabled, className, ...props }: FieldProps) {
  return (
    <div
      data-slot="field"
      data-orientation={orientation}
      data-disabled={disabled ? 'true' : undefined}
      className={cn('group/field grid gap-2', ORIENTATION_CLASSES[orientation], className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the caller wires htmlFor (or nests the control)
    <label
      data-slot="field-label"
      className={cn(
        'flex select-none items-center gap-2 text-sm font-medium leading-none group-has-disabled/field:cursor-not-allowed group-has-disabled/field:opacity-50 group-data-[disabled=true]/field:pointer-events-none group-data-[disabled=true]/field:opacity-50',
        className
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <p
      data-slot="field-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function FieldError({ className, children, errors, ...props }: FieldErrorProps) {
  const unique = errors ? Array.from(new Set(errors)) : [];
  if (unique.length > 0) {
    // One element owns the id (and every other prop), so `aria-describedby`
    // pointing at it reads out all of the messages.
    const { id, ...rest } = props;
    return (
      <div id={id} data-slot="field-errors" className="flex flex-col gap-1" {...rest}>
        {unique.map((error) => (
          <p
            key={error}
            data-slot="field-error"
            className={cn('text-sm text-destructive', className)}
          >
            {error}
          </p>
        ))}
      </div>
    );
  }
  if (children == null || children === false) return null;
  return (
    <p data-slot="field-error" className={cn('text-sm text-destructive', className)} {...props}>
      {children}
    </p>
  );
}

function FieldSet({ className, ...props }: FieldSetProps) {
  return <fieldset data-slot="field-set" className={cn('grid gap-6', className)} {...props} />;
}

function FieldLegend({ className, ...props }: FieldLegendProps) {
  return (
    <legend
      data-slot="field-legend"
      className={cn('text-base font-medium leading-none text-foreground', className)}
      {...props}
    />
  );
}

/**
 * Form field layout: `Field` groups a control with `Field.Label`,
 * `Field.Description` and `Field.Error`. It owns no state and no ids — wire
 * `htmlFor` / `aria-describedby` yourself, so the markup stays obvious and
 * works with any form library. `Field.Set` + `Field.Legend` group related
 * fields (radio sets, consent boxes).
 */
export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Description: FieldDescription,
  Error: FieldError,
  Set: FieldSet,
  Legend: FieldLegend,
});
