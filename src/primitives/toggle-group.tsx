'use client';

import {
  type ComponentProps,
  createContext,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../lib/utils.js';

export type ToggleGroupSize = 'sm' | 'md';
export type ToggleGroupOrientation = 'horizontal' | 'vertical';

interface ToggleGroupBaseProps
  extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange' | 'role'> {
  size?: ToggleGroupSize;
  orientation?: ToggleGroupOrientation;
  /** Disables every item. */
  disabled?: boolean;
}

export interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  /**
   * `single` (default) behaves like a radio group: exactly one chip can be
   * chosen, arrow keys move focus AND selection (WAI-ARIA radio pattern), and
   * the chosen chip cannot be un-chosen by clicking it again.
   */
  type?: 'single';
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
}

export interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  /**
   * `multiple` is a group of independent toggle buttons (`aria-pressed`);
   * arrow keys only move focus, Space / Enter toggles.
   */
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

export interface ToggleGroupItemProps extends Omit<ComponentProps<'button'>, 'value'> {
  value: string;
}

interface ToggleGroupContextValue {
  type: 'single' | 'multiple';
  size: ToggleGroupSize;
  orientation: ToggleGroupOrientation;
  disabled: boolean;
  selected: readonly string[];
  /** undefined until the group has measured its items after mount. */
  tabbable: string | null | undefined;
  toggle: (value: string) => void;
  focusItem: (value: string) => void;
  onItemKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroupContext() {
  const context = useContext(ToggleGroupContext);
  if (!context) throw new Error('ToggleGroup.Item must be rendered inside <ToggleGroup>.');
  return context;
}

const ITEM_SELECTOR = '[data-slot="toggle-group-item"]';

const NEXT_KEYS: Record<ToggleGroupOrientation, readonly string[]> = {
  horizontal: ['ArrowRight', 'ArrowDown'],
  vertical: ['ArrowDown', 'ArrowRight'],
};
const PREV_KEYS: Record<ToggleGroupOrientation, readonly string[]> = {
  horizontal: ['ArrowLeft', 'ArrowUp'],
  vertical: ['ArrowUp', 'ArrowLeft'],
};

const SIZE_CLASSES: Record<ToggleGroupSize, string> = {
  sm: 'h-8 px-3 text-xs [&_svg]:size-3.5',
  md: 'h-10 px-4 text-sm [&_svg]:size-4',
};

function toArray(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value == null ? [] : [value];
}

function ToggleGroupRoot(props: ToggleGroupProps) {
  const {
    type = 'single',
    value,
    defaultValue,
    onValueChange,
    size = 'md',
    orientation = 'horizontal',
    disabled = false,
    className,
    children,
    ...rest
  } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [uncontrolled, setUncontrolled] = useState<string[]>(() => toArray(defaultValue));
  const isControlled = value !== undefined;
  const selected = isControlled ? toArray(value) : uncontrolled;

  const [focused, setFocused] = useState<string | null>(null);
  const [tabbable, setTabbable] = useState<string | null | undefined>(undefined);

  const enabledItems = useCallback(
    () =>
      Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>(ITEM_SELECTOR) ?? []).filter(
        (item) => !item.disabled
      ),
    []
  );

  // Roving tabindex: exactly one enabled item is in the tab order — the last
  // focused one, else the (first) selected one, else the first enabled one.
  // Measured from the DOM after each render so nested / conditional items
  // just work; the state update bails out when nothing changed.
  useLayoutEffect(() => {
    const values = enabledItems().map((item) => item.dataset.value ?? '');
    const next = [focused, ...selected].find((v) => v != null && values.includes(v)) ?? values[0];
    setTabbable(next ?? null);
  });

  const commit = (next: string[]) => {
    if (!isControlled) setUncontrolled(next);
    if (type === 'multiple') {
      (onValueChange as ToggleGroupMultipleProps['onValueChange'])?.(next);
    } else if (next[0] !== undefined) {
      (onValueChange as ToggleGroupSingleProps['onValueChange'])?.(next[0]);
    }
  };

  const toggle = (itemValue: string) => {
    if (type === 'multiple') {
      commit(
        selected.includes(itemValue)
          ? selected.filter((v) => v !== itemValue)
          : [...selected, itemValue]
      );
      return;
    }
    // Radio semantics: re-choosing the current value is a no-op.
    if (selected[0] !== itemValue) commit([itemValue]);
  };

  const onItemKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const items = enabledItems();
    const index = items.indexOf(event.currentTarget);
    if (index === -1 || items.length === 0) return;

    let target: HTMLButtonElement | undefined;
    if (NEXT_KEYS[orientation].includes(event.key)) target = items[(index + 1) % items.length];
    else if (PREV_KEYS[orientation].includes(event.key))
      target = items[(index - 1 + items.length) % items.length];
    else if (event.key === 'Home') target = items[0];
    else if (event.key === 'End') target = items[items.length - 1];
    if (!target) return;

    event.preventDefault();
    target.focus();
    const targetValue = target.dataset.value ?? '';
    setFocused(targetValue);
    if (type === 'single') toggle(targetValue);
  };

  // `aria-orientation` is only defined for radiogroup, not for group.
  const groupSemantics =
    type === 'single'
      ? ({
          role: 'radiogroup',
          'aria-orientation': orientation,
          'aria-disabled': disabled || undefined,
        } as const)
      : ({ role: 'group', 'aria-disabled': disabled || undefined } as const);

  const context: ToggleGroupContextValue = {
    type,
    size,
    orientation,
    disabled,
    selected,
    tabbable,
    toggle,
    focusItem: setFocused,
    onItemKeyDown,
  };

  return (
    <ToggleGroupContext.Provider value={context}>
      <div
        ref={rootRef}
        {...groupSemantics}
        data-slot="toggle-group"
        data-type={type}
        data-orientation={orientation}
        className={cn(
          'flex flex-wrap gap-2',
          orientation === 'vertical' && 'flex-col items-stretch',
          className
        )}
        {...rest}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

function ToggleGroupItem({
  value,
  disabled: itemDisabled,
  className,
  children,
  onClick,
  onKeyDown,
  onFocus,
  ...props
}: ToggleGroupItemProps) {
  const group = useToggleGroupContext();
  const isOn = group.selected.includes(value);
  const disabled = group.disabled || Boolean(itemDisabled);

  // Before the group has measured (SSR / first paint) keep the selected item
  // — or every item when nothing is selected — reachable by Tab.
  const inTabOrder =
    group.tabbable === undefined ? group.selected.length === 0 || isOn : group.tabbable === value;

  const semantics =
    group.type === 'single'
      ? ({ role: 'radio', 'aria-checked': isOn } as const)
      : ({ 'aria-pressed': isOn } as const);

  return (
    <button
      type="button"
      data-slot="toggle-group-item"
      data-value={value}
      data-state={isOn ? 'on' : 'off'}
      disabled={disabled}
      tabIndex={inTabOrder ? 0 : -1}
      {...semantics}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        isOn
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
        SIZE_CLASSES[group.size],
        className
      )}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        group.focusItem(value);
        group.toggle(value);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) group.onItemKeyDown(event);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        group.focusItem(value);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Chip-style single- or multi-select. `type="single"` (default) is a
 * `radiogroup`; `type="multiple"` is a `group` of `aria-pressed` toggles.
 * Both use a roving tabindex (one Tab stop) with Arrow / Home / End keys.
 * Give the group an accessible name via `aria-label` or `aria-labelledby`.
 */
export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Item: ToggleGroupItem,
});
