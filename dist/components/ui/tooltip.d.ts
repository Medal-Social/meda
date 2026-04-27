import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
declare function TooltipProvider({ delay, ...props }: TooltipPrimitive.Provider.Props): import("react/jsx-runtime").JSX.Element;
declare function Tooltip({ ...props }: TooltipPrimitive.Root.Props): import("react/jsx-runtime").JSX.Element;
declare function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props): import("react/jsx-runtime").JSX.Element;
declare function TooltipContent({ className, side, sideOffset, align, alignOffset, children, ...props }: TooltipPrimitive.Popup.Props & Pick<TooltipPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>): import("react/jsx-runtime").JSX.Element;
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
