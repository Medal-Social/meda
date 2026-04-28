import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
interface CheckboxProps extends CheckboxPrimitive.Root.Props {
    /** Show indeterminate (mixed) state - a dash instead of checkmark */
    indeterminate?: boolean;
}
declare function Checkbox({ className, indeterminate, ...props }: CheckboxProps): import("react/jsx-runtime").JSX.Element;
export type { CheckboxProps };
export { Checkbox };
