import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import type * as React from 'react';
interface DialogProps extends DialogPrimitive.Root.Props {
    /**
     * When false, prevents closing via backdrop/outside clicks.
     * Escape key and X button still work (WCAG compliance).
     * @default true
     */
    dismissible?: boolean;
}
declare function Dialog({ dismissible, ...props }: DialogProps): import("react/jsx-runtime").JSX.Element;
interface DialogTriggerProps extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>, 'render'> {
    render?: React.ReactElement;
}
declare function DialogTrigger({ render, children, ...props }: DialogTriggerProps): import("react/jsx-runtime").JSX.Element;
declare function DialogPortal({ ...props }: DialogPrimitive.Portal.Props): import("react/jsx-runtime").JSX.Element;
declare function DialogClose({ ...props }: DialogPrimitive.Close.Props): import("react/jsx-runtime").JSX.Element;
declare function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props): import("react/jsx-runtime").JSX.Element;
declare function DialogContent({ className, children, showCloseButton, ...props }: DialogPrimitive.Popup.Props & {
    showCloseButton?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare function DialogHeader({ className, ...props }: React.ComponentProps<'div'>): import("react/jsx-runtime").JSX.Element;
declare function DialogFooter({ className, children, ...props }: React.ComponentProps<'div'>): import("react/jsx-runtime").JSX.Element;
declare function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props): import("react/jsx-runtime").JSX.Element;
declare function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props): import("react/jsx-runtime").JSX.Element;
export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, };
