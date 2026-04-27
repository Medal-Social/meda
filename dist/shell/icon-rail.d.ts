import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
export interface IconRailItem {
    id: string;
    label: string;
    icon: LucideIcon;
    to: string;
    badge?: ReactNode;
}
export interface IconRailRenderLinkArgs {
    item: IconRailItem;
    isActive: boolean;
    className: string;
    children: ReactNode;
}
export interface IconRailProps {
    mainItems: IconRailItem[];
    utilityItems?: IconRailItem[];
    footer?: ReactNode;
    activeId?: string;
    renderLink?: (args: IconRailRenderLinkArgs) => ReactNode;
    className?: string;
}
export interface RailDividerProps {
    pinnedBottom: boolean;
    onToggle: () => void;
}
export declare function RailDivider({ pinnedBottom, onToggle }: RailDividerProps): import("react/jsx-runtime").JSX.Element;
export declare function IconRail({ mainItems, utilityItems, footer, activeId, renderLink, className, }: IconRailProps): import("react/jsx-runtime").JSX.Element | null;
