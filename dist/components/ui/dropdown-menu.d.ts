import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import type * as React from 'react';
declare function DropdownMenu({ ...props }: MenuPrimitive.Root.Props): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props): import("react/jsx-runtime").JSX.Element;
interface DropdownMenuTriggerProps extends Omit<MenuPrimitive.Trigger.Props, 'render'> {
    render?: React.ReactElement | MenuPrimitive.Trigger.Props['render'];
}
declare function DropdownMenuTrigger({ render, children, ...props }: DropdownMenuTriggerProps): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuContent({ align, alignOffset, side, sideOffset, className, ...props }: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuLabel({ className, inset, ...props }: MenuPrimitive.GroupLabel.Props & {
    inset?: boolean;
}): import("react/jsx-runtime").JSX.Element;
interface MenuItemProps extends Omit<MenuPrimitive.Item.Props, 'render' | 'onClick' | 'onSelect'> {
    inset?: boolean;
    variant?: 'default' | 'destructive';
    render?: React.ReactElement;
    onClick?: MenuPrimitive.Item.Props['onClick'];
    onSelect?: MenuPrimitive.Item.Props['onClick'];
}
declare function DropdownMenuItem({ className, inset, variant, render, onClick, onSelect, children, ...props }: MenuItemProps): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuSubTrigger({ className, inset, children, ...props }: MenuPrimitive.SubmenuTrigger.Props & {
    inset?: boolean;
}): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuSubContent({ align, alignOffset, side, sideOffset, className, ...props }: React.ComponentProps<typeof DropdownMenuContent>): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuCheckboxItem({ className, children, checked, ...props }: MenuPrimitive.CheckboxItem.Props): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuRadioItem({ className, children, ...props }: MenuPrimitive.RadioItem.Props): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props): import("react/jsx-runtime").JSX.Element;
declare function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>): import("react/jsx-runtime").JSX.Element;
export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, type MenuItemProps, };
