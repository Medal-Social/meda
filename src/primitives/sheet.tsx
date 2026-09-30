'use client';

import {
  type ButtonHTMLAttributes,
  type ComponentProps,
  createContext,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { type RenderElement, renderElement } from '../lib/render-element.js';
import { cn } from '../lib/utils.js';

export type SheetSide = 'responsive' | 'bottom';

export interface SheetProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called with the requested state (trigger, close button, Escape, backdrop). */
  onOpenChange?: (open: boolean) => void;
  /**
   * `false` ignores every close request (Escape, backdrop, `Sheet.Close`) —
   * use it while a submit is in flight so the sheet cannot vanish under the
   * user. Default `true`.
   */
  dismissible?: boolean;
  children?: ReactNode;
}

export interface SheetTriggerProps extends ComponentProps<'button'> {
  /** Render as another element, merging the trigger's props onto it. */
  render?: RenderElement<ButtonHTMLAttributes<HTMLElement>>;
}

export interface SheetContentProps extends Omit<ComponentProps<'dialog'>, 'open'> {
  /**
   * `responsive` (default): a bottom sheet on phones, a centred dialog from
   * `md` up. `bottom` keeps the bottom sheet at every width.
   */
  side?: SheetSide;
}

export interface SheetCloseProps extends ComponentProps<'button'> {
  /** Render as another element (e.g. a meda `Button`), merging close behaviour onto it. */
  render?: RenderElement<ButtonHTMLAttributes<HTMLElement>>;
}

interface SheetContextValue {
  open: boolean;
  requestOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  registerTitle: (present: boolean) => void;
  registerDescription: (present: boolean) => void;
  triggerRef: { current: HTMLElement | null };
}

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext(part: string) {
  const context = useContext(SheetContext);
  if (!context) throw new Error(`Sheet.${part} must be rendered inside <Sheet>.`);
  return context;
}

const FOCUSABLE =
  'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

function SheetRoot({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  dismissible = true,
  children,
}: SheetProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolled;
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const requestOpenChange = useCallback(
    (next: boolean) => {
      if (!next && !dismissible) return;
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [dismissible, isControlled, onOpenChange]
  );

  return (
    <SheetContext.Provider
      value={{
        open,
        requestOpenChange,
        titleId,
        descriptionId,
        hasTitle,
        hasDescription,
        registerTitle: setHasTitle,
        registerDescription: setHasDescription,
        triggerRef,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({ render, onClick, className, children, ...props }: SheetTriggerProps) {
  const sheet = useSheetContext('Trigger');
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    sheet.triggerRef.current = event.currentTarget;
    sheet.requestOpenChange(true);
  };
  const triggerProps = {
    ...props,
    'data-slot': 'sheet-trigger',
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': sheet.open,
    'data-state': sheet.open ? 'open' : 'closed',
    className,
    onClick: handleClick,
  };
  if (render) {
    // Children given to the trigger win; otherwise the rendered element keeps its own.
    return renderElement(render, {
      ...triggerProps,
      ...(children == null ? {} : { children }),
    } as ButtonHTMLAttributes<HTMLElement>);
  }
  return (
    <button type="button" {...triggerProps}>
      {children}
    </button>
  );
}

const SIDE_CLASSES: Record<SheetSide, string> = {
  responsive: cn(
    'inset-x-0 top-auto bottom-0 w-full max-w-none rounded-t-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]',
    'md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:pb-6'
  ),
  bottom:
    'inset-x-0 top-auto bottom-0 w-full max-w-none rounded-t-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]',
};

function SheetContent({
  side = 'responsive',
  className,
  children,
  onCancel,
  onClick,
  onKeyDown,
  ...props
}: SheetContentProps) {
  const sheet = useSheetContext('Content');
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const { open } = sheet;

  // Open with showModal(): the browser puts the sheet in the top layer, makes
  // everything behind it inert and traps Tab inside. Environments without it
  // (jsdom, very old engines) fall back to the `open` attribute and a manual
  // first-focus, so the sheet still renders and is still operable.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (dialog.hasAttribute('open')) return;
      const active = document.activeElement;
      restoreRef.current =
        sheet.triggerRef.current ?? (active instanceof HTMLElement ? active : null);
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
        // React focuses `autoFocus` children itself (it never renders the
        // attribute), so only pick a target when focus is still outside.
        if (dialog.contains(document.activeElement)) return;
        const target =
          dialog.querySelector<HTMLElement>('[autofocus]') ??
          dialog.querySelector<HTMLElement>(FOCUSABLE);
        target?.focus();
      }
      return;
    }
    if (!dialog.hasAttribute('open')) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    const restore = restoreRef.current;
    restoreRef.current = null;
    if (restore?.isConnected) restore.focus();
  }, [open, sheet.triggerRef]);

  // The top layer does not stop the page behind from scrolling on touch
  // devices, so hold the root's overflow while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  // Unmounting while open (route change) must still hand focus back.
  useEffect(
    () => () => {
      const restore = restoreRef.current;
      if (restore?.isConnected) restore.focus();
    },
    []
  );

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    // A platform close request (Android back, Escape where keydown did not
    // run): keep React in charge of the open state.
    onCancel?.(event);
    const consumerPrevented = event.defaultPrevented;
    event.preventDefault();
    if (!consumerPrevented) sheet.requestOpenChange(false);
  };

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    // A click on the ::backdrop targets the <dialog> itself (the content
    // lives in an inner wrapper), so it only closes on a real outside click.
    if (event.target === event.currentTarget) sheet.requestOpenChange(false);
  };

  return (
    <dialog
      ref={dialogRef}
      data-slot="sheet"
      data-side={side}
      data-state={open ? 'open' : 'closed'}
      aria-modal="true"
      aria-labelledby={sheet.hasTitle ? sheet.titleId : undefined}
      aria-describedby={sheet.hasDescription ? sheet.descriptionId : undefined}
      onCancel={handleCancel}
      onClick={handleClick}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        // Handle Escape here (preventing it also stops the native `cancel`),
        // so it behaves the same in every engine, jsdom included.
        if (!event.defaultPrevented && event.key === 'Escape') {
          event.preventDefault();
          sheet.requestOpenChange(false);
        }
      }}
      className={cn(
        // Reset the UA dialog box, then place it ourselves.
        'fixed m-0 max-h-[90dvh] overflow-y-auto border-0 bg-background p-0 text-sm text-foreground shadow-lg outline-none',
        // A scrim, not a theme colour: it must darken in light AND dark mode.
        'backdrop:bg-black/10',
        'opacity-100 transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none',
        SIDE_CLASSES[side],
        className
      )}
      {...props}
    >
      {open ? (
        <div data-slot="sheet-body" className="relative p-6">
          {children}
        </div>
      ) : null}
    </dialog>
  );
}

function SheetTitle({ className, id, ...props }: ComponentProps<'h2'>) {
  const sheet = useSheetContext('Title');
  const { registerTitle } = sheet;
  useLayoutEffect(() => {
    registerTitle(true);
    return () => registerTitle(false);
  }, [registerTitle]);
  return (
    <h2
      data-slot="sheet-title"
      id={id ?? sheet.titleId}
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, id, ...props }: ComponentProps<'p'>) {
  const sheet = useSheetContext('Description');
  const { registerDescription } = sheet;
  useLayoutEffect(() => {
    registerDescription(true);
    return () => registerDescription(false);
  }, [registerDescription]);
  return (
    <p
      data-slot="sheet-description"
      id={id ?? sheet.descriptionId}
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}

function SheetClose({ render, onClick, children, ...props }: SheetCloseProps) {
  const sheet = useSheetContext('Close');
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) sheet.requestOpenChange(false);
  };
  const closeProps = { ...props, 'data-slot': 'sheet-close', onClick: handleClick };
  if (render) {
    return renderElement(render, {
      ...closeProps,
      ...(children == null ? {} : { children }),
    } as ButtonHTMLAttributes<HTMLElement>);
  }
  return (
    <button type="button" {...closeProps}>
      {children}
    </button>
  );
}

/**
 * A modal sheet on the native `<dialog>` element: a bottom sheet on phones and
 * a centred dialog from `md` up. `showModal()` gives the top layer, an inert
 * background and a Tab trap for free; the component adds controlled state,
 * Escape / backdrop dismissal, scroll lock and focus return to the trigger.
 * The entry fade is skipped under `prefers-reduced-motion`.
 *
 * ```tsx
 * <Sheet>
 *   <Sheet.Trigger>Add child</Sheet.Trigger>
 *   <Sheet.Content>
 *     <Sheet.Title>Add child</Sheet.Title>
 *     <Sheet.Description>Only for this booking.</Sheet.Description>
 *     …
 *     <Sheet.Close aria-label="Close">×</Sheet.Close>
 *   </Sheet.Content>
 * </Sheet>
 * ```
 */
export const Sheet = Object.assign(SheetRoot, {
  Trigger: SheetTrigger,
  Content: SheetContent,
  Title: SheetTitle,
  Description: SheetDescription,
  Close: SheetClose,
});
