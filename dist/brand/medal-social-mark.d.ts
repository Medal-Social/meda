import type { SVGProps } from 'react';
export interface MedalSocialMarkProps extends SVGProps<SVGSVGElement> {
    title?: string;
    backgroundColor?: string;
    markColor?: string;
}
export declare function MedalSocialMark({ title, backgroundColor, markColor, role, focusable, 'aria-hidden': ariaHidden, ...props }: MedalSocialMarkProps): import("react/jsx-runtime").JSX.Element;
