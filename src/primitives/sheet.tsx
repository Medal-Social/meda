'use client';

import {
  type ButtonHTMLAttributes,
  type ComponentProps,
  createContext,
  isValidElement,
  type MouseEvent,
  type PointerEvent,
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
   * `false` ignores every close request (Escape, backdrop, `Sheet.Close`,
   * a native `dialog.close()`) — use it while a submit is in flight so the
   * sheet cannot vanish under the user. Default `true`.
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
  /** Class for the padded inner wrapper that holds the children. */
  bodyClassName?: string;
}

export interface SheetCloseProps extends ComponentProps<'button'> {
  /** Render as another element (e.g. a meda `Button`), merging close behaviour onto it. */
  render?: RenderElement<ButtonHTMLAttributes<HTMLElement>>;
}

interface SheetContextValue {
  open: boolean;
  dismissible: boolean;
  requestOpenChange: (open: boolean) => void;
  /** The id `Sheet.Title` actually rendered with, once it has mounted. */
  titleId: string | undefined;
  descriptionId: string | undefined;
  defaultTitleId: string;
  defaultDescriptionId: string;
  registerTitle: (id: string | undefined) => void;
  registerDescription: (id: string | undefined) => void;
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

// One page-wide scroll lock, reference-counted, so a second sheet closing
// cannot unlock the page under a first that is still open.
let scrollLocks = 0;
let scrollOverflowBefore = '';

function lockScroll() {
  const root = document.documentElement;
  if (scrollLocks === 0) {
    scrollOverflowBefore = root.style.overflow;
    root.style.overflow = 'hidden';
  }
  scrollLocks += 1;
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.documentElement.style.overflow = scrollOverflowBefore;
}

/**
 * A rendered host that is a bare `<button>` defaults to `type="submit"` inside
 * a form; give it `type="button"` unless the caller chose a type.
 */
function hostDefaults(render: RenderElement<ButtonHTMLAttributes<HTMLElement>>) {
  if (!isValidElement(render) || render.type !== 'button') return {};
  const own = (render.props as { type?: string }).type;
  return own === undefined ? { type: 'button' as const } : {};
}

/** A rendered `<a href>` must not navigate away from the sheet it opens or closes. */
function stopAnchorNavigation(event: MouseEvent<HTMLElement>) {
  if (event.currentTarget instanceof HTMLAnchorElement) event.preventDefault();
}

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
  const [titleId, registerTitle] = useState<string | undefined>(undefined);
  const [descriptionId, registerDescription] = useState<string | undefined>(undefined);
  const triggerRef = useRef<HTMLElement | null>(null);
  const defaultTitleId = useId();
  const defaultDescriptionId = useId();

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
        dismissible,
        requestOpenChange,
        titleId,
        descriptionId,
        defaultTitleId,
        defaultDescriptionId,
        registerTitle,
        registerDescription,
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
    stopAnchorNavigation(event);
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
      ...hostDefaults(render),
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
    'inset-x-0 top-auto bottom-0 w-full max-w-none rounded-t-2xl',
    'md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-full md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl'
  ),
  bottom: 'inset-x-0 top-auto bottom-0 w-full max-w-none rounded-t-2xl',
};

// Padding lives on the inner wrapper, never on the <dialog>: a click that
// lands on the <dialog> element itself is then always a backdrop click.
const BODY_CLASSES: Record<SheetSide, string> = {
  responsive: 'pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-6',
  bottom: 'pb-[max(1.5rem,env(safe-area-inset-bottom))]',
};

function SheetContent({
  side = 'responsive',
  className,
  bodyClassName,
  children,
  onCancel,
  onClick,
  onClose,
  onKeyDown,
  onPointerDown,
  ...props
}: SheetContentProps) {
  const sheet = useSheetContext('Content');
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const closingRef = useRef(false);
  const pressStartedOnBackdrop = useRef(false);
  const { open, dismissible, requestOpenChange } = sheet;

  const showDialog = useCallback((dialog: HTMLDialogElement) => {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      return;
    }
    dialog.setAttribute('open', '');
    // React focuses `autoFocus` children itself (it never renders the
    // attribute), so only pick a target when focus is still outside.
    if (dialog.contains(document.activeElement)) return;
    const target =
      dialog.querySelector<HTMLElement>('[autofocus]') ??
      dialog.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();
  }, []);

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
      showDialog(dialog);
      return;
    }
    if (!dialog.hasAttribute('open')) return;
    closingRef.current = true;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    closingRef.current = false;
    const restore = restoreRef.current;
    restoreRef.current = null;
    if (restore?.isConnected) restore.focus();
  }, [open, sheet.triggerRef, showDialog]);

  // The top layer does not stop the page behind from scrolling on touch
  // devices, so hold the root's overflow while the sheet is open.
  useEffect(() => {
    if (!open) return;
    lockScroll();
    return unlockScroll;
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
    if (!consumerPrevented) requestOpenChange(false);
  };

  // A close nobody asked React for — `<form method="dialog">`, a direct
  // `dialog.close()` — must not leave the state (and the scroll lock) open.
  const handleClose = (event: SyntheticEvent<HTMLDialogElement>) => {
    onClose?.(event);
    if (closingRef.current || !open) return;
    const dialog = event.currentTarget;
    if (!dismissible) {
      showDialog(dialog);
      return;
    }
    requestOpenChange(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDialogElement>) => {
    onPointerDown?.(event);
    pressStartedOnBackdrop.current = event.target === event.currentTarget;
  };

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    onClick?.(event);
    const startedOnBackdrop = pressStartedOnBackdrop.current;
    pressStartedOnBackdrop.current = false;
    if (event.defaultPrevented || event.target !== event.currentTarget) return;
    // A press that began inside (selecting text) and ended over the
    // backdrop is not a dismissal. `detail === 0` is a keyboard/synthetic
    // click, which has no pointerdown to compare against.
    if (!startedOnBackdrop && event.detail !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const inside =
      rect.width > 0 &&
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) requestOpenChange(false);
  };

  return (
    <dialog
      ref={dialogRef}
      data-slot="sheet"
      data-side={side}
      data-state={open ? 'open' : 'closed'}
      aria-modal="true"
      aria-labelledby={sheet.titleId}
      aria-describedby={sheet.descriptionId}
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        // Handle Escape here (preventing it also stops the native `cancel`),
        // so it behaves the same in every engine, jsdom included.
        if (!event.defaultPrevented && event.key === 'Escape') {
          event.preventDefault();
          requestOpenChange(false);
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
        <div
          data-slot="sheet-body"
          className={cn('relative p-6', BODY_CLASSES[side], bodyClassName)}
        >
          {children}
        </div>
      ) : null}
    </dialog>
  );
}

function SheetTitle({ className, id, ...props }: ComponentProps<'h2'>) {
  const sheet = useSheetContext('Title');
  const { registerTitle } = sheet;
  const resolvedId = id ?? sheet.defaultTitleId;
  useLayoutEffect(() => {
    registerTitle(resolvedId);
    return () => registerTitle(undefined);
  }, [registerTitle, resolvedId]);
  return (
    <h2
      data-slot="sheet-title"
      id={resolvedId}
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, id, ...props }: ComponentProps<'p'>) {
  const sheet = useSheetContext('Description');
  const { registerDescription } = sheet;
  const resolvedId = id ?? sheet.defaultDescriptionId;
  useLayoutEffect(() => {
    registerDescription(resolvedId);
    return () => registerDescription(undefined);
  }, [registerDescription, resolvedId]);
  return (
    <p
      data-slot="sheet-description"
      id={resolvedId}
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}

function SheetClose({ render, onClick, children, ...props }: SheetCloseProps) {
  const sheet = useSheetContext('Close');
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    stopAnchorNavigation(event);
    sheet.requestOpenChange(false);
  };
  const closeProps = { ...props, 'data-slot': 'sheet-close', onClick: handleClick };
  if (render) {
    return renderElement(render, {
      ...hostDefaults(render),
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
