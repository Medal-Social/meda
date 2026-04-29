import { type ReactElement, type ReactNode } from 'react';
export type RenderElement<TProps extends {
    className?: string;
    children?: ReactNode;
}> = ReactElement<Partial<TProps>>;
export declare function renderElement<TProps extends {
    className?: string;
    children?: ReactNode;
}>(render: RenderElement<TProps>, props: TProps): ReactNode;
